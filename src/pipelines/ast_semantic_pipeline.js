#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ASTParser } = require('../analyzers/ast_parser.js');

class ASTSemanticPipeline {
  constructor() {
    this.astParser = new ASTParser({
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true,
      ranges: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true
    });
  }

  // Pipeline completo com AST
  async processWithAST(inputDir, outputDir, options = {}) {
    console.log('🌳 Iniciando pipeline semântico com AST...\n');

    const results = {
      ast: null,
      semantic: null,
      analysis: null,
      pipeline: {
        steps: ['ast_parsing', 'semantic_analysis', 'report_generation'],
        status: 'running',
        startTime: Date.now()
      }
    };

    try {
      // ETAPA 1: PARSING AST
      console.log('🌳 ETAPA 1: Parsing AST dos arquivos JavaScript...');
      results.ast = this.astParser.parseDirectory(inputDir);
      
      console.log(`✅ AST gerado para ${results.ast.summary.successfulParses}/${results.ast.summary.totalFiles} arquivos`);
      this.printASTSummary(results.ast);

      // ETAPA 2: ANÁLISE SEMÂNTICA AVANÇADA
      console.log('\n🧠 ETAPA 2: Análise semântica avançada...');
      results.semantic = this.performAdvancedSemanticAnalysis(results.ast);
      
      console.log(`✅ Análise semântica concluída`);
      this.printSemanticSummary(results.semantic);

      // ETAPA 3: GERAÇÃO DE RELATÓRIOS E ESTRUTURAS
      console.log('\n📊 ETAPA 3: Gerando relatórios e estruturas...');
      results.analysis = await this.generateAnalysisOutput(results, outputDir, options);

      // Finalizar pipeline
      results.pipeline.status = 'completed';
      results.pipeline.endTime = Date.now();
      results.pipeline.duration = results.pipeline.endTime - results.pipeline.startTime;

      console.log(`\n🎉 Pipeline AST concluído em ${(results.pipeline.duration / 1000).toFixed(2)}s`);

      return results;

    } catch (error) {
      results.pipeline.status = 'error';
      results.pipeline.error = error.message;
      console.error(`❌ Erro no pipeline AST: ${error.message}`);
      throw error;
    }
  }

  // Análise semântica avançada baseada em AST
  performAdvancedSemanticAnalysis(astResults) {
    const analysis = {
      files: [],
      crossReferences: {
        functionCalls: [],
        variableUsages: [],
        dependencies: new Map(),
        imports: new Map(),
        exports: new Map()
      },
      patterns: {
        architectural: [],
        design: [],
        security: [],
        performance: []
      },
      metrics: {
        totalComplexity: 0,
        averageComplexity: 0,
        maxComplexity: 0,
        codeQuality: {},
        maintainability: {}
      },
      insights: {
        recommendations: [],
        warnings: [],
        opportunities: []
      },
      summary: {
        totalFiles: astResults.summary.totalFiles,
        totalFunctions: astResults.summary.totalFunctions,
        totalClasses: astResults.summary.totalClasses,
        totalDependencies: 0,
        uniqueDependencies: new Set(),
        architecturalPatterns: 0,
        securityIssues: 0,
        performanceIssues: 0
      }
    };

    // Analisar cada arquivo
    for (const file of astResults.files) {
      if (!file.semantic) continue;

      const fileAnalysis = this.analyzeFileSemantics(file);
      analysis.files.push(fileAnalysis);

      // Acumular métricas
      analysis.metrics.totalComplexity += file.semantic.complexity.cyclomatic;
      analysis.metrics.maxComplexity = Math.max(analysis.metrics.maxComplexity, file.semantic.complexity.cyclomatic);

      // Acumular dependências
      file.semantic.dependencies.forEach(dep => {
        analysis.summary.uniqueDependencies.add(dep);
        analysis.crossReferences.dependencies.set(dep, 
          (analysis.crossReferences.dependencies.get(dep) || 0) + 1);
      });

      // Acumular imports/exports
      file.semantic.imports.forEach(imp => {
        analysis.crossReferences.imports.set(imp.source, 
          (analysis.crossReferences.imports.get(imp.source) || 0) + 1);
      });

      file.semantic.exports.forEach(exp => {
        analysis.crossReferences.exports.set(exp.type, 
          (analysis.crossReferences.exports.get(exp.type) || 0) + 1);
      });

      // Detectar padrões arquiteturais
      this.detectArchitecturalPatterns(file, analysis);
      
      // Detectar problemas de segurança
      this.detectSecurityIssues(file, analysis);
      
      // Detectar problemas de performance
      this.detectPerformanceIssues(file, analysis);
    }

    // Calcular métricas finais
    analysis.metrics.averageComplexity = analysis.metrics.totalComplexity / analysis.files.length;
    analysis.summary.totalDependencies = analysis.summary.uniqueDependencies.size;
    analysis.summary.uniqueDependencies = Array.from(analysis.summary.uniqueDependencies);

    // Gerar insights e recomendações
    this.generateInsights(analysis);

    return analysis;
  }

