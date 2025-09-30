#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ASTParser } = require('../analyzers/ast_parser.js');
const { EnhancedWasmAnalyzer } = require('../analyzers/enhanced_wasm_analyzer.js');
const { CodeAnalyzer } = require('../analyzers/parser.js');
const { CodeNormalizer } = require('../analyzers/normalizer.js');

class IntegratedPipeline {
  constructor(options = {}) {
    this.options = {
      inputDir: options.inputDir || './downloads',
      outputDir: options.outputDir || './analysis_output',
      generateReports: options.generateReports !== false,
      analyzeMining: options.analyzeMining !== false,
      ...options
    };
    
    this.astParser = new ASTParser();
    this.wasmAnalyzer = new EnhancedWasmAnalyzer();
    this.codeAnalyzer = new CodeAnalyzer();
    this.normalizer = new CodeNormalizer();
    
    this.results = {
      javascript: [],
      wasm: [],
      summary: {
        totalFiles: 0,
        jsFiles: 0,
        wasmFiles: 0,
        miningDetected: 0,
        highConfidenceMining: 0,
        analysisErrors: 0
      }
    };
  }

  // Executar pipeline completo
  async run() {
    console.log('🚀 Iniciando Pipeline Integrado de Análise...');
    console.log(`📁 Diretório de entrada: ${this.options.inputDir}`);
    console.log(`📁 Diretório de saída: ${this.options.outputDir}`);
    
    try {
      // Criar diretório de saída
      this.ensureOutputDirectory();
      
      // Encontrar todos os ficheiros
      const files = this.findAllFiles(this.options.inputDir);
      console.log(`🔍 Encontrados ${files.js.length} ficheiros JS e ${files.wasm.length} ficheiros WASM`);
      
      // Processar ficheiros JavaScript
      if (files.js.length > 0) {
        console.log('\n📄 Processando ficheiros JavaScript...');
        await this.processJavaScriptFiles(files.js);
      }
      
      // Processar ficheiros WASM
      if (files.wasm.length > 0) {
        console.log('\n🔧 Processando ficheiros WASM...');
        await this.processWasmFiles(files.wasm);
      }
      
      // Gerar relatórios
      if (this.options.generateReports) {
        console.log('\n📊 Gerando relatórios...');
        await this.generateReports();
      }
      
      // Salvar resultados em JSON
      await this.saveResults();
      
      console.log('\n✅ Pipeline concluído com sucesso!');
      this.printSummary();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Erro no pipeline:', error.message);
      throw error;
    }
  }

