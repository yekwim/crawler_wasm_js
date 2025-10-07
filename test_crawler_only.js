#!/usr/bin/env node

/**
 * Script para testar apenas o crawling sem instrumentação
 */

const { crawl } = require('./src/crawler');

async function testCrawlerOnly() {
  console.log('🧪 Testando apenas o crawling...');
  
  const testUrl = process.argv[2] || 'https://example.com';
  
  try {
    console.log(`URL de teste: ${testUrl}`);
    
    await crawl(testUrl, './test_output', {
      maxPages: 1,
      headless: true
    });
    
    console.log('✅ Crawling funcionando!');
    console.log('Verifique a pasta ./test_output para os resultados.');
    
  } catch (error) {
    console.error('❌ Erro no crawling:', error.message);
    process.exit(1);
  }
}

testCrawlerOnly();