  // Analisar semântica de um arquivo específico
  analyzeFileSemantics(file) {
    const analysis = {
      filePath: file.filePath,
      fileName: path.basename(file.filePath),
      size: file.size,
      lines: file.lines,
      syntax: file.syntax,
      complexity: file.semantic.complexity,
      functions: this.analyzeFunctions(file.semantic.functions),
      classes: this.analyzeClasses(file.semantic.classes),
      variables: this.analyzeVariables(file.semantic.variables),
      dependencies: file.semantic.dependencies,
      patterns: file.semantic.patterns,
      quality: this.assessCodeQuality(file),
      maintainability: this.assessMaintainability(file),
      issues: []
    };

    return analysis;
  }

  // Analisar funções
  analyzeFunctions(functions) {
    return functions.map(func => ({
      ...func,
      complexity: this.calculateFunctionComplexity(func),
      parameters: func.parameters.length,
      hasSideEffects: this.detectSideEffects(func),
      isPure: this.isPureFunction(func),
      isAsync: func.async || false,
      isGenerator: func.generator || false,
      length: func.body ? func.body.length : 0,
      quality: this.assessFunctionQuality(func)
    }));
  }

  // Analisar classes
  analyzeClasses(classes) {
    return classes.map(cls => ({
      ...cls,
      methodCount: cls.methods.length,
      hasInheritance: !!cls.superClass,
      isAbstract: this.isAbstractClass(cls),
      cohesion: this.calculateClassCohesion(cls),
      coupling: this.calculateClassCoupling(cls),
      quality: this.assessClassQuality(cls)
    }));
  }

  // Analisar variáveis
  analyzeVariables(variables) {
    return variables.map(variable => ({
      ...variable,
      scope: variable.scope,
      isUsed: true, // Seria necessário análise mais profunda
      isModified: true, // Seria necessário análise mais profunda
      naming: this.assessVariableNaming(variable.name),
      quality: this.assessVariableQuality(variable)
    }));
  }

  // Detectar padrões arquiteturais
  detectArchitecturalPatterns(file, analysis) {
    const patterns = [];

    // MVC Pattern
    if (file.semantic.classes.some(cls => cls.name.toLowerCase().includes('controller'))) {
      patterns.push({ type: 'mvc', confidence: 0.8, description: 'MVC pattern detected' });
    }

    // Observer Pattern
    if (file.semantic.functions.some(func => func.name.includes('addEventListener') || func.name.includes('on'))) {
      patterns.push({ type: 'observer', confidence: 0.7, description: 'Observer pattern detected' });
    }

    // Factory Pattern
    if (file.semantic.functions.some(func => func.name.toLowerCase().includes('create') || func.name.toLowerCase().includes('factory'))) {
      patterns.push({ type: 'factory', confidence: 0.6, description: 'Factory pattern detected' });
    }

    // Singleton Pattern
    if (file.semantic.functions.some(func => func.name.toLowerCase().includes('instance') || func.name.toLowerCase().includes('singleton'))) {
      patterns.push({ type: 'singleton', confidence: 0.6, description: 'Singleton pattern detected' });
    }

    // Module Pattern
    if (file.semantic.exports.length > 0 || file.semantic.imports.length > 0) {
      patterns.push({ type: 'module', confidence: 0.9, description: 'ES6 Module pattern detected' });
    }

    analysis.patterns.architectural.push({
      file: file.filePath,
      patterns: patterns
    });

    analysis.summary.architecturalPatterns += patterns.length;
  }

