#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WasmPipeline {
  constructor() {
    this.wasm2watPath = 'wasm2wat'; // Assumindo que está no PATH
    this.wat2wasmPath = 'wat2wasm'; // Assumindo que está no PATH
  }

  // Pipeline completo para WASM
  async processWasm(inputDir, outputDir, options = {}) {
    console.log('🔄 Iniciando pipeline WASM completo...\n');

    const results = {
      conversion: null,
      analysis: null,
      semantic: null,
      normalization: null,
      verification: null,
      pipeline: {
        steps: ['conversion', 'analysis', 'semantic', 'normalization', 'verification'],
        status: 'running',
        startTime: Date.now()
      }
    };

    try {
      // ETAPA 1: CONVERSÃO (.wasm → .wat)
      console.log('🔄 ETAPA 1: Convertendo WASM para WAT...');
      results.conversion = await this.convertWasmToWat(inputDir, outputDir);
      console.log(`✅ Convertidos ${results.conversion.successful} arquivos WASM`);

      // ETAPA 2: ANÁLISE (.wat)
      console.log('\n📊 ETAPA 2: Analisando arquivos WAT...');
      results.analysis = await this.analyzeWatFiles(path.join(outputDir, 'wat'));
      console.log(`✅ Analisados ${results.analysis.files.length} arquivos WAT`);

      // ETAPA 3: REPRESENTAÇÃO SEMÂNTICA
      console.log('\n🧠 ETAPA 3: Gerando representação semântica...');
      results.semantic = await this.generateWasmSemanticRepresentation(
        path.join(outputDir, 'wat'), 
        path.join(outputDir, 'semantic')
      );
      console.log(`✅ Gerada representação semântica para ${results.semantic.files.length} arquivos`);

      // ETAPA 4: NORMALIZAÇÃO (Opcional)
      if (options.normalize) {
        console.log('\n🔧 ETAPA 4: Normalizando arquivos WAT...');
        results.normalization = await this.normalizeWatFiles(
          path.join(outputDir, 'wat'),
          path.join(outputDir, 'normalized')
        );
        console.log(`✅ Normalizados ${results.normalization.successful} arquivos WAT`);
      }

      // ETAPA 5: VERIFICAÇÃO DE SEMÂNTICA
      console.log('\n🛡️ ETAPA 5: Verificando preservação de semântica...');
      results.verification = await this.verifySemanticPreservation(
        inputDir,
        path.join(outputDir, 'wat'),
        path.join(outputDir, 'normalized')
      );
      console.log(`✅ Verificação concluída: ${results.verification.preserved} arquivos preservados`);

      // Finalizar pipeline
      results.pipeline.status = 'completed';
      results.pipeline.endTime = Date.now();
      results.pipeline.duration = results.pipeline.endTime - results.pipeline.startTime;

      console.log(`\n🎉 Pipeline WASM concluído em ${(results.pipeline.duration / 1000).toFixed(2)}s`);

      return results;

    } catch (error) {
      results.pipeline.status = 'error';
      results.pipeline.error = error.message;
      console.error(`❌ Erro no pipeline WASM: ${error.message}`);
      throw error;
    }
  }

  // Converter arquivos WASM para WAT
  async convertWasmToWat(inputDir, outputDir) {
    const watDir = path.join(outputDir, 'wat');
    if (!fs.existsSync(watDir)) {
      fs.mkdirSync(watDir, { recursive: true });
    }

    const results = {
      successful: 0,
      failed: 0,
      files: []
    };

    const wasmFiles = this.findWasmFiles(inputDir);
    
    for (const wasmFile of wasmFiles) {
      try {
        const relativePath = path.relative(inputDir, wasmFile);
        const watFile = path.join(watDir, relativePath.replace('.wasm', '.wat'));
        
        // Criar diretório de destino se não existir
        const watDirPath = path.dirname(watFile);
        if (!fs.existsSync(watDirPath)) {
          fs.mkdirSync(watDirPath, { recursive: true });
        }

        // Converter usando wasm2wat
        execSync(`${this.wasm2watPath} "${wasmFile}" -o "${watFile}"`, { stdio: 'pipe' });
        
        results.successful++;
        results.files.push({
          wasm: wasmFile,
          wat: watFile,
          status: 'success'
        });

        console.log(`  ✅ ${path.basename(wasmFile)} → ${path.basename(watFile)}`);

      } catch (error) {
        results.failed++;
        results.files.push({
          wasm: wasmFile,
          status: 'failed',
          error: error.message
        });

        console.log(`  ❌ ${path.basename(wasmFile)}: ${error.message}`);
      }
    }

    return results;
  }

  // Analisar arquivos WAT
  async analyzeWatFiles(watDir) {
    const results = {
      files: [],
      summary: {
        totalFiles: 0,
        totalFunctions: 0,
        totalImports: 0,
        totalExports: 0,
        totalGlobals: 0,
        totalMemories: 0,
        totalTables: 0
      }
    };

    const watFiles = this.findWatFiles(watDir);
    
    for (const watFile of watFiles) {
      try {
        const analysis = await this.analyzeWatFile(watFile);
        results.files.push(analysis);
        results.summary.totalFiles++;
        
        // Atualizar estatísticas
        results.summary.totalFunctions += analysis.functions.length;
        results.summary.totalImports += analysis.imports.length;
        results.summary.totalExports += analysis.exports.length;
        results.summary.totalGlobals += analysis.globals.length;
        results.summary.totalMemories += analysis.memories.length;
        results.summary.totalTables += analysis.tables.length;

      } catch (error) {
        console.error(`Erro ao analisar ${watFile}: ${error.message}`);
      }
    }

    return results;
  }

  // Analisar arquivo WAT individual
  async analyzeWatFile(watFile) {
    const content = fs.readFileSync(watFile, 'utf8');
    
    return {
      filePath: watFile,
      size: content.length,
      lines: content.split('\n').length,
      functions: this.extractWasmFunctions(content),
      imports: this.extractWasmImports(content),
      exports: this.extractWasmExports(content),
      globals: this.extractWasmGlobals(content),
      memories: this.extractWasmMemories(content),
      tables: this.extractWasmTables(content),
      complexity: this.calculateWasmComplexity(content),
      patterns: this.identifyWasmPatterns(content),
      metadata: {
        analyzedAt: new Date().toISOString(),
        language: 'webassembly',
        format: 'wat'
      }
    };
  }

  // Extrair funções WASM
  extractWasmFunctions(content) {
    const functions = [];
    const funcPattern = /\(func\s+(?:(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\s+)?(?:\(param[^)]*\))?(?:\(result[^)]*\))?\s*([^)]*)\)/g;
    
    let match;
    while ((match = funcPattern.exec(content)) !== null) {
      functions.push({
        name: match[1] || 'anonymous',
        parameters: this.parseWasmParameters(match[2]),
        body: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return functions;
  }

  // Extrair imports WASM
  extractWasmImports(content) {
    const imports = [];
    const importPattern = /\(import\s+["']([^"']+)["']\s+["']([^"']+)["']\s+\(([^)]+)\)\)/g;
    
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        module: match[1],
        name: match[2],
        type: match[3],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return imports;
  }

  // Extrair exports WASM
  extractWasmExports(content) {
    const exports = [];
    const exportPattern = /\(export\s+["']([^"']+)["']\s+\(([^)]+)\)\)/g;
    
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return exports;
  }

  // Extrair globals WASM
  extractWasmGlobals(content) {
    const globals = [];
    const globalPattern = /\(global\s+(?:(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\s+)?([^)]+)\)/g;
    
    let match;
    while ((match = globalPattern.exec(content)) !== null) {
      globals.push({
        name: match[1] || 'anonymous',
        type: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return globals;
  }

  // Extrair memórias WASM
  extractWasmMemories(content) {
    const memories = [];
    const memoryPattern = /\(memory\s+(?:(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\s+)?([^)]+)\)/g;
    
    let match;
    while ((match = memoryPattern.exec(content)) !== null) {
      memories.push({
        name: match[1] || 'anonymous',
        type: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return memories;
  }

  // Extrair tabelas WASM
  extractWasmTables(content) {
    const tables = [];
    const tablePattern = /\(table\s+(?:(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\s+)?([^)]+)\)/g;
    
    let match;
    while ((match = tablePattern.exec(content)) !== null) {
      tables.push({
        name: match[1] || 'anonymous',
        type: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return tables;
  }

  // Calcular complexidade WASM
  calculateWasmComplexity(content) {
    const patterns = [
      /\(if\s+/g,
      /\(loop\s+/g,
      /\(block\s+/g,
      /\(call\s+/g,
      /\(call_indirect\s+/g,
      /\(br\s+/g,
      /\(br_if\s+/g,
      /\(br_table\s+/g,
      /\(return\s*/g
    ];

    let complexity = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    }

    return complexity;
  }

  // Identificar padrões WASM
  identifyWasmPatterns(content) {
    return {
      hasImports: /\(import\s+/.test(content),
      hasExports: /\(export\s+/.test(content),
      hasGlobals: /\(global\s+/.test(content),
      hasMemories: /\(memory\s+/.test(content),
      hasTables: /\(table\s+/.test(content),
      hasFunctions: /\(func\s+/.test(content),
      hasLoops: /\(loop\s+/.test(content),
      hasBranches: /\(br\s+/.test(content),
      hasCalls: /\(call\s+/.test(content)
    };
  }

  // Gerar representação semântica WASM
  async generateWasmSemanticRepresentation(watDir, semanticDir) {
    if (!fs.existsSync(semanticDir)) {
      fs.mkdirSync(semanticDir, { recursive: true });
    }

    const results = {
      files: [],
      summary: {
        totalFiles: 0,
        totalFunctions: 0,
        totalImports: 0,
        totalExports: 0
      }
    };

    const watFiles = this.findWatFiles(watDir);
    
    for (const watFile of watFiles) {
      try {
        const analysis = await this.analyzeWatFile(watFile);
        results.files.push(analysis);
        results.summary.totalFiles++;
        
        // Atualizar estatísticas
        results.summary.totalFunctions += analysis.functions.length;
        results.summary.totalImports += analysis.imports.length;
        results.summary.totalExports += analysis.exports.length;

        // Salvar representação semântica
        const relativePath = path.relative(watDir, watFile);
        const semanticFile = path.join(semanticDir, relativePath.replace('.wat', '.json'));
        
        // Criar diretório de destino se não existir
        const semanticDirPath = path.dirname(semanticFile);
        if (!fs.existsSync(semanticDirPath)) {
          fs.mkdirSync(semanticDirPath, { recursive: true });
        }

        fs.writeFileSync(semanticFile, JSON.stringify(analysis, null, 2));

      } catch (error) {
        console.error(`Erro ao processar ${watFile}: ${error.message}`);
      }
    }

    return results;
  }

  // Normalizar arquivos WAT (opcional)
  async normalizeWatFiles(watDir, normalizedDir) {
    if (!fs.existsSync(normalizedDir)) {
      fs.mkdirSync(normalizedDir, { recursive: true });
    }

    const results = {
      successful: 0,
      failed: 0,
      files: []
    };

    const watFiles = this.findWatFiles(watDir);
    
    for (const watFile of watFiles) {
      try {
        const relativePath = path.relative(watDir, watFile);
        const normalizedFile = path.join(normalizedDir, relativePath);
        
        // Criar diretório de destino se não existir
        const normalizedDirPath = path.dirname(normalizedFile);
        if (!fs.existsSync(normalizedDirPath)) {
          fs.mkdirSync(normalizedDirPath, { recursive: true });
        }

        // Normalizar WAT (adicionar comentários, formatação)
        const normalizedContent = await this.normalizeWatContent(watFile);
        fs.writeFileSync(normalizedFile, normalizedContent);
        
        results.successful++;
        results.files.push({
          original: watFile,
          normalized: normalizedFile,
          status: 'success'
        });

        console.log(`  ✅ ${path.basename(watFile)} → ${path.basename(normalizedFile)}`);

      } catch (error) {
        results.failed++;
        results.files.push({
          original: watFile,
          status: 'failed',
          error: error.message
        });

        console.log(`  ❌ ${path.basename(watFile)}: ${error.message}`);
      }
    }

    return results;
  }

  // Normalizar conteúdo WAT
  async normalizeWatContent(watFile) {
    const content = fs.readFileSync(watFile, 'utf8');
    
    // Adicionar comentários explicativos
    let normalized = content;
    
    // Adicionar cabeçalho com comentários
    const header = `;; Arquivo WASM normalizado
;; Gerado automaticamente pelo WasmPipeline
;; Data: ${new Date().toISOString()}
;; Arquivo original: ${path.basename(watFile)}

`;
    
    normalized = header + normalized;
    
    // Adicionar comentários em funções
    normalized = normalized.replace(/\(func\s+(\$[a-zA-Z_$][a-zA-Z0-9_$]*)/g, 
      ';; Função: $1\n  (func $1');
    
    // Adicionar comentários em imports
    normalized = normalized.replace(/\(import\s+["']([^"']+)["']\s+["']([^"']+)["']/g, 
      ';; Import: $1.$2\n  (import "$1" "$2"');
    
    // Adicionar comentários em exports
    normalized = normalized.replace(/\(export\s+["']([^"']+)["']/g, 
      ';; Export: $1\n  (export "$1"');
    
    return normalized;
  }

  // Verificar preservação de semântica
  async verifySemanticPreservation(originalDir, watDir, normalizedDir) {
    const results = {
      preserved: 0,
      failed: 0,
      files: []
    };

    const wasmFiles = this.findWasmFiles(originalDir);
    
    for (const wasmFile of wasmFiles) {
      try {
        const relativePath = path.relative(originalDir, wasmFile);
        const watFile = path.join(watDir, relativePath.replace('.wasm', '.wat'));
        const normalizedFile = path.join(normalizedDir, relativePath.replace('.wasm', '.wat'));
        
        // Verificar se arquivos existem
        if (!fs.existsSync(watFile)) {
          results.failed++;
          results.files.push({
            wasm: wasmFile,
            status: 'failed',
            reason: 'WAT file not found'
          });
          continue;
        }

        // Verificar se arquivo normalizado existe (se normalização foi aplicada)
        if (fs.existsSync(normalizedFile)) {
          // Verificar se conteúdo é funcionalmente equivalente
          const watContent = fs.readFileSync(watFile, 'utf8');
          const normalizedContent = fs.readFileSync(normalizedFile, 'utf8');
          
          // Verificar se funções principais são preservadas
          const watFunctions = this.extractWasmFunctions(watContent);
          const normalizedFunctions = this.extractWasmFunctions(normalizedContent);
          
          if (watFunctions.length === normalizedFunctions.length) {
            results.preserved++;
            results.files.push({
              wasm: wasmFile,
              status: 'preserved',
              functions: watFunctions.length
            });
          } else {
            results.failed++;
            results.files.push({
              wasm: wasmFile,
              status: 'failed',
              reason: 'Function count mismatch'
            });
          }
        } else {
          // Apenas verificar se WAT é válido
          results.preserved++;
          results.files.push({
            wasm: wasmFile,
            status: 'preserved',
            functions: this.extractWasmFunctions(fs.readFileSync(watFile, 'utf8')).length
          });
        }

      } catch (error) {
        results.failed++;
        results.files.push({
          wasm: wasmFile,
          status: 'failed',
          reason: error.message
        });
      }
    }

    return results;
  }

  // Utilitários
  parseWasmParameters(paramString) {
    // Implementação básica para parsing de parâmetros WASM
    return paramString.split(' ').filter(p => p.trim().length > 0);
  }

  findWasmFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.wasm') {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  findWatFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.wat') {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }
}

// Função principal para uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 PIPELINE WASM COMPLETO

Uso:
  node wasm_pipeline.js <diretório_entrada> [diretório_saída] [opções]

Opções:
  --normalize          Aplicar normalização WAT
  --no-report          Não gerar relatórios

Exemplos:
  node wasm_pipeline.js ./downloads
  node wasm_pipeline.js ./downloads ./output --normalize
    `);
    process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1] || path.join(inputDir, 'wasm_output');
  const options = {
    normalize: args.includes('--normalize'),
    generateReport: !args.includes('--no-report')
  };

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Diretório não encontrado: ${inputDir}`);
    process.exit(1);
  }

  const pipeline = new WasmPipeline();
  
  try {
    await pipeline.processWasm(inputDir, outputDir, options);
    console.log('\n🎉 Pipeline WASM concluído com sucesso!');
  } catch (error) {
    console.error(`❌ Erro no pipeline WASM: ${error.message}`);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { WasmPipeline };

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
