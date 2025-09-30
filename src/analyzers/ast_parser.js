#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');

class ASTParser {
  constructor(options = {}) {
    this.options = {
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true,
      ranges: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      allowHashBang: true,
      ...options
    };
    
    this.parsedFiles = new Map();
    this.errors = [];
  }

  // Parse um arquivo JavaScript usando AST
  parseFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Limpar conteúdo: remover BOM e linhas vazias no início/fim
      content = content.replace(/^\uFEFF/, '').trim();
      
      const result = {
        filePath,
        content,
        size: content.length,
        lines: content.split('\n').length,
        ast: null,
        syntax: null,
        semantic: null,
        errors: []
      };

      // Tentar parsing com diferentes configurações
      try {
        // Primeiro, tentar como script comum (mais compatível)
        result.ast = acorn.parse(content, {
          ...this.options,
          sourceType: 'script'
        });
        result.syntax = 'script';
      } catch (scriptError) {
        try {
          // Se falhar, tentar como módulo ES6
          result.ast = acorn.parse(content, {
            ...this.options,
            sourceType: 'module'
          });
          result.syntax = 'es6-module';
        } catch (moduleError) {
          try {
            // Se ainda falhar, usar acorn-loose para código malformado
            const acornLoose = require('acorn-loose');
            result.ast = acornLoose.parse(content, {
              ecmaVersion: this.options.ecmaVersion,
              sourceType: this.options.sourceType,
              locations: this.options.locations,
              ranges: this.options.ranges
            });
            result.syntax = 'loose';
            result.errors.push({
              type: 'syntax_error',
              message: scriptError.message,
              line: scriptError.loc ? scriptError.loc.line : null,
              column: scriptError.loc ? scriptError.loc.column : null
            });
          } catch (looseError) {
            // Se tudo falhar, retornar erro
            throw looseError;
          }
        }
      }

      // Analisar semântica do AST
      if (result.ast) {
        result.semantic = this.analyzeAST(result.ast, result.content);
      }

