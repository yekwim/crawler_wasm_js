#!/usr/bin/env node

/**
 * Script de teste para verificar se as dependências estão funcionando
 */

console.log('🧪 Testando dependências...');

try {
  // Testar dependências básicas do Node.js
  console.log('✅ Node.js básico funcionando');
  
  // Testar fs (built-in)
  const fs = require('fs');
  console.log('✅ fs (built-in) funcionando');
  
  // Testar path (built-in)
  const path = require('path');
  console.log('✅ path (built-in) funcionando');
  
  // Testar crypto (built-in)
  const crypto = require('crypto');
  console.log('✅ crypto (built-in) funcionando');
  
  // Testar os (built-in)
  const os = require('os');
  console.log('✅ os (built-in) funcionando');
  
  // Testar perf_hooks (built-in)
  const { performance } = require('perf_hooks');
  console.log('✅ perf_hooks (built-in) funcionando');
  
  // Testar events (built-in)
  const EventEmitter = require('events');
  console.log('✅ events (built-in) funcionando');
  
  console.log('');
  console.log('📦 Testando dependências externas...');
  
  // Testar dependências que devem estar instaladas
  try {
    const acorn = require('acorn');
    console.log('✅ acorn funcionando');
  } catch (e) {
    console.log('❌ acorn não encontrado:', e.message);
  }
  
  try {
    const playwright = require('playwright');
    console.log('✅ playwright funcionando');
  } catch (e) {
    console.log('❌ playwright não encontrado:', e.message);
  }
  
  try {
    const lodash = require('lodash');
    console.log('✅ lodash funcionando');
  } catch (e) {
    console.log('❌ lodash não encontrado:', e.message);
  }
  
  try {
    const uuid = require('uuid');
    console.log('✅ uuid funcionando');
  } catch (e) {
    console.log('❌ uuid não encontrado:', e.message);
  }
  
  console.log('');
  console.log('🎉 Teste de dependências concluído!');
  
} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  process.exit(1);
}
