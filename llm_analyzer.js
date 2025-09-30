#!/usr/bin/env node

/**
 * Script de Inicialização - Analisador Pronto para LLM
 * 
 * Este script executa o analisador completo que gera dados estruturados
 * otimizados para classificação por LLM:
 * 
 * 1. Crawler - Baixa ficheiros JavaScript e WASM
 * 2. AST Parser - Análise estrutural profunda
 * 3. Pipeline Integrado - Combina análises
 * 4. Dados Estruturados - JSON otimizado para LLM
 */

const { LLMReadyAnalyzer } = require('./src/llm_ready_index.js');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Função principal
async function main() {
  logHeader('🤖 ANALISADOR PRONTO PARA LLM');
  log('Sistema de Análise Completa para Classificação por LLM', 'yellow');
  log('Versão 2.0.0 - Crawler + AST Parser + Pipeline Integrado', 'blue');
  
  // Verificar argumentos
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('\n📋 USO:', 'bright');
    log('  node llm_analyzer.js <url> [maxDepth] [outputDir]', 'yellow');
    log('\n📝 EXEMPLOS:', 'bright');
    log('  node llm_analyzer.js https://webdollar.io', 'green');
    log('  node llm_analyzer.js https://example.com 2', 'green');
    log('  node llm_analyzer.js https://suspicious-site.com 1 ./my_analysis', 'green');
    log('\n🔧 FUNCIONALIDADES:', 'bright');
    log('  ✅ Crawler automático de ficheiros JS/WASM', 'green');
    log('  ✅ Análise AST profunda e estruturada', 'green');
    log('  ✅ Pipeline integrado com múltiplas análises', 'green');
    log('  ✅ Dados JSON otimizados para LLM', 'green');
    log('  ✅ Detecção de mining e ofuscação', 'green');
    log('  ✅ Análise de segurança e padrões', 'green');
    log('  ✅ Relatórios detalhados em múltiplos formatos', 'green');
    log('\n📊 SAÍDA:', 'bright');
    log('  📁 llm_ready_data/ - Dados estruturados para LLM', 'blue');
    log('  📁 ast_analysis/ - Análise AST detalhada', 'blue');
    log('  📁 integrated_analysis/ - Pipeline integrado', 'blue');
    log('  📁 reports/ - Relatórios em texto', 'blue');
    process.exit(1);
  }
  
  const url = args[0];
  const maxDepth = parseInt(args[1]) || 1;
  const outputDir = args[2] || './llm_analysis_output';
  
  log(`\n🌐 URL: ${url}`, 'bright');
  log(`📁 Diretório de saída: ${outputDir}`, 'bright');
  log(`🔍 Profundidade máxima: ${maxDepth}`, 'bright');
  
  // Criar analisador
  const analyzer = new LLMReadyAnalyzer({ outputDir });
  
  try {
    log('\n🚀 Iniciando análise completa...', 'yellow');
    const startTime = Date.now();
    
    // Executar análise
    const results = await analyzer.analyzeWebsite(url, maxDepth);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    log(`\n✅ Análise concluída em ${duration.toFixed(2)}s!`, 'green');
    
    // Mostrar resumo dos resultados
    log('\n📊 RESUMO DOS RESULTADOS:', 'bright');
    log(`📁 Total de ficheiros: ${results.metadata.totalFiles}`, 'blue');
    log(`📄 JavaScript: ${results.metadata.jsFiles}`, 'blue');
    log(`🔧 WebAssembly: ${results.metadata.wasmFiles}`, 'blue');
    log(`⛏️ Mining detectado: ${results.summary.mining.detected}`, results.summary.mining.detected > 0 ? 'red' : 'green');
    log(`🔒 Ofuscação detectada: ${results.summary.obfuscation.detected}`, results.summary.obfuscation.detected > 0 ? 'yellow' : 'green');
    log(`🛡️ Ficheiros suspeitos: ${results.summary.security.suspicious}`, results.summary.security.suspicious > 0 ? 'red' : 'green');
    
    // Mostrar ficheiros com problemas
    if (results.summary.mining.detected > 0) {
      log('\n🚨 FICHEIROS COM MINING DETECTADO:', 'red');
      results.summary.mining.files.forEach(file => {
        log(`  • ${file}`, 'red');
      });
    }
    
    if (results.summary.obfuscation.detected > 0) {
      log('\n⚠️ FICHEIROS OFUSCADOS:', 'yellow');
      results.summary.obfuscation.files.forEach(file => {
        log(`  • ${file}`, 'yellow');
      });
    }
    
    // Mostrar localização dos dados
    log('\n📁 DADOS GERADOS:', 'bright');
    log(`🤖 Dados para LLM: ${outputDir}/llm_ready_data/`, 'cyan');
    log(`🧠 Análise AST: ${outputDir}/ast_analysis/`, 'cyan');
    log(`🔄 Pipeline Integrado: ${outputDir}/integrated_analysis/`, 'cyan');
    log(`📊 Relatórios: ${outputDir}/reports/`, 'cyan');
    
    // Mostrar próximos passos
    log('\n🎯 PRÓXIMOS PASSOS:', 'bright');
    log('1. Consulte os relatórios em texto para análise manual', 'blue');
    log('2. Use os dados JSON estruturados para classificação por LLM', 'blue');
    log('3. Analise os ficheiros CSV para estatísticas', 'blue');
    log('4. Verifique os ficheiros com mining/ofuscação detectados', 'blue');
    
    log('\n🎉 Análise completa! Dados prontos para LLM.', 'green');
    
  } catch (error) {
    log(`\n❌ Erro na análise: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