      this.parsedFiles.set(filePath, result);
      return result;

    } catch (error) {
      const errorResult = {
        filePath,
        error: error.message,
        ast: null,
        syntax: null,
        semantic: null,
        errors: [{
          type: 'parse_error',
          message: error.message,
          line: error.loc ? error.loc.line : null,
          column: error.loc ? error.loc.column : null
        }]
      };
      
      this.errors.push({
        file: filePath,
        error: error.message
      });
      
      return errorResult;
    }
  }

  // Analisar semântica do AST
  analyzeAST(ast, content) {
    const analysis = {
      functions: [],
      variables: [],
      classes: [],
      imports: [],
      exports: [],
      calls: [],
      assignments: [],
      controlFlow: [],
      patterns: {
        functional: 0,
        objectOriented: 0,
        procedural: 0,
        eventDriven: 0,
        async: 0
      },
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        nesting: 0
      },
      dependencies: new Set(),
      metadata: {
        analyzedAt: new Date().toISOString(),
        language: 'javascript',
        version: 'es6+'
      }
    };

    // Walker para analisar o AST
    walk.simple(ast, {
      // Funções
      FunctionDeclaration: (node) => {
        analysis.functions.push({
          name: node.id ? node.id.name : 'anonymous',
          type: 'function_declaration',
          parameters: node.params.map(p => ({
            name: p.name || p.type,
            type: p.type,
            optional: p.optional || false
          })),
          async: node.async || false,
          generator: node.generator || false,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          body: this.extractFunctionBody(node.body, content)
        });
        analysis.patterns.procedural++;
      },

      FunctionExpression: (node) => {
        analysis.functions.push({
          name: node.id ? node.id.name : 'anonymous',
          type: 'function_expression',
          parameters: node.params.map(p => ({
            name: p.name || p.type,
            type: p.type,
            optional: p.optional || false
          })),
          async: node.async || false,
          generator: node.generator || false,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          body: this.extractFunctionBody(node.body, content)
        });
      },

      ArrowFunctionExpression: (node) => {
        analysis.functions.push({
          name: 'arrow_function',
          type: 'arrow_function',
          parameters: node.params.map(p => ({
            name: p.name || p.type,
            type: p.type,
            optional: p.optional || false
          })),
          async: node.async || false,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          body: this.extractFunctionBody(node.body, content)
        });
        analysis.patterns.functional++;
      },

      // Variáveis
      VariableDeclarator: (node) => {
        if (node.id.type === 'Identifier') {
          analysis.variables.push({
            name: node.id.name,
            type: 'variable',
            kind: this.getVariableKind(node),
            initialized: !!node.init,
            value: node.init ? this.extractNodeValue(node.init, content) : null,
            line: node.loc.start.line,
            column: node.loc.start.column,
            scope: this.determineScope(node)
          });
        }
      },

      // Classes
      ClassDeclaration: (node) => {
        analysis.classes.push({
          name: node.id ? node.id.name : 'anonymous',
          type: 'class_declaration',
          superClass: node.superClass ? node.superClass.name : null,
          methods: this.extractClassMethods(node.body.body),
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line
        });
        analysis.patterns.objectOriented++;
      },

      ClassExpression: (node) => {
        analysis.classes.push({
          name: node.id ? node.id.name : 'anonymous',
          type: 'class_expression',
          superClass: node.superClass ? node.superClass.name : null,
          methods: this.extractClassMethods(node.body.body),
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line
        });
        analysis.patterns.objectOriented++;
      },

      // Imports
      ImportDeclaration: (node) => {
        analysis.imports.push({
          source: node.source.value,
          specifiers: node.specifiers.map(spec => ({
            type: spec.type,
            imported: spec.imported ? spec.imported.name : null,
            local: spec.local ? spec.local.name : null
          })),
          line: node.loc.start.line,
          column: node.loc.start.column
        });
        analysis.dependencies.add(node.source.value);
      },

      // Exports
      ExportDefaultDeclaration: (node) => {
        analysis.exports.push({
          type: 'default',
          declaration: node.declaration.type,
          name: this.getExportName(node.declaration),
          line: node.loc.start.line,
          column: node.loc.start.column
        });
      },

      ExportNamedDeclaration: (node) => {
        analysis.exports.push({
          type: 'named',
          specifiers: node.specifiers.map(spec => ({
            local: spec.local.name,
            exported: spec.exported.name
          })),
          source: node.source ? node.source.value : null,
          line: node.loc.start.line,
          column: node.loc.start.column
        });
      },

      // Chamadas de função
      CallExpression: (node) => {
        const callInfo = {
          callee: this.getCallName(node.callee),
          arguments: node.arguments.length,
          line: node.loc.start.line,
          column: node.loc.start.column,
          type: this.classifyCall(node.callee)
        };
        
        analysis.calls.push(callInfo);
        
        // Detectar padrões específicos
        if (callInfo.callee === 'addEventListener' || callInfo.callee.includes('on')) {
          analysis.patterns.eventDriven++;
        }
        
        if (callInfo.callee === 'require') {
          const arg = node.arguments[0];
          if (arg && arg.type === 'Literal') {
            analysis.dependencies.add(arg.value);
          }
        }
      },

      // Controle de fluxo
      IfStatement: (node) => {
        analysis.controlFlow.push({
          type: 'if',
          line: node.loc.start.line,
          column: node.loc.start.column,
          complexity: this.calculateConditionComplexity(node.test)
        });
        analysis.complexity.cyclomatic++;
      },

      ForStatement: (node) => {
        analysis.controlFlow.push({
          type: 'for',
          line: node.loc.start.line,
          column: node.loc.start.column
        });
        analysis.complexity.cyclomatic++;
      },

      WhileStatement: (node) => {
        analysis.controlFlow.push({
          type: 'while',
          line: node.loc.start.line,
          column: node.loc.start.column
        });
        analysis.complexity.cyclomatic++;
      },

      SwitchStatement: (node) => {
        analysis.controlFlow.push({
          type: 'switch',
          line: node.loc.start.line,
          column: node.loc.start.column,
          cases: node.cases.length
        });
        analysis.complexity.cyclomatic += node.cases.length;
      },

      TryStatement: (node) => {
        analysis.controlFlow.push({
          type: 'try_catch',
          line: node.loc.start.line,
          column: node.loc.start.column
        });
      },

      // Async/Await
      AwaitExpression: (node) => {
        analysis.patterns.async++;
      }
    });

    // Converter Set para Array
    analysis.dependencies = Array.from(analysis.dependencies);

    // Calcular complexidade cognitiva
    analysis.complexity.cognitive = this.calculateCognitiveComplexity(ast);

    return analysis;
  }

  // Utilitários
  extractFunctionBody(body, content) {
    if (body.type === 'BlockStatement') {
      return content.substring(body.start, body.end);
    }
    return content.substring(body.start, body.end);
  }

  extractNodeValue(node, content) {
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return node.name;
      case 'ArrayExpression':
        return `[${node.elements.length} items]`;
      case 'ObjectExpression':
        return `{${node.properties.length} properties}`;
      default:
        return content.substring(node.start, node.end);
    }
  }

  getVariableKind(node) {
    // Determinar se é var, let, const baseado no contexto
    return 'unknown'; // Seria necessário mais contexto do AST
  }

  determineScope(node) {
    // Determinar escopo baseado na posição no AST
    return 'unknown';
  }

  extractClassMethods(body) {
    return body.filter(method => 
      method.type === 'MethodDefinition' || method.type === 'ClassProperty'
    ).map(method => ({
      name: method.key.name || method.key.value,
      type: method.type,
      static: method.static || false,
      kind: method.kind || 'method'
    }));
  }

  getCallName(callee) {
    switch (callee.type) {
      case 'Identifier':
        return callee.name;
      case 'MemberExpression':
        return `${this.getCallName(callee.object)}.${callee.property.name}`;
      default:
        return 'unknown';
    }
  }

  classifyCall(callee) {
    const name = this.getCallName(callee);
    if (name.includes('.')) return 'method';
    return 'function';
  }

  getExportName(declaration) {
    switch (declaration.type) {
      case 'Identifier':
        return declaration.name;
      case 'FunctionDeclaration':
        return declaration.id ? declaration.id.name : 'anonymous';
      case 'ClassDeclaration':
        return declaration.id ? declaration.id.name : 'anonymous';
      default:
        return 'unknown';
    }
  }

  calculateConditionComplexity(test) {
    // Calcular complexidade de condições (&&, ||, ?)
    let complexity = 1;
    walk.simple(test, {
      LogicalExpression: () => complexity++,
      ConditionalExpression: () => complexity++
    });
    return complexity;
  }

  calculateCognitiveComplexity(ast) {
    let complexity = 0;
    walk.simple(ast, {
      IfStatement: () => complexity++,
      ForStatement: () => complexity++,
      WhileStatement: () => complexity++,
      SwitchStatement: () => complexity++,
      TryStatement: () => complexity++,
      CatchClause: () => complexity++,
      LogicalExpression: () => complexity++
    });
    return complexity;
  }

  // Parse múltiplos arquivos
  parseDirectory(dirPath) {
    const results = [];
    const jsFiles = this.findJavaScriptFiles(dirPath);
    
    console.log(`🔍 Encontrados ${jsFiles.length} arquivos JavaScript para análise AST...`);
    
    for (const file of jsFiles) {
      console.log(`📄 Analisando: ${path.basename(file)}`);
      const result = this.parseFile(file);
      results.push(result);
    }
    
    return {
      files: results,
      summary: {
        totalFiles: results.length,
        successfulParses: results.filter(r => r.ast !== null).length,
        syntaxErrors: results.filter(r => r.errors.length > 0).length,
        totalFunctions: results.reduce((sum, r) => sum + (r.semantic ? r.semantic.functions.length : 0), 0),
        totalClasses: results.reduce((sum, r) => sum + (r.semantic ? r.semantic.classes.length : 0), 0),
        totalVariables: results.reduce((sum, r) => sum + (r.semantic ? r.semantic.variables.length : 0), 0)
      }
    };
  }

  findJavaScriptFiles(dirPath) {
    const files = [];
    
    function traverse(currentDir) {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            traverse(fullPath);
          } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.js') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao acessar diretório ${currentDir}: ${error.message}`);
      }
    }
    
    traverse(dirPath);
    return files;
  }

  // Gerar relatório de análise AST
  generateASTReport(analysis) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE AST (ABSTRACT SYNTAX TREE)');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo geral
    report.push('RESUMO GERAL:');
    report.push(`- Total de arquivos: ${analysis.summary.totalFiles}`);
    report.push(`- Parses bem-sucedidos: ${analysis.summary.successfulParses}`);
    report.push(`- Erros de sintaxe: ${analysis.summary.syntaxErrors}`);
    report.push(`- Total de funções: ${analysis.summary.totalFunctions}`);
    report.push(`- Total de classes: ${analysis.summary.totalClasses}`);
    report.push(`- Total de variáveis: ${analysis.summary.totalVariables}`);
    report.push('');
    
    // Análise detalhada por arquivo
    report.push('ANÁLISE DETALHADA POR ARQUIVO:');
    report.push('-'.repeat(60));
    
    for (const file of analysis.files) {
      report.push(`\n📄 Arquivo: ${path.basename(file.filePath)}`);
      report.push(`   Caminho: ${file.filePath}`);
      report.push(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
      report.push(`   Linhas: ${file.lines}`);
      report.push(`   Sintaxe: ${file.syntax || 'erro'}`);
      
      if (file.errors.length > 0) {
        report.push('   ❌ Erros:');
        for (const error of file.errors) {
          report.push(`     - ${error.type}: ${error.message}`);
          if (error.line) {
            report.push(`       Linha ${error.line}, Coluna ${error.column}`);
          }
        }
      }
      
      if (file.semantic) {
        const s = file.semantic;
        report.push(`   📊 Semântica:`);
        report.push(`     - Funções: ${s.functions.length}`);
        report.push(`     - Classes: ${s.classes.length}`);
        report.push(`     - Variáveis: ${s.variables.length}`);
        report.push(`     - Imports: ${s.imports.length}`);
        report.push(`     - Exports: ${s.exports.length}`);
        report.push(`     - Dependências: ${s.dependencies.length}`);
        report.push(`     - Complexidade Ciclomática: ${s.complexity.cyclomatic}`);
        report.push(`     - Complexidade Cognitiva: ${s.complexity.cognitive}`);
        
        // Padrões de programação
        report.push(`   🎯 Padrões:`);
        report.push(`     - Funcional: ${s.patterns.functional}`);
        report.push(`     - Orientado a Objetos: ${s.patterns.objectOriented}`);
        report.push(`     - Procedural: ${s.patterns.procedural}`);
        report.push(`     - Event-Driven: ${s.patterns.eventDriven}`);
        report.push(`     - Async: ${s.patterns.async}`);
        
        // Funções importantes
        if (s.functions.length > 0) {
          report.push(`   🔧 Funções principais:`);
          s.functions.slice(0, 5).forEach(func => {
            report.push(`     - ${func.name}(${func.parameters.map(p => p.name).join(', ')}) [${func.type}]`);
          });
          if (s.functions.length > 5) {
            report.push(`     ... e mais ${s.functions.length - 5} funções`);
          }
        }
        
        // Dependências
        if (s.dependencies.length > 0) {
          report.push(`   📦 Dependências:`);
          s.dependencies.slice(0, 10).forEach(dep => {
            report.push(`     - ${dep}`);
          });
          if (s.dependencies.length > 10) {
            report.push(`     ... e mais ${s.dependencies.length - 10} dependências`);
          }
        }
      }
    }
    
    return report.join('\n');
  }
}

module.exports = { ASTParser };
