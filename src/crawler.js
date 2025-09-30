const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(url) {
  const clean = url.replace(/[^a-zA-Z0-9-_./]/g, '_');
  return clean.length > 200 ? clean.slice(0, 200) : clean;
}

function guessExtFromContentType(ct) {
  if (!ct) return null;
  const lower = ct.toLowerCase();
  if (lower.includes('application/wasm')) return '.wasm';
  if (lower.includes('javascript') || lower.includes('ecmascript') || lower.includes('text/js')) return '.js';
  return null;
}

function isWasmByMagic(bytes) {
  // 00 61 73 6d
  return bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d;
}

function isLikelyJsByHeuristics(ct, url) {
  if (ct && ct.toLowerCase().includes('javascript')) return true;
  if (/\.(?:m?js)(?:\?|#|$)/i.test(url)) return true;
  // Adicionar mais padrões comuns de URLs de JavaScript
  if (/\/js\//i.test(url)) return true;
  if (/\/javascript\//i.test(url)) return true;
  if (/\/scripts\//i.test(url)) return true;
  if (/\.min\.js/i.test(url)) return true;
  if (/\.bundle\.js/i.test(url)) return true;
  if (/\.chunk\.js/i.test(url)) return true;
  return false;
}

function isLikelyWasmByHeuristics(ct, url) {
  if (ct && ct.toLowerCase().includes('application/wasm')) return true;
  if (/\.(?:wasm)(?:\?|#|$)/i.test(url)) return true;
  if (/^data:application\/wasm(?:;|,)/i.test(url)) return true;
  // Adicionar mais padrões comuns de URLs de WASM
  if (/\/wasm\//i.test(url)) return true;
  if (/\/webassembly\//i.test(url)) return true;
  if (/\/canvas\//i.test(url)) return true;
  if (/\/canvas2d\//i.test(url)) return true;
  if (/\/webgl\//i.test(url)) return true;
  if (/\/flutter\//i.test(url)) return true;
  if (/\/canvaskit\//i.test(url)) return true;
  if (/\/emscripten\//i.test(url)) return true;
  if (/\/unity\//i.test(url)) return true;
  if (/\/unreal\//i.test(url)) return true;
  return false;
}

function targetPathFor(url, baseDir, defaultExt, contentType, mainSiteHostname = null) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  const pathname = urlObj.pathname;
  
  // Determinar o tipo de arquivo baseado na extensão ou content type
  let fileType = 'other';
  if (defaultExt === '.js' || (contentType && contentType.toLowerCase().includes('javascript'))) {
    fileType = 'js';
  } else if (defaultExt === '.wasm' || (contentType && contentType.toLowerCase().includes('application/wasm'))) {
    fileType = 'wasm';
  } else if (contentType) {
    if (contentType.toLowerCase().includes('css')) fileType = 'css';
    else if (contentType.toLowerCase().includes('image')) fileType = 'images';
    else if (contentType.toLowerCase().includes('font')) fileType = 'fonts';
    else if (contentType.toLowerCase().includes('json')) fileType = 'data';
  }
  
  // Criar nome do arquivo baseado na URL
  let fileName = pathname.replace(/^\//, '').replace(/\//g, '_');
  if (fileName === '' || fileName.endsWith('_')) fileName += 'index';
  
  // Adicionar extensão se não tiver
  const ext = path.extname(fileName) || defaultExt || guessExtFromContentType(contentType) || '';
  if (!path.extname(fileName)) fileName += ext || '';
  
  // Se temos um site principal e este não é o site principal, agrupar como serviço de terceiros
  let targetHostname = hostname;
  if (mainSiteHostname && hostname !== mainSiteHostname) {
    targetHostname = mainSiteHostname;
    // Criar subdiretório para o serviço de terceiros
    const serviceName = sanitizeFilename(hostname);
    fileName = `${serviceName}_${fileName}`;
  }
  
  // Estrutura: baseDir/hostname/fileType/filename
  return path.join(baseDir, sanitizeFilename(targetHostname), fileType, sanitizeFilename(fileName));
}

async function saveBuffer(filePath, buffer) {
  ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, buffer);
}

async function crawl(startUrl, outDir, { maxPages = 1, headless = true } = {}) {
  ensureDir(outDir);

  // Extrair o hostname do site principal para agrupar serviços de terceiros
  const mainSiteHostname = new URL(startUrl).hostname;

  const browser = await chromium.launch({ 
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const context = await browser.newContext({
    javaScriptEnabled: true,
    bypassCSP: true,
    serviceWorkers: 'allow',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });

  // Track visited pages to avoid infinite crawl if you expand beyond one page
  const toVisit = [startUrl];
  const visited = new Set();

  // A set to dedupe saved URLs
  const saved = new Set();

  // Listen at the context level to catch everything (including workers/SWs)
  console.log('[DEBUG] Setting up response listener...');
  
  // Store pending responses to process them asynchronously
  const pendingResponses = new Map();
  
  context.on('response', async (response) => {
    try {
      const url = response.url();
      if (!url || saved.has(url)) return;

      const req = response.request();
      const resourceType = req.resourceType(); // document, script, fetch, xhr, worker, etc.
      const headers = response.headers();
      const contentType = headers['content-type'] || headers['Content-Type'];

      console.log(`[DEBUG] Resource: ${url}`);
      console.log(`[DEBUG] Type: ${resourceType}, Content-Type: ${contentType}`);

      // We only attempt to save if it is JS or WASM by heuristics, or data: wasm
      const isWasmHeur = isLikelyWasmByHeuristics(contentType, url);
      const isJsHeur = isLikelyJsByHeuristics(contentType, url);
      
      // Também considerar recursos do tipo 'script' como potencialmente JavaScript
      const isScriptResource = resourceType === 'script';
      
      // Considerar recursos com Content-Type que pode ser JavaScript
      const isJsByContentType = contentType && (
        contentType.toLowerCase().includes('javascript') ||
        contentType.toLowerCase().includes('ecmascript') ||
        contentType.toLowerCase().includes('text/js') ||
        contentType.toLowerCase().includes('application/javascript') ||
        contentType.toLowerCase().includes('application/x-javascript')
      );

      console.log(`[DEBUG] isWasmHeur: ${isWasmHeur}, isJsHeur: ${isJsHeur}, isScriptResource: ${isScriptResource}, isJsByContentType: ${isJsByContentType}`);
      if (isWasmHeur) {
        console.log(`[DEBUG] WASM detected by heuristics: ${url}`);
      }

      // Verificar se é um recurso que vale a pena processar
      const shouldProcess = isWasmHeur || isJsHeur || isScriptResource || isJsByContentType || resourceType === 'script';
      
      if (!shouldProcess) {
        // Short-circuit for non .js/.wasm resources
        console.log(`[DEBUG] Skipping non-JS/WASM resource: ${url}`);
        return;
      }

      // For WASM files, try to process immediately with error handling
      if (isWasmHeur) {
        console.log(`[DEBUG] Processing WASM response immediately: ${url}`);
        try {
          const body = await response.body();
          if (body && body.length > 0) {
            const isWasmMagic = isWasmByMagic(body);
            console.log(`[DEBUG] WASM magic bytes detected: ${isWasmMagic}, body length: ${body.length}`);
            
            const filePath = targetPathFor(url, outDir, '.wasm', 'application/wasm', mainSiteHostname);
            console.log(`[DEBUG] Saving WASM file: ${url} -> ${filePath}`);
            await saveBuffer(filePath, body);
            saved.add(url);
            console.log(`[DEBUG] Successfully saved WASM: ${url}`);
          } else {
            console.log(`[DEBUG] Empty body for WASM: ${url}`);
          }
        } catch (e) {
          console.log(`[DEBUG] Failed to process WASM immediately ${url}: ${e.message}`);
          // Fallback: queue for later processing
          console.log(`[DEBUG] Queuing WASM response for async processing: ${url}`);
          pendingResponses.set(url, response);
        }
        return;
      }

      // Get the body
      let body;
      try {
        body = await response.body();
        console.log(`[DEBUG] Body length: ${body ? body.length : 'null'}`);
      } catch (e) {
        // Some responses (like opaque responses or certain data/blob URLs) may not return a body
        console.log(`[DEBUG] Failed to get body for ${url}: ${e.message}`);
        return;
      }
      if (!body || body.length === 0) {
        console.log(`[DEBUG] Empty body for ${url}`);
        return;
      }

      // WASM detection by magic regardless of headers/URL
      const isWasmMagic = isWasmByMagic(body);
      
      // Detectar JavaScript pelo conteúdo (verificar se contém padrões típicos de JS)
      let isJsByContent = false;
      if (body.length > 0 && !isWasmMagic) {
        try {
          const text = body.toString('utf8', 0, Math.min(1000, body.length));
          // Verificar padrões típicos de JavaScript
          isJsByContent = /(?:function|var|let|const|=>|import|export|class|async|await|console\.|document\.|window\.)/.test(text);
        } catch (e) {
          // Ignorar erros de decodificação
        }
      }

      console.log(`[DEBUG] isWasmMagic: ${isWasmMagic}, isJsByContent: ${isJsByContent}`);
      if (isWasmMagic) {
        console.log(`[DEBUG] WASM detected by magic bytes: ${url}`);
      }

      // Decide final classification and path
      let defaultExt = null;
      if (isWasmHeur || isWasmMagic) {
        defaultExt = '.wasm';
      } else if (isJsHeur || isScriptResource || isJsByContentType || isJsByContent) {
        defaultExt = '.js';
      } else if (resourceType === 'script') {
        // Se for um script mas não detectamos como JS, ainda assim salvar como .js
        defaultExt = '.js';
        console.log(`[DEBUG] Forcing .js extension for script resource: ${url}`);
      }

      // If data: URL, provide a synthetic path
      let filePath;
      if (url.startsWith('data:')) {
        const syntheticName = `inline/${Date.now()}_${Math.random().toString(36).slice(2)}${defaultExt || ''}`;
        filePath = path.join(outDir, syntheticName);
      } else {
        filePath = targetPathFor(url, outDir, defaultExt, contentType, mainSiteHostname);
      }

      console.log(`[DEBUG] Saving to: ${filePath}`);
      if (defaultExt === '.wasm') {
        console.log(`[DEBUG] Saving WASM file: ${url} -> ${filePath}`);
      }
      await saveBuffer(filePath, body);
      saved.add(url);
      console.log(`[DEBUG] Successfully saved: ${url}`);

      // If JS, also scan for embedded data:application/wasm;base64 to extract inline wasm
      if ((defaultExt === '.js' || isJsHeur) && body.length > 0) {
        try {
          const text = body.toString('utf8');
          const dataUrlRegex = /data:application\/wasm;base64,([A-Za-z0-9+/=]+)/g;
          let match;
          while ((match = dataUrlRegex.exec(text)) !== null) {
            const base64 = match[1];
            const wasmBuf = Buffer.from(base64, 'base64');
            if (wasmBuf.length > 0 && isWasmByMagic(wasmBuf)) {
              const inlinePath = path.join(outDir, `inline/embedded_${Date.now()}_${Math.random().toString(36).slice(2)}.wasm`);
              await saveBuffer(inlinePath, wasmBuf);
            }
          }
        } catch {
          // ignore decoding issues
        }
      }
    } catch {
      // swallow handler errors to not break the crawl
    }
  });

  // Function to process pending WASM responses
  async function processPendingResponses() {
    console.log(`[DEBUG] Processing ${pendingResponses.size} pending WASM responses...`);
    for (const [url, response] of pendingResponses) {
      try {
        console.log(`[DEBUG] Processing pending WASM response: ${url}`);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const bodyPromise = response.body();
        const body = await Promise.race([bodyPromise, timeoutPromise]);
        
        if (body && body.length > 0) {
          const isWasmMagic = isWasmByMagic(body);
          console.log(`[DEBUG] WASM magic bytes detected: ${isWasmMagic}, body length: ${body.length}`);
          
          const filePath = targetPathFor(url, outDir, '.wasm', 'application/wasm');
          console.log(`[DEBUG] Saving WASM file: ${url} -> ${filePath}`);
          await saveBuffer(filePath, body);
          saved.add(url);
          console.log(`[DEBUG] Successfully saved WASM: ${url}`);
        } else {
          console.log(`[DEBUG] Empty body for pending WASM: ${url}`);
        }
      } catch (e) {
        console.log(`[DEBUG] Failed to process pending WASM ${url}: ${e.message}`);
      }
    }
    pendingResponses.clear();
  }

  // Intercept requests to handle WASM files specially
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Check if this is a WASM request
    if (url.includes('compile') && url.includes('wasi') && url.includes('target=arduino')) {
      console.log(`[DEBUG] Intercepting WASM request: ${url}`);
      
      // Continue the request but intercept the response
      const response = await route.fetch();
      
      if (response.ok()) {
        try {
          const body = await response.body();
          if (body && body.length > 0) {
            const isWasmMagic = isWasmByMagic(body);
            console.log(`[DEBUG] Intercepted WASM: magic bytes detected: ${isWasmMagic}, body length: ${body.length}`);
            
            const filePath = targetPathFor(url, outDir, '.wasm', 'application/wasm', mainSiteHostname);
            console.log(`[DEBUG] Saving intercepted WASM file: ${url} -> ${filePath}`);
            await saveBuffer(filePath, body);
            saved.add(url);
            console.log(`[DEBUG] Successfully saved intercepted WASM: ${url}`);
          }
        } catch (e) {
          console.log(`[DEBUG] Failed to process intercepted WASM ${url}: ${e.message}`);
        }
      }
      
      // Return the response to the page
      await route.fulfill({ response });
    } else {
      // Continue normally for other requests
      route.continue();
    }
  });

  while (toVisit.length && visited.size < maxPages) {
    const url = toVisit.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    const page = await context.newPage();

    // Capture navigations and modulepreload links to extend crawl (optional)
    page.on('frameattached', (frame) => {
      // Could track frame URLs here if you expand the crawl
    });

    // Função para tentar navegar com retry
    async function navigateWithRetry(page, url, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[DEBUG] Navigating to: ${url} (attempt ${attempt}/${maxRetries})`);
          const response = await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });
          console.log(`[DEBUG] Page loaded successfully: ${url}`);
          console.log(`[DEBUG] Response status: ${response ? response.status() : 'unknown'}`);
          return response;
        } catch (error) {
          console.log(`[DEBUG] Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Aguardar antes de tentar novamente
          const waitTime = attempt * 2000; // 2s, 4s, 6s...
          console.log(`[DEBUG] Waiting ${waitTime}ms before retry...`);
          await page.waitForTimeout(waitTime);
        }
      }
    }

    try {
      const response = await navigateWithRetry(page, url);
      
      // Aguardar mais tempo para garantir que todos os recursos sejam carregados, incluindo WASM
      await page.waitForTimeout(5000);
      console.log(`[DEBUG] Waiting for resources to load...`);
      
      // Aguardar especificamente por requests de WASM
      console.log(`[DEBUG] Waiting for WASM requests...`);
      await page.waitForTimeout(2000);
      
      // Process any pending WASM responses before closing the page
      await processPendingResponses();
      
      // Collect more links if you want to expand
      if (visited.size < maxPages) {
        const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href).filter(Boolean));
        // Stay on same origin to be safe
        const origin = new URL(url).origin;
        for (const href of links) {
          try {
            if (new URL(href).origin === origin && !visited.has(href)) toVisit.push(href);
          } catch {}
        }
      }
    } catch (e) {
      if (e.message.includes('ERR_CONNECTION_RESET')) {
        console.error(`[ERROR] Connection reset for ${url}. This might be due to:`);
        console.error(`  - Anti-bot protection`);
        console.error(`  - Server overload`);
        console.error(`  - Network issues`);
        console.error(`  - Rate limiting`);
      } else if (e.message.includes('ERR_TIMED_OUT')) {
        console.error(`[ERROR] Timeout for ${url}. Server took too long to respond.`);
      } else if (e.message.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error(`[ERROR] DNS resolution failed for ${url}. Check if the domain exists.`);
      } else if (e.message.includes('ERR_SSL')) {
        console.error(`[ERROR] SSL/TLS error for ${url}. Certificate or protocol issues.`);
      } else {
        console.error(`[ERROR] Navigation failed for ${url}:`, e.message);
      }
    } finally {
      await page.close();
    }
  }

  // Process any remaining pending responses before closing
  await processPendingResponses();
  
  await context.close();
  await browser.close();
}

// Exportar a função para uso em outros módulos
module.exports = { crawl };

if (require.main === module) {
  const startUrl = process.argv[2];
  const outDir = process.argv[3] || path.resolve(process.cwd(), 'downloads');
  const maxPages = Number(process.argv[4] || '1');

  if (!startUrl) {
    console.error('Usage: node crawler.js <startUrl> [outDir] [maxPages]');
    process.exit(1);
  }

  console.log(`Starting crawl of: ${startUrl}`);
  console.log(`Output directory: ${outDir}`);
  console.log(`Max pages: ${maxPages}`);
  
  crawl(startUrl, outDir, { maxPages })
    .then(() => {
      console.log('Crawl completed successfully!');
      console.log(`Check the output directory: ${outDir}`);
    })
    .catch((err) => {
      console.error('Crawl failed:', err);
      process.exit(1);
    });
}