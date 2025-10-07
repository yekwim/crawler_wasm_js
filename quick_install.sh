#!/bin/bash

# Instalação rápida e simples das dependências

echo "🚀 Instalação rápida das dependências..."

# Limpar tudo
rm -rf node_modules package-lock.json

# Instalar apenas o essencial
echo "📦 Instalando dependências essenciais..."
npm install --legacy-peer-deps playwright acorn acorn-walk acorn-loose esprima estraverse escodegen ws node-fetch uuid lodash performance-now

# Instalar browsers do Playwright
echo "🎭 Instalando browsers..."
npx playwright install chromium

# Testar
echo "🧪 Testando..."
node test_dependencies.js

echo "✅ Instalação concluída!"
