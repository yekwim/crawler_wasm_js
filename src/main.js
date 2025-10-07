#!/usr/bin/env node

/**
 * Script Principal do Sistema de Detecção de Mining
 * Executa o pipeline integrado aprimorado
 */

const { EnhancedIntegratedPipeline } = require('./pipelines/enhanced_integrated_pipeline');
const path = require('path');

function showHelp() {
  console.log(`
Sistema de Detecção de Mining - Crawler WASM/JS Aprimorado

Uso: node src/main.js <URL> [opções]

Argumentos:
  URL                    URL do site para analisar

Opções:
  --output-dir <dir>     Diretório de saída (padrão: ./output)
  --max-pages <num>      Número máximo de páginas para crawlar (padrão: 1)
  --headless <bool>      Executar browser em modo headless (padrão: true)
  --enable-crawling      Habilitar crawling (padrão: true)
  --enable-instrumentation Habilitar instrumentação JS (padrão: true)
  --enable-parsing       Habilitar parsing WASM (padrão: true)
  --enable-icfg          Habilitar construção ICFG (padrão: true)
  --enable-evasion       Habilitar simulação de evasões (padrão: true)
  --enable-normalization Habilitar normalização (padrão: true)
  --enable-llm           Habilitar análise LLM (padrão: true)
  --enable-monitoring    Habilitar monitorização runtime (padrão: true)
  --enable-alerting      Habilitar sistema de alertas (padrão: true)
  --enable-metrics       Habilitar coleta de métricas (padrão: true)
  --help, -h             Mostrar esta ajuda

Exemplos:
  node src/main.js https://example.com
  node src/main.js https://example.com --output-dir ./results --max-pages 3
  node src/main.js https://example.com --enable-crawling --disable-llm

Scripts disponíveis:
  npm start <URL>         Executar análise completa
  npm run demo           Demo básico com example.com
  npm run demo-full      Demo completo com múltiplas páginas
  npm run demo-quick     Demo rápido (sem LLM)
  npm run help           Mostrar esta ajuda
  npm run test           Testar componentes
  npm run setup          Setup automático
    `);
}

function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Verificar se é pedido de ajuda
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const url = args[0];
  const options = parseOptions(args.slice(1));
  
  // Validar URL
  if (!validateURL(url)) {
    console.error('❌ ERRO: URL inválida');
    console.error(`   URL fornecida: "${url}"`);
    console.error('');
    console.error('   Exemplos de URLs válidas:');
    console.error('   - https://example.com');
    console.error('   - http://localhost:3000');
    console.error('   - https://subdomain.example.com/path');
    console.error('');
    console.error('   Use --help para mais informações.');
    process.exit(1);
  }
  
  console.log('='.repeat(80));
  console.log('SISTEMA DE DETECÇÃO DE MINING - CRAWLER WASM/JS APRIMORADO');
  console.log('='.repeat(80));
  console.log(`URL alvo: ${url}`);
  console.log(`Diretório de saída: ${options.outputDir}`);
  console.log(`Modo headless: ${options.headless}`);
  console.log('='.repeat(80));
  
  const pipeline = new EnhancedIntegratedPipeline(options);
  
  try {
    // Executar pipeline
    const results = await pipeline.executePipeline(url, options);
    
    // Exibir resumo
    displaySummary(results);
    
    // Exibir recomendações
    displayRecommendations(results.recommendations);
    
    console.log('='.repeat(80));
    console.log('PIPELINE CONCLUÍDO COM SUCESSO');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('='.repeat(80));
    console.error('ERRO NO PIPELINE');
    console.error('='.repeat(80));
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    
    // Tentar limpar recursos
    try {
      await pipeline.cleanup();
    } catch (cleanupError) {
      console.error('Erro na limpeza:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

function parseOptions(args) {
  const options = {
    outputDir: './output',
    maxPages: 1,
    headless: true,
    enableCrawling: true,
    enableInstrumentation: true,
    enableParsing: true,
    enableICFGBuilding: true,
    enableEvasionSimulation: true,
    enableNormalization: true,
    enableLLMAnalysis: true,
    enableRuntimeMonitoring: true,
    enableAlerting: true,
    enableMetrics: true
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--max-pages':
        options.maxPages = parseInt(args[++i]);
        break;
      case '--headless':
        options.headless = args[++i] === 'true';
        break;
      case '--enable-crawling':
        options.enableCrawling = true;
        break;
      case '--disable-crawling':
        options.enableCrawling = false;
        break;
      case '--enable-instrumentation':
        options.enableInstrumentation = true;
        break;
      case '--disable-instrumentation':
        options.enableInstrumentation = false;
        break;
      case '--enable-parsing':
        options.enableParsing = true;
        break;
      case '--disable-parsing':
        options.enableParsing = false;
        break;
      case '--enable-icfg':
        options.enableICFGBuilding = true;
        break;
      case '--disable-icfg':
        options.enableICFGBuilding = false;
        break;
      case '--enable-evasion':
        options.enableEvasionSimulation = true;
        break;
      case '--disable-evasion':
        options.enableEvasionSimulation = false;
        break;
      case '--enable-normalization':
        options.enableNormalization = true;
        break;
      case '--disable-normalization':
        options.enableNormalization = false;
        break;
      case '--enable-llm':
        options.enableLLMAnalysis = true;
        break;
      case '--disable-llm':
        options.enableLLMAnalysis = false;
        break;
      case '--enable-monitoring':
        options.enableRuntimeMonitoring = true;
        break;
      case '--disable-monitoring':
        options.enableRuntimeMonitoring = false;
        break;
      case '--enable-alerting':
        options.enableAlerting = true;
        break;
      case '--disable-alerting':
        options.enableAlerting = false;
        break;
      case '--enable-metrics':
        options.enableMetrics = true;
        break;
      case '--disable-metrics':
        options.enableMetrics = false;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`Opção desconhecida: ${arg}`);
        }
        break;
    }
  }
  
  return options;
}

function displaySummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('RESUMO DO PIPELINE');
  console.log('='.repeat(80));
  
  const summary = results.summary;
  
  console.log(`Status: ${results.pipeline.status}`);
  console.log(`Duração: ${(results.pipeline.duration / 1000).toFixed(2)} segundos`);
  console.log(`Passos concluídos: ${results.pipeline.stepsCompleted}/${results.pipeline.totalSteps}`);
  
  console.log('\nArquivos processados:');
  console.log(`  - JavaScript: ${summary.filesProcessed.js}`);
  console.log(`  - WebAssembly: ${summary.filesProcessed.wasm}`);
  console.log(`  - Instrumentados: ${summary.filesProcessed.instrumented}`);
  
  console.log('\nResultados da análise:');
  console.log(`  - ICFG construído: ${summary.analysisResults.icfgBuilt ? 'Sim' : 'Não'}`);
  console.log(`  - Normalizado: ${summary.analysisResults.normalized ? 'Sim' : 'Não'}`);
  console.log(`  - Analisado por LLM: ${summary.analysisResults.llmAnalyzed ? 'Sim' : 'Não'}`);
  console.log(`  - Alertas gerados: ${summary.analysisResults.alertsGenerated ? 'Sim' : 'Não'}`);
  console.log(`  - Métricas coletadas: ${summary.analysisResults.metricsCollected ? 'Sim' : 'Não'}`);
  
  if (summary.classification) {
    console.log('\nClassificação:');
    console.log(`  - Label: ${summary.classification.label}`);
    console.log(`  - Confiança: ${(summary.classification.confidence * 100).toFixed(1)}%`);
    console.log(`  - Raciocínio: ${summary.classification.reasoning}`);
  }
  
  console.log('\nPerformance:');
  console.log(`  - Tempo total: ${(summary.performance.totalTime / 1000).toFixed(2)} segundos`);
  console.log(`  - Tempo médio por passo: ${(summary.performance.averageStepTime / 1000).toFixed(2)} segundos`);
}

function displayRecommendations(recommendations) {
  if (recommendations.length === 0) {
    return;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('RECOMENDAÇÕES');
  console.log('='.repeat(80));
  
  for (const rec of recommendations) {
    console.log(`\n[${rec.type.toUpperCase()}] ${rec.priority.toUpperCase()}`);
    console.log(`${rec.message}`);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { main };
