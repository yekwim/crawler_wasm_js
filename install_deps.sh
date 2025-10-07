#!/bin/bash

# Script de instalação de dependências para WSL
# Instala apenas as dependências que realmente existem

echo "=========================================="
echo "Instalação de Dependências - WSL"
echo "=========================================="

# Verificar se estamos no WSL
if [[ -f /proc/version ]] && grep -q Microsoft /proc/version; then
    echo "✅ Ambiente WSL detectado"
else
    echo "⚠️  Executando em ambiente não-WSL"
fi

# Limpar instalações anteriores
echo ""
echo "🧹 Limpando instalações anteriores..."
rm -rf node_modules package-lock.json

# Instalar dependências básicas uma por uma
echo ""
echo "📦 Instalando dependências básicas..."

echo "Instalando playwright..."
npm install playwright@^1.40.0 --save

echo "Instalando acorn..."
npm install acorn@^8.11.0 acorn-walk@^8.3.0 acorn-loose@^8.3.0 --save

echo "Instalando esprima..."
npm install esprima@^4.0.1 estraverse@^5.3.0 escodegen@^2.0.0 --save

echo "Instalando ws..."
npm install ws@^8.14.2 --save

echo "Instalando node-fetch..."
npm install node-fetch@^3.3.2 --save

echo "Instalando uuid..."
npm install uuid@^9.0.1 --save

echo "Instalando lodash..."
npm install lodash@^4.17.21 --save

echo "Instalando performance-now..."
npm install performance-now@^2.1.0 --save

# Instalar Playwright browsers
echo ""
echo "🎭 Instalando browsers do Playwright..."
npx playwright install chromium

# Verificar instalação
echo ""
echo "🔍 Verificando instalação..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules criado"
    
    # Contar dependências instaladas
    DEP_COUNT=$(ls node_modules | wc -l)
    echo "✅ $DEP_COUNT pacotes instalados"
else
    echo "❌ Erro: node_modules não foi criado"
    exit 1
fi

# Testar dependências
echo ""
echo "🧪 Testando dependências..."
node test_dependencies.js

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Instalação concluída com sucesso!"
    echo "=========================================="
    echo ""
    echo "Para testar o sistema:"
    echo "  node src/main.js https://example.com"
    echo ""
else
    echo ""
    echo "❌ Erro no teste de dependências"
    exit 1
fi
