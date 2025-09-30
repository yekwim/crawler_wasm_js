#!/usr/bin/env node

const acorn = require('acorn');

// Teste direto com Acorn
const testCode = `function hello(name) {
  console.log('Hello, ' + name);
}

const message = 'World';
hello(message);`;

console.log('🔍 Testando parsing AST direto com Acorn...');
console.log('Código de teste:');
console.log(testCode);
console.log('\n' + '='.repeat(50));

try {
  console.log('Tentando parsing...');
  const ast = acorn.parse(testCode, {
    ecmaVersion: 2022,
    sourceType: 'script',
    locations: true,
    ranges: true
  });
  
  console.log('✅ Parsing bem-sucedido!');
  console.log('AST criado:', !!ast);
  console.log('Tipo do programa:', ast.type);
  console.log('Número de declarações:', ast.body.length);
  
  ast.body.forEach((node, i) => {
    console.log(`  ${i + 1}. ${node.type}`);
    if (node.type === 'FunctionDeclaration') {
      console.log(`     Nome: ${node.id.name}`);
      console.log(`     Parâmetros: ${node.params.length}`);
    }
    if (node.type === 'VariableDeclaration') {
      console.log(`     Variáveis: ${node.declarations.length}`);
      node.declarations.forEach(decl => {
        console.log(`       - ${decl.id.name}`);
      });
    }
  });
  
} catch (error) {
  console.error('❌ Erro no parsing:', error.message);
}

// Agora teste com o nosso parser
console.log('\n' + '='.repeat(50));
console.log('🔍 Testando com nosso parser...');

try {
  const { ASTParser } = require('./ast_parser.js');
  const parser = new ASTParser();
  const result = parser.parseFile('./test_samples/simple_example.js');
  
  console.log('✅ Parsing concluído');
  console.log('Sintaxe:', result.syntax);
  console.log('AST criado:', !!result.ast);
  console.log('Análise semântica:', !!result.semantic);
  console.log('Erros:', result.errors.length);
  
  if (result.errors.length > 0) {
    console.log('Erros encontrados:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.type}: ${error.message}`);
      if (error.line) {
        console.log(`     Linha ${error.line}, Coluna ${error.column}`);
      }
    });
  }
  
  if (result.semantic) {
    console.log('\n📊 Análise semântica:');
    console.log(`  Funções: ${result.semantic.functions.length}`);
    console.log(`  Variáveis: ${result.semantic.variables.length}`);
    console.log(`  Classes: ${result.semantic.classes.length}`);
  }
  
} catch (error) {
  console.error('❌ Erro no parsing:', error.message);
  console.error('Stack:', error.stack);
}
