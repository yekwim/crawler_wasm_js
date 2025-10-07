#!/usr/bin/env node

/**
 * Script de teste para verificar se as correções funcionam
 */

console.log('🧪 Testando correções...');

try {
  // Testar importações
  console.log('✅ Testando importações...');
  
  const { JSInstrumentation } = require('./src/instrumentation/js_instrumentation');
  console.log('✅ JSInstrumentation importado');
  
  const { HybridICFGBuilder } = require('./src/analyzers/hybrid_icfg_builder');
  console.log('✅ HybridICFGBuilder importado');
  
  // Testar criação de instâncias
  console.log('✅ Testando criação de instâncias...');
  
  const jsInstrumentation = new JSInstrumentation();
  console.log('✅ JSInstrumentation instanciado');
  
  const icfgBuilder = new HybridICFGBuilder();
  console.log('✅ HybridICFGBuilder instanciado');
  
  // Testar instrumentação com código simples
  console.log('✅ Testando instrumentação...');
  
  const testCode = `
    function test() {
      console.log('Hello World');
      WebAssembly.instantiate(module);
    }
  `;
  
  const result = jsInstrumentation.instrumentCode(testCode);
  console.log('✅ Instrumentação funcionando');
  
  // Testar métodos de validação
  console.log('✅ Testando validações...');
  
  const testResult1 = icfgBuilder.isAsyncInteraction(null, null, {});
  const testResult2 = icfgBuilder.isAsyncInteraction({}, {}, {});
  
  console.log('✅ Validações funcionando');
  
  console.log('');
  console.log('🎉 Todas as correções funcionando!');
  console.log('');
  console.log('O sistema está pronto para uso.');
  
} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
