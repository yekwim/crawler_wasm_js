const { chromium } = require('playwright');

async function debugCrawler() {
  console.log('🔍 Iniciando debug do crawler...');
  
  try {
    console.log('1. Lançando browser...');
    const browser = await chromium.launch({ 
      headless: false, // Mostrar browser para debug
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
    
    console.log('✓ Browser lançado');
    
    const context = await browser.newContext({
      javaScriptEnabled: true,
      bypassCSP: true,
      serviceWorkers: 'allow',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log('✓ Context criado');
    
    const page = await context.newPage();
    console.log('✓ Página criada');
    
    // Adicionar listener para responses
    let responseCount = 0;
    context.on('response', (response) => {
      responseCount++;
      console.log(`📄 Response ${responseCount}: ${response.url()}`);
    });
    
    console.log('2. Navegando para webdollar.io...');
    const response = await page.goto('https://webdollar.io', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    console.log(`✓ Página carregada: ${response.status()}`);
    
    console.log('3. Aguardando recursos...');
    await page.waitForTimeout(5000);
    
    console.log(`📊 Total de responses capturadas: ${responseCount}`);
    
    await browser.close();
    console.log('✓ Browser fechado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugCrawler();
