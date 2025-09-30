#!/usr/bin/env node

/**
 * Índice Centralizado para LLM - Crawler + AST Parser + Pipeline Integrado
 * 
 * Este arquivo centraliza as funcionalidades essenciais para gerar dados
 * estruturados e prontos para classificação por LLM:
 * 
 * 1. Crawler - Baixa ficheiros JavaScript e WASM
 * 2. AST Parser - Análise estrutural profunda
 * 3. Pipeline Integrado - Combina análises e gera dados estruturados
 * 
 * Resultado: Dados JSON estruturados otimizados para LLM
 */

const fs = require('fs');
const path = require('path');

// Componentes principais
const { ASTParser } = require('./analyzers/ast_parser.js');
const { IntegratedPipeline } = require('./pipelines/integrated_pipeline.js');
const { CodeAnalyzer } = require('./analyzers/parser.js');
const { CodeNormalizer } = require('./analyzers/normalizer.js');
const { EnhancedWasmAnalyzer } = require('./analyzers/enhanced_wasm_analyzer.js');

// Crawler (importar diretamente)
const crawler = require('./crawler.js');

class LLMReadyAnalyzer {
  constructor(options = {}) {
    this.options = {
      inputDir: options.inputDir || './downloads',
      outputDir: options.outputDir || './llm_analysis_output',
      generateStructuredData: options.generateStructuredData !== false,
      generateSummary: options.generateSummary !== false,
      ...options
    };
    
    this.astParser = new ASTParser();
    this.codeAnalyzer = new CodeAnalyzer();
    this.normalizer = new CodeNormalizer();
    this.wasmAnalyzer = new EnhancedWasmAnalyzer();
    
    this.results = {
      metadata: {
        version: '2.0.0-llm',
        generatedAt: new Date().toISOString(),
        totalFiles: 0,
        jsFiles: 0,
        wasmFiles: 0
      },
      files: [],
      summary: {
        mining: { detected: 0, highConfidence: 0 },
        obfuscation: { detected: 0, types: [] },
        complexity: { low: 0, medium: 0, high: 0 },
        patterns: { functional: 0, oop: 0, procedural: 0, eventDriven: 0 }
      }
    };
  }

  /**
   * Executar análise completa: Crawler + AST + Pipeline Integrado
   */
  async analyzeWebsite(url, maxDepth = 1) {
    console.log('🚀 Iniciando análise completa para LLM...');
    console.log(`🌐 URL: ${url}`);
    console.log(`📁 Diretório: ${this.options.inputDir}`);
    
    try {
      // ETAPA 1: CRAWLER
      console.log('\n📥 ETAPA 1: Baixando ficheiros...');
      await this.runCrawler(url, maxDepth);
      
      // ETAPA 2: ANÁLISE ESTRUTURADA
      console.log('\n🧠 ETAPA 2: Análise estrutural (AST)...');
      await this.runASTAnalysis();
      
      // ETAPA 3: PIPELINE INTEGRADO
      console.log('\n🔄 ETAPA 3: Pipeline integrado...');
      await this.runIntegratedPipeline();
      
      // ETAPA 4: PREPARAR DADOS PARA LLM
      console.log('\n🤖 ETAPA 4: Preparando dados para LLM...');
      await this.prepareLLMData();
      
      // ETAPA 5: GERAR RELATÓRIOS
      console.log('\n📊 ETAPA 5: Gerando relatórios...');
      await this.generateReports();
      
      console.log('\n✅ Análise completa concluída!');
      this.printSummary();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Erro na análise:', error.message);
      throw error;
    }
  }

