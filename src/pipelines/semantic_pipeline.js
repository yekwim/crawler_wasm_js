#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { CodeAnalyzer } = require('../analyzers/parser.js');
const { CodeNormalizer } = require('../analyzers/normalizer.js');

class SemanticPipeline {
  constructor() {
    this.analyzer = new CodeAnalyzer();
    this.normalizer = new CodeNormalizer();
  }

  // Pipeline completo: Analisar → Normalizar → Representação Semântica
  async processCode(inputDir, outputDir, options = {}) {
    console.log('🔄 Iniciando pipeline semântico completo...\n');

    const results = {
      analysis: null,
      normalization: null,
      semantic: null,
      pipeline: {
        steps: ['analysis', 'normalization', 'semantic'],
        status: 'running',
        startTime: Date.now()
      }
    };

    try {
      // ETAPA 1: ANÁLISE (Raw Code)
      console.log('📊 ETAPA 1: Análise do código original...');
      results.analysis = this.analyzer.analyzeDirectory(inputDir);
      
      if (options.generateReport) {
        // Criar diretório de saída se não existir
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const analysisReport = this.analyzer.generateReport(results.analysis);
        const reportPath = path.join(outputDir, '01_analysis_report.txt');
        fs.writeFileSync(reportPath, analysisReport);
        console.log(`✅ Relatório de análise salvo: ${reportPath}`);
      }

      this.printAnalysisSummary(results.analysis);

      // ETAPA 2: NORMALIZAÇÃO (Clean Code)
      console.log('\n🔧 ETAPA 2: Normalização do código...');
      const normalizedDir = path.join(outputDir, 'normalized');
      results.normalization = this.normalizer.normalizeDirectory(inputDir, normalizedDir, options.normalizeOptions || {});
      
      if (options.generateReport) {
        const normalizationReport = this.normalizer.generateNormalizationReport(results.normalization);
        const reportPath = path.join(normalizedDir, '02_normalization_report.txt');
        fs.writeFileSync(reportPath, normalizationReport);
        console.log(`✅ Relatório de normalização salvo: ${reportPath}`);
      }

      this.printNormalizationSummary(results.normalization);

      // ETAPA 3: REPRESENTAÇÃO SEMÂNTICA (Structured)
      console.log('\n🧠 ETAPA 3: Geração de representação semântica...');
      results.semantic = await this.generateSemanticRepresentation(normalizedDir, outputDir, options);
      
      if (options.generateReport) {
        const semanticReport = this.generateSemanticReport(results.semantic);
        const reportPath = path.join(outputDir, '03_semantic_report.txt');
        fs.writeFileSync(reportPath, semanticReport);
        console.log(`✅ Relatório semântico salvo: ${reportPath}`);
      }

      this.printSemanticSummary(results.semantic);

      // Finalizar pipeline
      results.pipeline.status = 'completed';
      results.pipeline.endTime = Date.now();
      results.pipeline.duration = results.pipeline.endTime - results.pipeline.startTime;

      console.log(`\n🎉 Pipeline semântico concluído em ${(results.pipeline.duration / 1000).toFixed(2)}s`);

      return results;

    } catch (error) {
      results.pipeline.status = 'error';
      results.pipeline.error = error.message;
      console.error(`❌ Erro no pipeline: ${error.message}`);
      throw error;
    }
  }

