#!/usr/bin/env node

/**
 * Índice principal do projeto - Análise de Código e Detecção de Mining
 * 
 * Este arquivo centraliza todas as exportações principais do projeto
 * para facilitar o uso e manutenção.
 */

// Analisadores
const { CodeAnalyzer } = require('./analyzers/parser.js');
const { CodeNormalizer } = require('./analyzers/normalizer.js');
const { ASTParser } = require('./analyzers/ast_parser.js');
const { EnhancedWasmAnalyzer } = require('./analyzers/enhanced_wasm_analyzer.js');

// Pipelines
const { SemanticPipeline } = require('./pipelines/semantic_pipeline.js');
const { WasmPipeline } = require('./pipelines/wasm_pipeline.js');
const { ASTSemanticPipeline } = require('./pipelines/ast_semantic_pipeline.js');
const { IntegratedPipeline, runIntegratedPipeline } = require('./pipelines/integrated_pipeline.js');

// Utilitários
const { analyzeAndNormalize } = require('./utils/analyze_and_normalize.js');
const { EnhancedParser } = require('./utils/enhanced_parser.js');

// Exportações principais
module.exports = {
  // Analisadores
  CodeAnalyzer,
  CodeNormalizer,
  ASTParser,
  EnhancedWasmAnalyzer,
  
  // Pipelines
  SemanticPipeline,
  WasmPipeline,
  ASTSemanticPipeline,
  IntegratedPipeline,
  runIntegratedPipeline,
  
  // Utilitários
  analyzeAndNormalize,
  EnhancedParser,
  
  // Versão
  version: '2.0.0'
};

// Função principal para execução direta
if (require.main === module) {
  console.log('🚀 Sistema de Análise de Código e Detecção de Mining v2.0.0');
  console.log('');
  console.log('📋 Comandos disponíveis:');
  console.log('  npm run integrated    - Pipeline completo integrado');
  console.log('  npm run ast          - Análise AST para JavaScript');
  console.log('  npm run semantic     - Pipeline semântico tradicional');
  console.log('  npm run wasm         - Pipeline para WebAssembly');
  console.log('  npm run test-integrated - Testes do pipeline integrado');
  console.log('');
  console.log('📚 Documentação: docs/INTEGRATED_PIPELINE_README.md');
}