#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { CodeAnalyzer } = require('./analyzers/parser.js');
const { CodeNormalizer } = require('./analyzers/normalizer.js');

class AnalysisAndNormalizationTool {
  constructor() {
    this.analyzer = new CodeAnalyzer();
    this.normalizer = new CodeNormalizer();
  }

  // Executar análise completa
  async runAnalysis(inputDir, outputDir = null, options = {}) {
    const {
      analyze = true,
      normalize = true,
      generateReport = true,
      normalizeOptions = {}
    } = options;

    console.log('🔍 Iniciando análise e normalização de código...\n');

    let analysisResults = null;
    let normalizationResults = null;

    // 1. Análise dos arquivos
    if (analyze) {
      console.log('📊 Analisando arquivos...');
      analysisResults = this.analyzer.analyzeDirectory(inputDir);
      
      if (generateReport) {
        const analysisReport = this.analyzer.generateReport(analysisResults);
        const reportPath = path.join(inputDir, 'analysis_report.txt');
        fs.writeFileSync(reportPath, analysisReport);
        console.log(`📄 Relatório de análise salvo em: ${reportPath}`);
      }
      
      this.printAnalysisSummary(analysisResults);
    }

    // 2. Normalização dos arquivos
    if (normalize && analysisResults) {
      console.log('\n🔧 Normalizando arquivos...');
      
      const targetDir = outputDir || path.join(inputDir, 'normalized');
      normalizationResults = this.normalizer.normalizeDirectory(inputDir, targetDir, normalizeOptions);
      
      if (generateReport) {
        const normalizationReport = this.normalizer.generateNormalizationReport(normalizationResults);
        const reportPath = path.join(targetDir, 'normalization_report.txt');
        fs.writeFileSync(reportPath, normalizationReport);
        console.log(`📄 Relatório de normalização salvo em: ${reportPath}`);
      }
      
      this.printNormalizationSummary(normalizationResults);
    }

    return {
      analysis: analysisResults,
      normalization: normalizationResults
    };
  }

  // Imprimir resumo da análise
  printAnalysisSummary(results) {
    console.log('\n📈 RESUMO DA ANÁLISE:');
    console.log('='.repeat(50));
    console.log(`Total de arquivos: ${results.summary.totalFiles}`);
    console.log(`Arquivos ofuscados: ${results.summary.obfuscatedFiles}`);
    console.log(`Tamanho total: ${(results.summary.totalSize / 1024).toFixed(2)} KB`);
    console.log(`Complexidade média: ${results.summary.averageComplexity.toFixed(2)}`);

    // Mostrar arquivos com ofuscação
    const obfuscatedFiles = results.javascript.filter(file => 
      file.obfuscation && Object.values(file.obfuscation).some(result => result.detected)
    );

    if (obfuscatedFiles.length > 0) {
      console.log(`\n🚨 ARQUIVOS COM OFUSCAÇÃO DETECTADA (${obfuscatedFiles.length}):`);
      for (const file of obfuscatedFiles) {
        const obfuscationTypes = Object.entries(file.obfuscation)
          .filter(([_, result]) => result.detected)
          .map(([type, result]) => `${type} (${(result.confidence * 100).toFixed(1)}%)`);
        
        console.log(`  - ${path.basename(file.filePath)}: ${obfuscationTypes.join(', ')}`);
      }
    } else {
      console.log('\n✅ Nenhuma ofuscação detectada nos arquivos JavaScript');
    }

    // Mostrar arquivos WASM
    if (results.wasm.length > 0) {
      console.log(`\n🔷 ARQUIVOS WASM (${results.wasm.length}):`);
      for (const file of results.wasm) {
        console.log(`  - ${path.basename(file.filePath)}: ${(file.size / 1024).toFixed(2)} KB`);
      }
    }
  }

  // Imprimir resumo da normalização
  printNormalizationSummary(results) {
    console.log('\n🔧 RESUMO DA NORMALIZAÇÃO:');
    console.log('='.repeat(50));
    console.log(`Arquivos processados: ${results.summary.successfulFiles}/${results.summary.totalFiles}`);
    console.log(`Taxa de sucesso: ${((results.summary.successfulFiles / results.summary.totalFiles) * 100).toFixed(1)}%`);
    
    if (results.summary.totalOriginalSize > 0) {
      const compressionRatio = (1 - results.summary.totalNormalizedSize / results.summary.totalOriginalSize) * 100;
      console.log(`Tamanho original: ${(results.summary.totalOriginalSize / 1024).toFixed(2)} KB`);
      console.log(`Tamanho normalizado: ${(results.summary.totalNormalizedSize / 1024).toFixed(2)} KB`);
      console.log(`Taxa de compressão: ${compressionRatio.toFixed(1)}%`);
    }

    if (results.failed.length > 0) {
      console.log(`\n❌ ARQUIVOS COM ERRO (${results.failed.length}):`);
      for (const file of results.failed) {
        console.log(`  - ${path.basename(file.inputPath)}: ${file.error}`);
      }
    }
  }