  // Encontrar todos os ficheiros
  findAllFiles(dirPath) {
    const files = { js: [], wasm: [] };
    
    function traverse(currentDir) {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            traverse(fullPath);
          } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (ext === '.js') {
              files.js.push(fullPath);
            } else if (ext === '.wat') {
              files.wasm.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao acessar diretório ${currentDir}: ${error.message}`);
      }
    }
    
    traverse(dirPath);
    return files;
  }

  // Processar ficheiros JavaScript
  async processJavaScriptFiles(jsFiles) {
    for (const filePath of jsFiles) {
      try {
        console.log(`  📄 Analisando: ${path.basename(filePath)}`);
        
        // Análise AST
        const astResult = this.astParser.parseFile(filePath);
        
        // Análise tradicional (para comparação)
        const content = fs.readFileSync(filePath, 'utf8');
        const traditionalAnalysis = this.codeAnalyzer.analyzeJavaScript(filePath);
        
        // Normalização (se necessário)
        let normalized = null;
        if (traditionalAnalysis.obfuscation.detected) {
          normalized = this.normalizer.normalizeCode(content);
        }
        
        // Detecção de mining específica para JS
        const miningDetection = this.detectJavaScriptMining(content, astResult);
        
        const result = {
          filePath,
          type: 'javascript',
          size: content.length,
          lines: content.split('\n').length,
          ast: astResult,
          traditional: traditionalAnalysis,
          normalized,
          mining: miningDetection,
          timestamp: new Date().toISOString()
        };
        
        this.results.javascript.push(result);
        this.updateSummary(result);
        
      } catch (error) {
        console.error(`  ❌ Erro ao processar ${path.basename(filePath)}: ${error.message}`);
        this.results.summary.analysisErrors++;
      }
    }
  }

  // Processar ficheiros WASM
  async processWasmFiles(wasmFiles) {
    for (const filePath of wasmFiles) {
      try {
        console.log(`  🔧 Analisando: ${path.basename(filePath)}`);
        
        const result = await this.wasmAnalyzer.analyzeWasm(filePath);
        result.type = 'wasm';
        result.timestamp = new Date().toISOString();
        
        this.results.wasm.push(result);
        this.updateSummary(result);
        
      } catch (error) {
        console.error(`  ❌ Erro ao processar ${path.basename(filePath)}: ${error.message}`);
        this.results.summary.analysisErrors++;
      }
    }
  }

  // Detectar mining em JavaScript
  detectJavaScriptMining(content, astResult) {
    const mining = {
      detected: false,
      confidence: 0,
      indicators: [],
      evidence: [],
      patterns: []
    };
    
    let score = 0;
    let totalChecks = 0;
    
    // 1. Verificar padrões de mining conhecidos
    const miningPatterns = [
      'CoinHive', 'CryptoNight', 'WebDollar', 'CoinImp', 'CoinNebula',
      'mining', 'hashrate', 'difficulty', 'nonce', 'block', 'chain',
      'cryptocurrency', 'bitcoin', 'ethereum', 'monero', 'zcash'
    ];
    
    let patternScore = 0;
    miningPatterns.forEach(pattern => {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        patternScore += 0.2;
        mining.indicators.push(`mining_pattern: ${pattern}`);
        mining.evidence.push(`Mining-related pattern detected: ${pattern}`);
      }
    });
    score += Math.min(patternScore, 1);
    totalChecks++;
    
    // 2. Verificar uso de Web Workers para mining
    if (content.includes('Worker') || content.includes('postMessage')) {
      score += 0.3;
      mining.indicators.push('web_workers');
      mining.evidence.push('Web Workers detected - commonly used for mining');
      totalChecks++;
    }
    
    // 3. Verificar operações de hash intensivas
    const hashPatterns = ['crypto.subtle', 'SHA-256', 'SHA-512', 'hash', 'digest'];
    let hashScore = 0;
    hashPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        hashScore += 0.2;
      }
    });
    if (hashScore > 0) {
      score += Math.min(hashScore, 1);
      mining.indicators.push('hash_operations');
      mining.evidence.push('Cryptographic hash operations detected');
      totalChecks++;
    }
    
    // 4. Verificar loops intensivos de CPU
    if (astResult.semantic) {
      const complexity = astResult.semantic.complexity.cyclomatic;
      if (complexity > 20) {
        score += 0.3;
        mining.indicators.push('high_complexity');
        mining.evidence.push(`High cyclomatic complexity: ${complexity}`);
        totalChecks++;
      }
      
      // Verificar padrões de mining no AST
      if (astResult.semantic.patterns.crypto_related > 0) {
        score += 0.4;
        mining.indicators.push('crypto_patterns');
        mining.evidence.push('Cryptographic patterns detected in AST analysis');
        totalChecks++;
      }
    }
    
    // 5. Verificar bibliotecas de mining conhecidas
    const miningLibraries = [
      'coinhive', 'cryptonight', 'argon2', 'blake2', 'scrypt'
    ];
    
    let libScore = 0;
    miningLibraries.forEach(lib => {
      if (content.toLowerCase().includes(lib)) {
        libScore += 0.4;
        mining.indicators.push(`mining_library: ${lib}`);
        mining.evidence.push(`Known mining library detected: ${lib}`);
      }
    });
    if (libScore > 0) {
      score += Math.min(libScore, 1);
      totalChecks++;
    }
    
    // Calcular confiança final
    mining.confidence = totalChecks > 0 ? score / totalChecks : 0;
    mining.detected = mining.confidence >= 0.5;
    
    return mining;
  }

  // Atualizar resumo
  updateSummary(result) {
    this.results.summary.totalFiles++;
    
    if (result.type === 'javascript') {
      this.results.summary.jsFiles++;
    } else if (result.type === 'wasm') {
      this.results.summary.wasmFiles++;
    }
    
    if (result.mining && result.mining.detected) {
      this.results.summary.miningDetected++;
      
      if (result.mining.confidence >= 0.8) {
        this.results.summary.highConfidenceMining++;
      }
    }
  }

  // Gerar relatórios
  async generateReports() {
    // Relatório geral
    const generalReport = this.generateGeneralReport();
    fs.writeFileSync(
      path.join(this.options.outputDir, 'general_report.txt'),
      generalReport
    );
    
    // Relatório de mining
    const miningReport = this.generateMiningReport();
    fs.writeFileSync(
      path.join(this.options.outputDir, 'mining_report.txt'),
      miningReport
    );
    
    // Relatório JavaScript
    if (this.results.javascript.length > 0) {
      const jsReport = this.generateJavaScriptReport();
      fs.writeFileSync(
        path.join(this.options.outputDir, 'javascript_report.txt'),
        jsReport
      );
    }
    
    // Relatório WASM
    if (this.results.wasm.length > 0) {
      const wasmReport = this.wasmAnalyzer.generateWasmReport({
        files: this.results.wasm,
        summary: {
          totalFiles: this.results.wasm.length,
          successfulAnalyses: this.results.wasm.filter(r => r.wasm !== null).length,
          miningDetected: this.results.wasm.filter(r => r.mining && r.mining.detected).length,
          totalFunctions: this.results.wasm.reduce((sum, r) => sum + (r.wasm ? r.wasm.functions.length : 0), 0),
          totalComplexity: this.results.wasm.reduce((sum, r) => sum + (r.semantic ? r.semantic.complexity : 0), 0)
        }
      });
      fs.writeFileSync(
        path.join(this.options.outputDir, 'wasm_report.txt'),
        wasmReport
      );
    }
  }

  // Gerar relatório geral
  generateGeneralReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO GERAL - PIPELINE INTEGRADO DE ANÁLISE');
    report.push('='.repeat(80));
    report.push('');
    
    report.push('RESUMO EXECUTIVO:');
    report.push(`- Total de ficheiros analisados: ${this.results.summary.totalFiles}`);
    report.push(`- Ficheiros JavaScript: ${this.results.summary.jsFiles}`);
    report.push(`- Ficheiros WASM: ${this.results.summary.wasmFiles}`);
    report.push(`- Mining detectado: ${this.results.summary.miningDetected}`);
    report.push(`- Alta confiança de mining: ${this.results.summary.highConfidenceMining}`);
    report.push(`- Erros de análise: ${this.results.summary.analysisErrors}`);
    report.push('');
    
    // Estatísticas de mining
    const miningFiles = [...this.results.javascript, ...this.results.wasm]
      .filter(r => r.mining && r.mining.detected);
    
    if (miningFiles.length > 0) {
      report.push('FICHEIROS COM MINING DETECTADO:');
      report.push('-'.repeat(50));
      
      miningFiles.forEach(file => {
        report.push(`\n📄 ${path.basename(file.filePath)}`);
        report.push(`   Tipo: ${file.type.toUpperCase()}`);
        report.push(`   Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
        report.push(`   Indicadores: ${file.mining.indicators.length}`);
        
        if (file.mining.evidence.length > 0) {
          report.push(`   Evidências:`);
          file.mining.evidence.slice(0, 3).forEach(evidence => {
            report.push(`     • ${evidence}`);
          });
          if (file.mining.evidence.length > 3) {
            report.push(`     • ... e mais ${file.mining.evidence.length - 3} evidências`);
          }
        }
      });
    }
    
    return report.join('\n');
  }

  // Gerar relatório de mining
  generateMiningReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE DETECÇÃO DE MINING');
    report.push('='.repeat(80));
    report.push('');
    
    const miningFiles = [...this.results.javascript, ...this.results.wasm]
      .filter(r => r.mining && r.mining.detected)
      .sort((a, b) => b.mining.confidence - a.mining.confidence);
    
    if (miningFiles.length === 0) {
      report.push('✅ Nenhum ficheiro com mining detectado.');
      return report.join('\n');
    }
    
    report.push(`🚨 ATENÇÃO: ${miningFiles.length} ficheiro(s) com mining detectado!\n`);
    
    // Agrupar por nível de confiança
    const highConfidence = miningFiles.filter(f => f.mining.confidence >= 0.8);
    const mediumConfidence = miningFiles.filter(f => f.mining.confidence >= 0.6 && f.mining.confidence < 0.8);
    
    if (highConfidence.length > 0) {
      report.push('🔴 ALTA CONFIANÇA (≥80%):');
      report.push('-'.repeat(40));
      highConfidence.forEach(file => {
        report.push(`\n📄 ${path.basename(file.filePath)}`);
        report.push(`   Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
        report.push(`   Tipo: ${file.type.toUpperCase()}`);
        report.push(`   Indicadores: ${file.mining.indicators.join(', ')}`);
      });
      report.push('');
    }
    
    if (mediumConfidence.length > 0) {
      report.push('🟡 CONFIANÇA MÉDIA (60-79%):');
      report.push('-'.repeat(40));
      mediumConfidence.forEach(file => {
        report.push(`\n📄 ${path.basename(file.filePath)}`);
        report.push(`   Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
        report.push(`   Tipo: ${file.type.toUpperCase()}`);
        report.push(`   Indicadores: ${file.mining.indicators.join(', ')}`);
      });
    }
    
    return report.join('\n');
  }

  // Gerar relatório JavaScript
  generateJavaScriptReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE JAVASCRIPT');
    report.push('='.repeat(80));
    report.push('');
    
    report.push(`Total de ficheiros JS: ${this.results.javascript.length}`);
    report.push('');
    
    this.results.javascript.forEach(file => {
      report.push(`\n📄 ${path.basename(file.filePath)}`);
      report.push(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
      report.push(`   Linhas: ${file.lines}`);
      
      if (file.ast && file.ast.semantic) {
        report.push(`   🧠 Análise AST:`);
        report.push(`     - Funções: ${file.ast.semantic.functions.length}`);
        report.push(`     - Variáveis: ${file.ast.semantic.variables.length}`);
        report.push(`     - Classes: ${file.ast.semantic.classes.length}`);
        report.push(`     - Complexidade: ${file.ast.semantic.complexity.cyclomatic}`);
      }
      
      if (file.traditional) {
        report.push(`   📊 Análise Tradicional:`);
        report.push(`     - Obfuscação: ${file.traditional.obfuscation.detected ? 'SIM' : 'NÃO'}`);
        report.push(`     - Tipos: ${file.traditional.obfuscation.types ? file.traditional.obfuscation.types.join(', ') : 'Nenhum'}`);
        report.push(`     - Métricas: Complexidade(${file.traditional.metrics.complexity}), Comentários(${file.traditional.metrics.commentRatio.toFixed(1)}%)`);
      }
      
      if (file.mining) {
        report.push(`   ⛏️ Mining: ${file.mining.detected ? 'DETECTADO' : 'Não detectado'}`);
        if (file.mining.detected) {
          report.push(`     - Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
          report.push(`     - Indicadores: ${file.mining.indicators.length}`);
        }
      }
    });
    
    return report.join('\n');
  }

  // Salvar resultados em JSON
  async saveResults() {
    const jsonPath = path.join(this.options.outputDir, 'analysis_results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`💾 Resultados salvos em: ${jsonPath}`);
  }

  // Imprimir resumo no console
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ANÁLISE');
    console.log('='.repeat(60));
    console.log(`📁 Total de ficheiros: ${this.results.summary.totalFiles}`);
    console.log(`📄 JavaScript: ${this.results.summary.jsFiles}`);
    console.log(`🔧 WASM: ${this.results.summary.wasmFiles}`);
    console.log(`⛏️ Mining detectado: ${this.results.summary.miningDetected}`);
    console.log(`🚨 Alta confiança: ${this.results.summary.highConfidenceMining}`);
    console.log(`❌ Erros: ${this.results.summary.analysisErrors}`);
    
    if (this.results.summary.miningDetected > 0) {
      console.log('\n🚨 ATENÇÃO: Ficheiros com mining detectado!');
      console.log('   Consulte o relatório de mining para detalhes.');
    }
    
    console.log(`\n📁 Relatórios salvos em: ${this.options.outputDir}`);
  }

  // Garantir que o diretório de saída existe
  ensureOutputDirectory() {
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
      console.log(`📁 Diretório de saída criado: ${this.options.outputDir}`);
    }
  }
}

// Função para executar o pipeline
async function runIntegratedPipeline(options = {}) {
  const pipeline = new IntegratedPipeline(options);
  return await pipeline.run();
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const inputDir = args[0] || './downloads';
  const outputDir = args[1] || './analysis_output';
  
  runIntegratedPipeline({ inputDir, outputDir })
    .then(results => {
      console.log('\n🎉 Pipeline executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Erro no pipeline:', error.message);
      process.exit(1);
    });
}

module.exports = { IntegratedPipeline, runIntegratedPipeline };