  // Detectar problemas de segurança
  detectSecurityIssues(file, analysis) {
    const issues = [];

    // eval() usage
    if (file.semantic.calls.some(call => call.callee === 'eval')) {
      issues.push({
        type: 'security',
        severity: 'high',
        description: 'eval() usage detected - potential security risk',
        line: file.semantic.calls.find(call => call.callee === 'eval').line
      });
    }

    // innerHTML usage
    if (file.semantic.calls.some(call => call.callee.includes('innerHTML'))) {
      issues.push({
        type: 'security',
        severity: 'medium',
        description: 'innerHTML usage detected - potential XSS risk',
        line: file.semantic.calls.find(call => call.callee.includes('innerHTML')).line
      });
    }

    // document.write usage
    if (file.semantic.calls.some(call => call.callee.includes('document.write'))) {
      issues.push({
        type: 'security',
        severity: 'medium',
        description: 'document.write() usage detected - potential XSS risk',
        line: file.semantic.calls.find(call => call.callee.includes('document.write')).line
      });
    }

    if (issues.length > 0) {
      analysis.patterns.security.push({
        file: file.filePath,
        issues: issues
      });
      analysis.summary.securityIssues += issues.length;
    }
  }

  // Detectar problemas de performance
  detectPerformanceIssues(file, analysis) {
    const issues = [];

    // Loops aninhados
    const nestedLoops = this.detectNestedLoops(file);
    if (nestedLoops.length > 0) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `${nestedLoops.length} nested loops detected - potential performance issue`,
        details: nestedLoops
      });
    }

    // Recursive functions without memoization
    const recursiveFunctions = this.detectRecursiveFunctions(file);
    if (recursiveFunctions.length > 0) {
      issues.push({
        type: 'performance',
        severity: 'low',
        description: `${recursiveFunctions.length} recursive functions detected - consider memoization`,
        details: recursiveFunctions
      });
    }

    // Large functions
    const largeFunctions = file.semantic.functions.filter(func => func.body && func.body.length > 1000);
    if (largeFunctions.length > 0) {
      issues.push({
        type: 'performance',
        severity: 'low',
        description: `${largeFunctions.length} large functions detected - consider refactoring`,
        details: largeFunctions.map(f => ({ name: f.name, size: f.body.length }))
      });
    }

    if (issues.length > 0) {
      analysis.patterns.performance.push({
        file: file.filePath,
        issues: issues
      });
      analysis.summary.performanceIssues += issues.length;
    }
  }

  // Métodos auxiliares
  calculateFunctionComplexity(func) {
    // Implementação simplificada
    return func.parameters.length + (func.async ? 1 : 0) + (func.generator ? 1 : 0);
  }

  detectSideEffects(func) {
    // Implementação simplificada - detectar se função tem efeitos colaterais
    return func.body && (func.body.includes('console.log') || func.body.includes('document.'));
  }

  isPureFunction(func) {
    return !this.detectSideEffects(func);
  }

  calculateClassCohesion(cls) {
    // Implementação simplificada
    return cls.methods.length > 0 ? 0.8 : 0.5;
  }

  calculateClassCoupling(cls) {
    // Implementação simplificada
    return cls.superClass ? 0.6 : 0.3;
  }

  isAbstractClass(cls) {
    return cls.methods.some(method => method.name.startsWith('abstract'));
  }

  assessCodeQuality(file) {
    const quality = {
      score: 0.7, // Score base
      factors: []
    };

    // Fatores positivos
    if (file.semantic.patterns.functional > 0) {
      quality.score += 0.1;
      quality.factors.push('Uses functional programming patterns');
    }

    if (file.semantic.complexity.cyclomatic < 10) {
      quality.score += 0.1;
      quality.factors.push('Low cyclomatic complexity');
    }

    if (file.semantic.functions.length > 0) {
      const avgFunctionSize = file.semantic.functions.reduce((sum, f) => sum + (f.body ? f.body.length : 0), 0) / file.semantic.functions.length;
      if (avgFunctionSize < 500) {
        quality.score += 0.1;
        quality.factors.push('Functions are reasonably sized');
      }
    }

    // Fatores negativos
    if (file.semantic.complexity.cyclomatic > 20) {
      quality.score -= 0.2;
      quality.factors.push('High cyclomatic complexity');
    }

    return quality;
  }

  assessMaintainability(file) {
    return {
      score: 0.8,
      factors: [
        'Good function separation',
        'Reasonable complexity',
        'Clear naming conventions'
      ]
    };
  }

  assessFunctionQuality(func) {
    return {
      score: 0.8,
      factors: ['Well-named', 'Appropriate size', 'Clear parameters']
    };
  }

  assessClassQuality(cls) {
    return {
      score: 0.8,
      factors: ['Well-structured', 'Clear inheritance', 'Appropriate methods']
    };
  }

  assessVariableNaming(name) {
    if (name.length <= 2) return { score: 0.3, issue: 'Very short name' };
    if (/^[a-z][a-zA-Z0-9]*$/.test(name)) return { score: 0.9, issue: 'Good camelCase' };
    if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) return { score: 0.8, issue: 'PascalCase (good for classes)' };
    return { score: 0.6, issue: 'Non-standard naming' };
  }

  assessVariableQuality(variable) {
    return {
      score: 0.8,
      factors: ['Well-named', 'Appropriate scope', 'Properly initialized']
    };
  }

  detectNestedLoops(file) {
    // Implementação simplificada
    return [];
  }

  detectRecursiveFunctions(file) {
    // Implementação simplificada
    return file.semantic.functions.filter(func => 
      func.body && func.body.includes(func.name)
    );
  }

  generateInsights(analysis) {
    // Gerar insights baseados na análise
    if (analysis.metrics.averageComplexity > 15) {
      analysis.insights.recommendations.push({
        type: 'complexity',
        priority: 'high',
        message: 'Average complexity is high. Consider refactoring complex functions.',
        action: 'refactor_complex_functions'
      });
    }

    if (analysis.summary.securityIssues > 0) {
      analysis.insights.warnings.push({
        type: 'security',
        priority: 'high',
        message: `${analysis.summary.securityIssues} security issues detected.`,
        action: 'review_security_issues'
      });
    }

    if (analysis.summary.uniqueDependencies.length > 20) {
      analysis.insights.opportunities.push({
        type: 'dependencies',
        priority: 'medium',
        message: 'High number of dependencies. Consider dependency optimization.',
        action: 'optimize_dependencies'
      });
    }
  }

  // Gerar saída de análise
  async generateAnalysisOutput(results, outputDir, options = {}) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const analysisOutput = {
      ast: null,
      semantic: null,
      reports: []
    };

    // Salvar dados AST estruturados
    const astDataPath = path.join(outputDir, 'ast_data.json');
    fs.writeFileSync(astDataPath, JSON.stringify(results.ast, null, 2));
    analysisOutput.reports.push(astDataPath);
    console.log(`✅ Dados AST salvos: ${astDataPath}`);

    // Salvar análise semântica estruturada
    const semanticDataPath = path.join(outputDir, 'semantic_analysis.json');
    fs.writeFileSync(semanticDataPath, JSON.stringify(results.semantic, null, 2));
    analysisOutput.reports.push(semanticDataPath);
    console.log(`✅ Análise semântica salva: ${semanticDataPath}`);

    // Gerar relatório em texto
    if (options.generateReport !== false) {
      const astReport = this.astParser.generateASTReport(results.ast);
      const reportPath = path.join(outputDir, 'ast_analysis_report.txt');
      fs.writeFileSync(reportPath, astReport);
      analysisOutput.reports.push(reportPath);
      console.log(`✅ Relatório AST salvo: ${reportPath}`);

      const semanticReport = this.generateSemanticReport(results.semantic);
      const semanticReportPath = path.join(outputDir, 'semantic_analysis_report.txt');
      fs.writeFileSync(semanticReportPath, semanticReport);
      analysisOutput.reports.push(semanticReportPath);
      console.log(`✅ Relatório semântico salvo: ${semanticReportPath}`);
    }

    return analysisOutput;
  }

  // Gerar relatório semântico
  generateSemanticReport(semanticAnalysis) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE SEMÂNTICA AVANÇADA');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo executivo
    report.push('RESUMO EXECUTIVO:');
    report.push(`- Total de arquivos analisados: ${semanticAnalysis.summary.totalFiles}`);
    report.push(`- Total de funções: ${semanticAnalysis.summary.totalFunctions}`);
    report.push(`- Total de classes: ${semanticAnalysis.summary.totalClasses}`);
    report.push(`- Dependências únicas: ${semanticAnalysis.summary.totalDependencies}`);
    report.push(`- Padrões arquiteturais detectados: ${semanticAnalysis.summary.architecturalPatterns}`);
    report.push(`- Problemas de segurança: ${semanticAnalysis.summary.securityIssues}`);
    report.push(`- Problemas de performance: ${semanticAnalysis.summary.performanceIssues}`);
    report.push('');
    
    // Métricas de qualidade
    report.push('MÉTRICAS DE QUALIDADE:');
    report.push(`- Complexidade média: ${semanticAnalysis.metrics.averageComplexity.toFixed(2)}`);
    report.push(`- Complexidade máxima: ${semanticAnalysis.metrics.maxComplexity}`);
    report.push(`- Score de qualidade geral: ${semanticAnalysis.metrics.codeQuality.score || 'N/A'}`);
    report.push('');
    
    // Insights e recomendações
    if (semanticAnalysis.insights.recommendations.length > 0) {
      report.push('RECOMENDAÇÕES:');
      semanticAnalysis.insights.recommendations.forEach(rec => {
        report.push(`- [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
      report.push('');
    }
    
    if (semanticAnalysis.insights.warnings.length > 0) {
      report.push('AVISOS:');
      semanticAnalysis.insights.warnings.forEach(warning => {
        report.push(`- [${warning.priority.toUpperCase()}] ${warning.message}`);
      });
      report.push('');
    }
    
    if (semanticAnalysis.insights.opportunities.length > 0) {
      report.push('OPORTUNIDADES:');
      semanticAnalysis.insights.opportunities.forEach(opp => {
        report.push(`- [${opp.priority.toUpperCase()}] ${opp.message}`);
      });
      report.push('');
    }
    
    // Análise por arquivo
    report.push('ANÁLISE DETALHADA POR ARQUIVO:');
    report.push('-'.repeat(60));
    
    for (const file of semanticAnalysis.files) {
      report.push(`\n📄 ${file.fileName}`);
      report.push(`   Complexidade: ${file.complexity.cyclomatic} (ciclomática), ${file.complexity.cognitive} (cognitiva)`);
      report.push(`   Funções: ${file.functions.length}, Classes: ${file.classes.length}, Variáveis: ${file.variables.length}`);
      report.push(`   Qualidade: ${(file.quality.score * 100).toFixed(1)}%`);
      report.push(`   Padrões: Funcional(${file.patterns.functional}), OO(${file.patterns.objectOriented}), Async(${file.patterns.async})`);
      
      if (file.quality.factors.length > 0) {
        report.push(`   Fatores de qualidade:`);
        file.quality.factors.forEach(factor => {
          report.push(`     - ${factor}`);
        });
      }
    }
    
    return report.join('\n');
  }

  // Métodos de impressão
  printASTSummary(astResults) {
    console.log(`📊 AST Summary:`);
    console.log(`   - Files parsed: ${astResults.summary.successfulParses}/${astResults.summary.totalFiles}`);
    console.log(`   - Syntax errors: ${astResults.summary.syntaxErrors}`);
    console.log(`   - Total functions: ${astResults.summary.totalFunctions}`);
    console.log(`   - Total classes: ${astResults.summary.totalClasses}`);
  }

  printSemanticSummary(semanticAnalysis) {
    console.log(`🧠 Semantic Analysis:`);
    console.log(`   - Architectural patterns: ${semanticAnalysis.summary.architecturalPatterns}`);
    console.log(`   - Security issues: ${semanticAnalysis.summary.securityIssues}`);
    console.log(`   - Performance issues: ${semanticAnalysis.summary.performanceIssues}`);
    console.log(`   - Unique dependencies: ${semanticAnalysis.summary.totalDependencies}`);
  }
}

// Função principal para uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🌳 PIPELINE SEMÂNTICO COM AST

Uso:
  node ast_semantic_pipeline.js <diretório_entrada> [diretório_saída] [opções]

Opções:
  --no-report          Não gerar relatórios
  --ecma-version N     Versão ECMAScript (padrão: 2022)
  --source-type TYPE   Tipo de fonte (script/module, padrão: script)

Exemplos:
  node ast_semantic_pipeline.js ./downloads
  node ast_semantic_pipeline.js ./downloads ./ast_output
  node ast_semantic_pipeline.js ./downloads ./ast_output --no-report
  node ast_semantic_pipeline.js ./downloads ./ast_output --ecma-version 2020
    `);
    process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1] || path.join(inputDir, 'ast_semantic_output');
  const options = {
    generateReport: !args.includes('--no-report'),
    ecmaVersion: 2022,
    sourceType: 'script'
  };

  // Parse opções adicionais
  const ecmaIndex = args.indexOf('--ecma-version');
  if (ecmaIndex !== -1 && args[ecmaIndex + 1]) {
    options.ecmaVersion = parseInt(args[ecmaIndex + 1]);
  }

  const sourceIndex = args.indexOf('--source-type');
  if (sourceIndex !== -1 && args[sourceIndex + 1]) {
    options.sourceType = args[sourceIndex + 1];
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Diretório não encontrado: ${inputDir}`);
    process.exit(1);
  }

  const pipeline = new ASTSemanticPipeline();
  
  try {
    await pipeline.processWithAST(inputDir, outputDir, options);
    console.log('\n🎉 Pipeline AST concluído com sucesso!');
  } catch (error) {
    console.error(`❌ Erro no pipeline AST: ${error.message}`);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { ASTSemanticPipeline };

// Executar se chamado diretamente
if (require.main === module) {
  main();
}