  /**
   * Executar crawler
   */
  async runCrawler(url, maxDepth) {
    return new Promise((resolve, reject) => {
      const crawlerProcess = require('child_process').spawn('node', [
        'src/crawler.js',
        url,
        this.options.inputDir,
        maxDepth.toString()
      ], { stdio: 'inherit' });
      
      crawlerProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Crawler concluído');
          resolve();
        } else {
          reject(new Error(`Crawler falhou com código ${code}`));
        }
      });
    });
  }

  /**
   * Executar análise AST
   */
  async runASTAnalysis() {
    const astResults = this.astParser.parseDirectory(this.options.inputDir);
    
    // Salvar resultados AST
    const astOutputDir = path.join(this.options.outputDir, 'ast_analysis');
    if (!fs.existsSync(astOutputDir)) {
      fs.mkdirSync(astOutputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(astOutputDir, 'ast_data.json'),
      JSON.stringify(astResults, null, 2)
    );
    
    // Gerar relatório AST
    const astReport = this.astParser.generateASTReport(astResults);
    fs.writeFileSync(
      path.join(astOutputDir, 'ast_report.txt'),
      astReport
    );
    
    console.log(`✅ Análise AST concluída: ${astResults.summary.successfulParses}/${astResults.summary.totalFiles} ficheiros`);
    
    return astResults;
  }

  /**
   * Executar pipeline integrado
   */
  async runIntegratedPipeline() {
    const pipeline = new IntegratedPipeline({
      inputDir: this.options.inputDir,
      outputDir: path.join(this.options.outputDir, 'integrated_analysis'),
      generateReports: true
    });
    
    const results = await pipeline.run();
    
    console.log(`✅ Pipeline integrado concluído: ${results.summary.totalFiles} ficheiros analisados`);
    
    return results;
  }

  /**
   * Preparar dados estruturados para LLM
   */
  async prepareLLMData() {
    const llmDataDir = path.join(this.options.outputDir, 'llm_ready_data');
    if (!fs.existsSync(llmDataDir)) {
      fs.mkdirSync(llmDataDir, { recursive: true });
    }

    // Encontrar todos os ficheiros
    const files = this.findAllFiles(this.options.inputDir);
    
    const llmStructuredData = {
      metadata: {
        ...this.results.metadata,
        totalFiles: files.js.length + files.wasm.length,
        jsFiles: files.js.length,
        wasmFiles: files.wasm.length
      },
      files: [],
      summary: {
        mining: { detected: 0, highConfidence: 0, files: [] },
        obfuscation: { detected: 0, types: [], files: [] },
        complexity: { low: 0, medium: 0, high: 0 },
        patterns: { functional: 0, oop: 0, procedural: 0, eventDriven: 0 },
        security: { suspicious: 0, crypto: 0, workers: 0 }
      }
    };

    // Processar ficheiros JavaScript
    for (const filePath of files.js) {
      try {
        const fileData = await this.processJavaScriptFile(filePath);
        llmStructuredData.files.push(fileData);
        this.updateSummary(llmStructuredData.summary, fileData);
      } catch (error) {
        console.error(`❌ Erro ao processar ${filePath}: ${error.message}`);
      }
    }

    // Processar ficheiros WASM
    for (const filePath of files.wasm) {
      try {
        const fileData = await this.processWasmFile(filePath);
        llmStructuredData.files.push(fileData);
        this.updateSummary(llmStructuredData.summary, fileData);
      } catch (error) {
        console.error(`❌ Erro ao processar ${filePath}: ${error.message}`);
      }
    }

    // Salvar dados estruturados para LLM
    fs.writeFileSync(
      path.join(llmDataDir, 'llm_structured_data.json'),
      JSON.stringify(llmStructuredData, null, 2)
    );

    // Salvar resumo executivo
    const executiveSummary = this.generateExecutiveSummary(llmStructuredData);
    fs.writeFileSync(
      path.join(llmDataDir, 'executive_summary.txt'),
      executiveSummary
    );

    // Salvar dados em formato CSV para análise
    const csvData = this.generateCSVData(llmStructuredData);
    fs.writeFileSync(
      path.join(llmDataDir, 'analysis_data.csv'),
      csvData
    );

    this.results = llmStructuredData;
    console.log(`✅ Dados para LLM preparados: ${llmStructuredData.files.length} ficheiros`);
  }

  /**
   * Processar ficheiro JavaScript individual
   */
  async processJavaScriptFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Análise AST
    const astResult = this.astParser.parseFile(filePath);
    
    // Análise tradicional
    const traditionalAnalysis = this.codeAnalyzer.analyzeJavaScript(filePath);
    
    // Detecção de mining
    const miningDetection = this.detectMining(content, astResult);
    
    // Detecção de ofuscação
    const obfuscationDetection = this.detectObfuscation(content, traditionalAnalysis);
    
    // Análise de complexidade
    const complexityAnalysis = this.analyzeComplexity(astResult);
    
    // Análise de padrões
    const patternAnalysis = this.analyzePatterns(astResult);
    
    // Análise de segurança
    const securityAnalysis = this.analyzeSecurity(content, astResult);

    return {
      filePath: path.relative(this.options.inputDir, filePath),
      type: 'javascript',
      size: content.length,
      lines: content.split('\n').length,
      
      // Dados estruturados para LLM
      ast: astResult.semantic ? {
        functions: astResult.semantic.functions,
        variables: astResult.semantic.variables,
        classes: astResult.semantic.classes,
        imports: astResult.semantic.imports,
        exports: astResult.semantic.exports,
        complexity: astResult.semantic.complexity,
        patterns: astResult.semantic.patterns,
        dependencies: astResult.semantic.dependencies
      } : null,
      
      mining: miningDetection,
      obfuscation: obfuscationDetection,
      complexity: complexityAnalysis,
      patterns: patternAnalysis,
      security: securityAnalysis,
      
      // Metadados
      metadata: {
        analyzedAt: new Date().toISOString(),
        language: 'javascript',
        version: 'es6+'
      }
    };
  }

  /**
   * Processar ficheiro WASM individual
   */
  async processWasmFile(filePath) {
    const wasmResult = await this.wasmAnalyzer.analyzeWasm(filePath);
    
    return {
      filePath: path.relative(this.options.inputDir, filePath),
      type: 'wasm',
      size: wasmResult.size || 0,
      
      // Dados estruturados para LLM
      wasm: wasmResult.wasm ? {
        functions: wasmResult.wasm.functions,
        imports: wasmResult.wasm.imports,
        exports: wasmResult.wasm.exports,
        sections: wasmResult.wasm.sections,
        complexity: wasmResult.semantic ? wasmResult.semantic.complexity : 0
      } : null,
      
      mining: wasmResult.mining || { detected: false, confidence: 0 },
      security: wasmResult.security || { suspicious: false, crypto: false },
      
      metadata: {
        analyzedAt: new Date().toISOString(),
        language: 'webassembly',
        version: 'wasm-1.0'
      }
    };
  }

  /**
   * Detectar mining em JavaScript
   */
  detectMining(content, astResult) {
    const mining = {
      detected: false,
      confidence: 0,
      indicators: [],
      evidence: [],
      patterns: []
    };
    
    let score = 0;
    let totalChecks = 0;
    
    // Padrões de mining conhecidos
    const miningPatterns = [
      'CoinHive', 'CryptoNight', 'WebDollar', 'CoinImp', 'mining',
      'hashrate', 'difficulty', 'nonce', 'block', 'chain',
      'cryptocurrency', 'bitcoin', 'ethereum', 'monero'
    ];
    
    miningPatterns.forEach(pattern => {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        score += 0.2;
        mining.indicators.push(`mining_pattern: ${pattern}`);
        mining.evidence.push(`Mining pattern detected: ${pattern}`);
      }
    });
    
    // Web Workers
    if (content.includes('Worker') || content.includes('postMessage')) {
      score += 0.3;
      mining.indicators.push('web_workers');
      mining.evidence.push('Web Workers detected');
    }
    
    // Operações de hash
    const hashPatterns = ['crypto.subtle', 'SHA-256', 'hash', 'digest'];
    hashPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        score += 0.2;
      }
    });
    
    // Complexidade alta
    if (astResult.semantic && astResult.semantic.complexity.cyclomatic > 20) {
      score += 0.3;
      mining.indicators.push('high_complexity');
      mining.evidence.push(`High complexity: ${astResult.semantic.complexity.cyclomatic}`);
    }
    
    mining.confidence = totalChecks > 0 ? score / totalChecks : 0;
    mining.detected = mining.confidence >= 0.5;
    
    return mining;
  }

  /**
   * Detectar ofuscação
   */
  detectObfuscation(content, traditionalAnalysis) {
    return {
      detected: traditionalAnalysis.obfuscation.detected,
      types: traditionalAnalysis.obfuscation.types || [],
      confidence: traditionalAnalysis.obfuscation.confidence || 0,
      indicators: traditionalAnalysis.obfuscation.indicators || []
    };
  }

  /**
   * Analisar complexidade
   */
  analyzeComplexity(astResult) {
    if (!astResult.semantic) {
      return { level: 'unknown', cyclomatic: 0, cognitive: 0 };
    }
    
    const cyclomatic = astResult.semantic.complexity.cyclomatic;
    const cognitive = astResult.semantic.complexity.cognitive;
    
    let level = 'low';
    if (cyclomatic > 20 || cognitive > 15) level = 'high';
    else if (cyclomatic > 10 || cognitive > 8) level = 'medium';
    
    return { level, cyclomatic, cognitive };
  }

  /**
   * Analisar padrões de programação
   */
  analyzePatterns(astResult) {
    if (!astResult.semantic) {
      return { functional: 0, oop: 0, procedural: 0, eventDriven: 0 };
    }
    
    return astResult.semantic.patterns;
  }

  /**
   * Analisar segurança
   */
  analyzeSecurity(content, astResult) {
    const security = {
      suspicious: false,
      crypto: false,
      workers: false,
      eval: false,
      indicators: []
    };
    
    // Detectar uso de eval
    if (content.includes('eval(') || content.includes('Function(')) {
      security.eval = true;
      security.suspicious = true;
      security.indicators.push('eval_usage');
    }
    
    // Detectar operações criptográficas
    if (content.includes('crypto.subtle') || content.includes('CryptoJS')) {
      security.crypto = true;
      security.indicators.push('crypto_operations');
    }
    
    // Detectar Web Workers
    if (content.includes('Worker') || content.includes('postMessage')) {
      security.workers = true;
      security.indicators.push('web_workers');
    }
    
    return security;
  }

  /**
   * Atualizar resumo
   */
  updateSummary(summary, fileData) {
    if (fileData.mining && fileData.mining.detected) {
      summary.mining.detected++;
      summary.mining.files.push(fileData.filePath);
      if (fileData.mining.confidence >= 0.8) {
        summary.mining.highConfidence++;
      }
    }
    
    if (fileData.obfuscation && fileData.obfuscation.detected) {
      summary.obfuscation.detected++;
      summary.obfuscation.files.push(fileData.filePath);
      fileData.obfuscation.types.forEach(type => {
        if (!summary.obfuscation.types.includes(type)) {
          summary.obfuscation.types.push(type);
        }
      });
    }
    
    if (fileData.complexity) {
      summary.complexity[fileData.complexity.level]++;
    }
    
    if (fileData.patterns) {
      summary.patterns.functional += fileData.patterns.functional || 0;
      summary.patterns.oop += fileData.patterns.objectOriented || 0;
      summary.patterns.procedural += fileData.patterns.procedural || 0;
      summary.patterns.eventDriven += fileData.patterns.eventDriven || 0;
    }
    
    if (fileData.security) {
      if (fileData.security.suspicious) summary.security.suspicious++;
      if (fileData.security.crypto) summary.security.crypto++;
      if (fileData.security.workers) summary.security.workers++;
    }
  }

  /**
   * Gerar resumo executivo
   */
  generateExecutiveSummary(data) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RESUMO EXECUTIVO - ANÁLISE PARA LLM');
    report.push('='.repeat(80));
    report.push('');
    
    report.push('METADADOS:');
    report.push(`- Total de ficheiros: ${data.metadata.totalFiles}`);
    report.push(`- JavaScript: ${data.metadata.jsFiles}`);
    report.push(`- WebAssembly: ${data.metadata.wasmFiles}`);
    report.push(`- Gerado em: ${data.metadata.generatedAt}`);
    report.push('');
    
    report.push('DETECÇÃO DE MINING:');
    report.push(`- Ficheiros com mining: ${data.summary.mining.detected}`);
    report.push(`- Alta confiança: ${data.summary.mining.highConfidence}`);
    if (data.summary.mining.files.length > 0) {
      report.push(`- Ficheiros suspeitos: ${data.summary.mining.files.join(', ')}`);
    }
    report.push('');
    
    report.push('OFUSCAÇÃO:');
    report.push(`- Ficheiros ofuscados: ${data.summary.obfuscation.detected}`);
    report.push(`- Tipos detectados: ${data.summary.obfuscation.types.join(', ') || 'Nenhum'}`);
    report.push('');
    
    report.push('COMPLEXIDADE:');
    report.push(`- Baixa: ${data.summary.complexity.low}`);
    report.push(`- Média: ${data.summary.complexity.medium}`);
    report.push(`- Alta: ${data.summary.complexity.high}`);
    report.push('');
    
    report.push('PADRÕES DE PROGRAMAÇÃO:');
    report.push(`- Funcional: ${data.summary.patterns.functional}`);
    report.push(`- Orientado a Objetos: ${data.summary.patterns.oop}`);
    report.push(`- Procedural: ${data.summary.patterns.procedural}`);
    report.push(`- Event-Driven: ${data.summary.patterns.eventDriven}`);
    report.push('');
    
    report.push('SEGURANÇA:');
    report.push(`- Ficheiros suspeitos: ${data.summary.security.suspicious}`);
    report.push(`- Com criptografia: ${data.summary.security.crypto}`);
    report.push(`- Com Web Workers: ${data.summary.security.workers}`);
    
    return report.join('\n');
  }

  /**
   * Gerar dados CSV
   */
  generateCSVData(data) {
    const csv = [];
    csv.push('filePath,type,size,lines,mining_detected,mining_confidence,obfuscation_detected,complexity_level,security_suspicious,security_crypto,security_workers');
    
    data.files.forEach(file => {
      csv.push([
        file.filePath,
        file.type,
        file.size,
        file.lines || 0,
        file.mining ? file.mining.detected : false,
        file.mining ? file.mining.confidence : 0,
        file.obfuscation ? file.obfuscation.detected : false,
        file.complexity ? file.complexity.level : 'unknown',
        file.security ? file.security.suspicious : false,
        file.security ? file.security.crypto : false,
        file.security ? file.security.workers : false
      ].join(','));
    });
    
    return csv.join('\n');
  }

  /**
   * Encontrar todos os ficheiros
   */
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
            } else if (ext === '.wasm') {
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

  /**
   * Gerar relatórios
   */
  async generateReports() {
    const reportsDir = path.join(this.options.outputDir, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Relatório detalhado
    const detailedReport = this.generateDetailedReport();
    fs.writeFileSync(
      path.join(reportsDir, 'detailed_analysis_report.txt'),
      detailedReport
    );
    
    // Relatório de mining
    const miningReport = this.generateMiningReport();
    fs.writeFileSync(
      path.join(reportsDir, 'mining_analysis_report.txt'),
      miningReport
    );
    
    // Relatório de segurança
    const securityReport = this.generateSecurityReport();
    fs.writeFileSync(
      path.join(reportsDir, 'security_analysis_report.txt'),
      securityReport
    );
    
    console.log(`✅ Relatórios gerados em: ${reportsDir}`);
  }

  /**
   * Gerar relatório detalhado
   */
  generateDetailedReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DETALHADO - ANÁLISE PARA LLM');
    report.push('='.repeat(80));
    report.push('');
    
    this.results.files.forEach(file => {
      report.push(`\n📄 ${file.filePath}`);
      report.push(`   Tipo: ${file.type.toUpperCase()}`);
      report.push(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
      report.push(`   Linhas: ${file.lines || 'N/A'}`);
      
      if (file.mining && file.mining.detected) {
        report.push(`   ⛏️ MINING: DETECTADO (${(file.mining.confidence * 100).toFixed(1)}%)`);
        file.mining.indicators.forEach(indicator => {
          report.push(`     • ${indicator}`);
        });
      }
      
      if (file.obfuscation && file.obfuscation.detected) {
        report.push(`   🔒 OFUSCAÇÃO: ${file.obfuscation.types.join(', ')}`);
      }
      
      if (file.complexity) {
        report.push(`   📊 COMPLEXIDADE: ${file.complexity.level} (${file.complexity.cyclomatic})`);
      }
      
      if (file.security && (file.security.suspicious || file.security.crypto || file.security.workers)) {
        report.push(`   🛡️ SEGURANÇA: ${file.security.indicators.join(', ')}`);
      }
    });
    
    return report.join('\n');
  }

  /**
   * Gerar relatório de mining
   */
  generateMiningReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE DETECÇÃO DE MINING');
    report.push('='.repeat(80));
    report.push('');
    
    const miningFiles = this.results.files.filter(f => f.mining && f.mining.detected);
    
    if (miningFiles.length === 0) {
      report.push('✅ Nenhum ficheiro com mining detectado.');
      return report.join('\n');
    }
    
    report.push(`🚨 ATENÇÃO: ${miningFiles.length} ficheiro(s) com mining detectado!\n`);
    
    miningFiles.forEach(file => {
      report.push(`📄 ${file.filePath}`);
      report.push(`   Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
      report.push(`   Indicadores: ${file.mining.indicators.join(', ')}`);
      if (file.mining.evidence.length > 0) {
        report.push(`   Evidências:`);
        file.mining.evidence.forEach(evidence => {
          report.push(`     • ${evidence}`);
        });
      }
      report.push('');
    });
    
    return report.join('\n');
  }

  /**
   * Gerar relatório de segurança
   */
  generateSecurityReport() {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE DE SEGURANÇA');
    report.push('='.repeat(80));
    report.push('');
    
    const suspiciousFiles = this.results.files.filter(f => f.security && f.security.suspicious);
    
    if (suspiciousFiles.length === 0) {
      report.push('✅ Nenhum ficheiro suspeito detectado.');
      return report.join('\n');
    }
    
    report.push(`⚠️ ATENÇÃO: ${suspiciousFiles.length} ficheiro(s) suspeito(s)!\n`);
    
    suspiciousFiles.forEach(file => {
      report.push(`📄 ${file.filePath}`);
      report.push(`   Indicadores: ${file.security.indicators.join(', ')}`);
      report.push('');
    });
    
    return report.join('\n');
  }

  /**
   * Imprimir resumo
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ANÁLISE PARA LLM');
    console.log('='.repeat(60));
    console.log(`📁 Total de ficheiros: ${this.results.metadata.totalFiles}`);
    console.log(`📄 JavaScript: ${this.results.metadata.jsFiles}`);
    console.log(`🔧 WASM: ${this.results.metadata.wasmFiles}`);
    console.log(`⛏️ Mining detectado: ${this.results.summary.mining.detected}`);
    console.log(`🔒 Ofuscação detectada: ${this.results.summary.obfuscation.detected}`);
    console.log(`🛡️ Ficheiros suspeitos: ${this.results.summary.security.suspicious}`);
    console.log(`\n📁 Dados para LLM salvos em: ${this.options.outputDir}/llm_ready_data/`);
  }
}

// Função principal para execução direta
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🤖 ANALISADOR PRONTO PARA LLM

Uso:
  node src/llm_ready_index.js <url> [maxDepth] [outputDir]

Exemplos:
  node src/llm_ready_index.js https://webdollar.io
  node src/llm_ready_index.js https://example.com 2 ./my_analysis
  node src/llm_ready_index.js https://suspicious-site.com 1 ./security_analysis

Funcionalidades:
  ✅ Crawler automático
  ✅ Análise AST profunda
  ✅ Pipeline integrado
  ✅ Dados estruturados para LLM
  ✅ Relatórios detalhados
  ✅ Detecção de mining
  ✅ Análise de segurança
    `);
    process.exit(1);
  }
  
  const url = args[0];
  const maxDepth = parseInt(args[1]) || 1;
  const outputDir = args[2] || './llm_analysis_output';
  
  const analyzer = new LLMReadyAnalyzer({ outputDir });
  
  try {
    await analyzer.analyzeWebsite(url, maxDepth);
    console.log('\n🎉 Análise concluída com sucesso!');
  } catch (error) {
    console.error(`❌ Erro na análise: ${error.message}`);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { LLMReadyAnalyzer };

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