  // Analisar arquivo específico
  analyzeFile(filePath) {
    console.log(`🔍 Analisando arquivo: ${filePath}`);
    
    const ext = path.extname(filePath).toLowerCase();
    let analysis;
    
    if (ext === '.js') {
      analysis = this.analyzer.analyzeJavaScript(filePath);
    } else if (ext === '.wasm') {
      analysis = this.analyzer.analyzeWasm(filePath);
    } else {
      console.log('❌ Tipo de arquivo não suportado');
      return null;
    }

    if (analysis.error) {
      console.log(`❌ Erro na análise: ${analysis.error}`);
      return analysis;
    }

    console.log(`📊 Tamanho: ${(analysis.size / 1024).toFixed(2)} KB`);
    
    if (ext === '.js') {
      console.log(`📝 Linhas: ${analysis.lines}`);
      
      // Mostrar ofuscação detectada
      const obfuscationTypes = Object.entries(analysis.obfuscation)
        .filter(([_, result]) => result.detected)
        .map(([type, result]) => `${type} (${(result.confidence * 100).toFixed(1)}%)`);
      
      if (obfuscationTypes.length > 0) {
        console.log(`🚨 Ofuscação detectada: ${obfuscationTypes.join(', ')}`);
      } else {
        console.log('✅ Nenhuma ofuscação detectada');
      }

      // Mostrar métricas
      if (analysis.metrics) {
        console.log(`🔢 Complexidade: ${analysis.metrics.complexity}`);
        console.log(`💬 Comentários: ${(analysis.metrics.commentRatio * 100).toFixed(1)}%`);
        console.log(`🏷️  Variáveis curtas: ${(analysis.metrics.variableNaming.shortNameRatio * 100).toFixed(1)}%`);
      }

      // Mostrar sugestões
      if (analysis.suggestions.length > 0) {
        console.log('\n💡 SUGESTÕES:');
        for (const suggestion of analysis.suggestions) {
          console.log(`  - [${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
        }
      }
    } else if (ext === '.wasm') {
      console.log(`🔷 É WASM válido: ${analysis.isWasm ? 'Sim' : 'Não'}`);
      if (analysis.sections) {
        console.log(`📦 Seções: ${analysis.sections.totalSections}`);
      }
    }

    return analysis;
  }

  // Normalizar arquivo específico
  normalizeFile(inputPath, outputPath, options = {}) {
    console.log(`🔧 Normalizando arquivo: ${inputPath}`);
    
    const result = this.normalizer.normalizeFile(inputPath, outputPath, options);
    
    if (result.success) {
      console.log(`✅ Arquivo normalizado salvo em: ${result.outputPath}`);
      console.log(`📊 Tamanho original: ${(result.originalSize / 1024).toFixed(2)} KB`);
      console.log(`📊 Tamanho normalizado: ${(result.normalizedSize / 1024).toFixed(2)} KB`);
      console.log(`📈 Compressão: ${result.compressionRatio.toFixed(1)}%`);
    } else {
      console.log(`❌ Erro na normalização: ${result.error}`);
    }

    return result;
  }
}

// Função principal para uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 FERRAMENTA DE ANÁLISE E NORMALIZAÇÃO DE CÓDIGO

Uso:
  node analyze_and_normalize.js <diretório> [opções]

Opções:
  --output-dir <dir>     Diretório de saída para arquivos normalizados
  --analyze-only         Apenas analisar, não normalizar
  --normalize-only       Apenas normalizar, não analisar
  --no-report            Não gerar relatórios
  --beautify             Aplicar beautify no código (padrão: true)
  --rename-vars          Renomear variáveis (padrão: true)
  --decode-strings       Decodificar strings (padrão: true)
  --remove-dead-code     Remover código morto (padrão: true)
  --add-comments         Adicionar comentários (padrão: true)

Exemplos:
  node analyze_and_normalize.js ./downloads
  node analyze_and_normalize.js ./downloads --output-dir ./normalized
  node analyze_and_normalize.js ./downloads --analyze-only
  node analyze_and_normalize.js ./downloads --normalize-only --no-report
    `);
    process.exit(1);
  }

  const inputDir = args[0];
  const options = {
    analyze: !args.includes('--normalize-only'),
    normalize: !args.includes('--analyze-only'),
    generateReport: !args.includes('--no-report'),
    normalizeOptions: {
      beautify: !args.includes('--no-beautify'),
      renameVariables: !args.includes('--no-rename-vars'),
      decodeStrings: !args.includes('--no-decode-strings'),
      removeDeadCode: !args.includes('--no-remove-dead-code'),
      addComments: !args.includes('--no-add-comments')
    }
  };

  // Encontrar diretório de saída
  const outputDirIndex = args.indexOf('--output-dir');
  if (outputDirIndex !== -1 && outputDirIndex + 1 < args.length) {
    options.outputDir = args[outputDirIndex + 1];
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Diretório não encontrado: ${inputDir}`);
    process.exit(1);
  }

  const tool = new AnalysisAndNormalizationTool();
  
  try {
    await tool.runAnalysis(inputDir, options.outputDir, options);
    console.log('\n🎉 Análise e normalização concluídas!');
  } catch (error) {
    console.error(`❌ Erro durante a execução: ${error.message}`);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { AnalysisAndNormalizationTool };

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