  // Gerar representação semântica do código normalizado
  async generateSemanticRepresentation(normalizedDir, outputDir, options = {}) {
    const semanticDir = path.join(outputDir, 'semantic');
    if (!fs.existsSync(semanticDir)) {
      fs.mkdirSync(semanticDir, { recursive: true });
    }

    const semanticResults = {
      files: [],
      summary: {
        totalFiles: 0,
        totalFunctions: 0,
        totalVariables: 0,
        totalClasses: 0,
        totalImports: 0,
        totalExports: 0,
        complexity: {
          low: 0,
          medium: 0,
          high: 0
        },
        patterns: {
          functional: 0,
          objectOriented: 0,
          procedural: 0,
          eventDriven: 0
        }
      }
    };

    // Processar arquivos JavaScript normalizados
    const jsFiles = this.findJavaScriptFiles(normalizedDir);
    
    for (const filePath of jsFiles) {
      try {
        const semantic = await this.analyzeSemanticStructure(filePath);
        semanticResults.files.push(semantic);
        semanticResults.summary.totalFiles++;
        
        // Atualizar estatísticas
        semanticResults.summary.totalFunctions += semantic.functions.length;
        semanticResults.summary.totalVariables += semantic.variables.length;
        semanticResults.summary.totalClasses += semantic.classes.length;
        semanticResults.summary.totalImports += semantic.imports.length;
        semanticResults.summary.totalExports += semantic.exports.length;
        
        // Classificar complexidade
        if (semantic.complexity < 10) {
          semanticResults.summary.complexity.low++;
        } else if (semantic.complexity < 50) {
          semanticResults.summary.complexity.medium++;
        } else {
          semanticResults.summary.complexity.high++;
        }
        
        // Classificar padrões
        if (semantic.patterns.functional > semantic.patterns.objectOriented) {
          semanticResults.summary.patterns.functional++;
        } else if (semantic.patterns.objectOriented > semantic.patterns.procedural) {
          semanticResults.summary.patterns.objectOriented++;
        } else if (semantic.patterns.eventDriven > 0) {
          semanticResults.summary.patterns.eventDriven++;
        } else {
          semanticResults.summary.patterns.procedural++;
        }

        // Salvar representação semântica individual
        const relativePath = path.relative(normalizedDir, filePath);
        const semanticPath = path.join(semanticDir, relativePath.replace('.js', '.json'));
        fs.writeFileSync(semanticPath, JSON.stringify(semantic, null, 2));

      } catch (error) {
        console.error(`Erro ao processar ${filePath}: ${error.message}`);
      }
    }

    // Salvar resumo semântico
    const summaryPath = path.join(semanticDir, 'semantic_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(semanticResults.summary, null, 2));

    return semanticResults;
  }

  // Analisar estrutura semântica de um arquivo
  async analyzeSemanticStructure(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
      filePath,
      size: content.length,
      lines: content.split('\n').length,
      functions: this.extractFunctions(content),
      variables: this.extractVariables(content),
      classes: this.extractClasses(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      complexity: this.calculateSemanticComplexity(content),
      patterns: this.identifyPatterns(content),
      dependencies: this.extractDependencies(content),
      metadata: {
        analyzedAt: new Date().toISOString(),
        language: 'javascript',
        version: 'es6+'
      }
    };
  }

  // Extrair funções do código
  extractFunctions(content) {
    const functions = [];
    
    // Function declarations
    const funcDeclPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g;
    let match;
    while ((match = funcDeclPattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'declaration',
        parameters: this.parseParameters(match[2]),
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Arrow functions
    const arrowFuncPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>/g;
    while ((match = arrowFuncPattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow',
        parameters: this.parseParameters(match[2]),
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Function expressions
    const funcExprPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*\(([^)]*)\)\s*\{/g;
    while ((match = funcExprPattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'expression',
        parameters: this.parseParameters(match[2]),
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return functions;
  }

  // Extrair variáveis do código
  extractVariables(content) {
    const variables = [];
    
    const varPatterns = [
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];

    for (const pattern of varPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        variables.push({
          name: match[1],
          line: content.substring(0, match.index).split('\n').length,
          scope: this.determineScope(content, match.index)
        });
      }
    }

    return variables;
  }

  // Extrair classes do código
  extractClasses(content) {
    const classes = [];
    
    const classPattern = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:extends\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\{/g;
    let match;
    while ((match = classPattern.exec(content)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null,
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return classes;
  }

  // Extrair imports do código
  extractImports(content) {
    const imports = [];
    
    const importPattern = /import\s+(?:{[^}]*}|\*|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return imports;
  }

  // Extrair exports do código
  extractExports(content) {
    const exports = [];
    
    const exportPatterns = [
      /export\s+(?:default\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /export\s*\{[^}]*\}/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        exports.push({
          name: match[1] || 'named',
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return exports;
  }

  // Calcular complexidade semântica
  calculateSemanticComplexity(content) {
    const patterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /try\s*\{/g,
      /function\s+/g,
      /=>\s*/g,
      /&&/g,
      /\|\|/g,
      /\?/g
    ];

    let complexity = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    }

    return complexity;
  }

  // Identificar padrões de programação
  identifyPatterns(content) {
    return {
      functional: (content.match(/=>/g) || []).length,
      objectOriented: (content.match(/class\s+/g) || []).length + (content.match(/this\./g) || []).length,
      procedural: (content.match(/function\s+/g) || []).length,
      eventDriven: (content.match(/addEventListener/g) || []).length + (content.match(/on\w+\s*=/g) || []).length
    };
  }

  // Extrair dependências
  extractDependencies(content) {
    const dependencies = new Set();
    
    // CommonJS requires
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = requirePattern.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    // ES6 imports
    const importPattern = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    while ((match = importPattern.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    return Array.from(dependencies);
  }

  // Utilitários
  parseParameters(paramString) {
    return paramString.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  determineScope(content, index) {
    // Implementação básica - determinar escopo da variável
    const beforeIndex = content.substring(0, index);
    const functionCount = (beforeIndex.match(/function\s+/g) || []).length;
    const classCount = (beforeIndex.match(/class\s+/g) || []).length;
    
    if (classCount > functionCount) return 'class';
    if (functionCount > 0) return 'function';
    return 'global';
  }

  findJavaScriptFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.js') {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  // Relatórios
  printAnalysisSummary(results) {
    console.log(`📊 Análise: ${results.summary.totalFiles} arquivos, ${results.summary.obfuscatedFiles} ofuscados`);
  }

  printNormalizationSummary(results) {
    console.log(`🔧 Normalização: ${results.summary.successfulFiles}/${results.summary.totalFiles} arquivos processados`);
  }

  printSemanticSummary(results) {
    console.log(`🧠 Semântica: ${results.summary.totalFiles} arquivos, ${results.summary.totalFunctions} funções, ${results.summary.totalVariables} variáveis`);
  }

  generateSemanticReport(results) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE REPRESENTAÇÃO SEMÂNTICA');
    report.push('='.repeat(80));
    report.push('');
    
    report.push('RESUMO GERAL:');
    report.push(`- Total de arquivos: ${results.summary.totalFiles}`);
    report.push(`- Total de funções: ${results.summary.totalFunctions}`);
    report.push(`- Total de variáveis: ${results.summary.totalVariables}`);
    report.push(`- Total de classes: ${results.summary.totalClasses}`);
    report.push(`- Total de imports: ${results.summary.totalImports}`);
    report.push(`- Total de exports: ${results.summary.totalExports}`);
    report.push('');
    
    report.push('COMPLEXIDADE:');
    report.push(`- Baixa: ${results.summary.complexity.low} arquivos`);
    report.push(`- Média: ${results.summary.complexity.medium} arquivos`);
    report.push(`- Alta: ${results.summary.complexity.high} arquivos`);
    report.push('');
    
    report.push('PADRÕES DE PROGRAMAÇÃO:');
    report.push(`- Funcional: ${results.summary.patterns.functional} arquivos`);
    report.push(`- Orientado a Objetos: ${results.summary.patterns.objectOriented} arquivos`);
    report.push(`- Procedural: ${results.summary.patterns.procedural} arquivos`);
    report.push(`- Orientado a Eventos: ${results.summary.patterns.eventDriven} arquivos`);
    report.push('');
    
    return report.join('\n');
  }
}

// Função principal para uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 PIPELINE SEMÂNTICO COMPLETO

Uso:
  node semantic_pipeline.js <diretório_entrada> [diretório_saída] [opções]

Opções:
  --no-report          Não gerar relatórios
  --beautify           Aplicar beautify (padrão: true)
  --rename-vars        Renomear variáveis (padrão: true)
  --decode-strings     Decodificar strings (padrão: true)

Exemplos:
  node semantic_pipeline.js ./downloads
  node semantic_pipeline.js ./downloads ./output
  node semantic_pipeline.js ./downloads ./output --no-report
    `);
    process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1] || path.join(inputDir, 'semantic_output');
  const options = {
    generateReport: !args.includes('--no-report'),
    normalizeOptions: {
      beautify: !args.includes('--no-beautify'),
      renameVariables: !args.includes('--no-rename-vars'),
      decodeStrings: !args.includes('--no-decode-strings')
    }
  };

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Diretório não encontrado: ${inputDir}`);
    process.exit(1);
  }

  const pipeline = new SemanticPipeline();
  
  try {
    await pipeline.processCode(inputDir, outputDir, options);
    console.log('\n🎉 Pipeline semântico concluído com sucesso!');
  } catch (error) {
    console.error(`❌ Erro no pipeline: ${error.message}`);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { SemanticPipeline };

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
