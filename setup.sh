#!/bin/bash

# Script de Setup do Sistema de Detecção de Mining
# Configura o ambiente WSL e instala dependências

set -e

echo "=========================================="
echo "Sistema de Detecção de Mining - Setup"
echo "=========================================="

# Verificar se estamos no WSL
if [[ -f /proc/version ]] && grep -q Microsoft /proc/version; then
    echo "✅ Ambiente WSL detectado"
else
    echo "⚠️  Aviso: Este script é otimizado para WSL"
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js encontrado: $NODE_VERSION"
    
    # Verificar versão mínima (16.0.0)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 16 ]; then
        echo "❌ Node.js versão 16.0.0 ou superior é necessária"
        echo "   Versão atual: $NODE_VERSION"
        echo "   Por favor, atualize o Node.js"
        exit 1
    fi
else
    echo "❌ Node.js não encontrado"
    echo "   Por favor, instale Node.js 16.0.0 ou superior"
    exit 1
fi

# Verificar NPM
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ NPM encontrado: $NPM_VERSION"
else
    echo "❌ NPM não encontrado"
    echo "   Por favor, instale NPM"
    exit 1
fi

# Criar diretórios necessários
echo ""
echo "📁 Criando diretórios..."
mkdir -p output
mkdir -p logs
mkdir -p temp
mkdir -p results

echo "✅ Diretórios criados"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
chmod +x install_deps.sh
./install_deps.sh

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso"
else
    echo "❌ Erro na instalação de dependências"
    echo "Tentando instalação manual..."
    npm install --legacy-peer-deps
fi

# Verificar dependências críticas
echo ""
echo "🔍 Verificando dependências críticas..."

# Verificar Playwright
if npm list playwright &> /dev/null; then
    echo "✅ Playwright instalado"
else
    echo "⚠️  Playwright não encontrado, instalando..."
    npx playwright install chromium
fi

# Verificar se o diretório node_modules existe
if [ -d "node_modules" ]; then
    echo "✅ node_modules encontrado"
else
    echo "❌ node_modules não encontrado"
    exit 1
fi

# Criar arquivo de configuração padrão
echo ""
echo "⚙️  Criando configuração padrão..."
cat > config.json << EOF
{
  "crawler": {
    "maxPages": 1,
    "headless": true,
    "timeout": 60000
  },
  "analysis": {
    "enableLLM": true,
    "enableMonitoring": true,
    "enableAlerting": true
  },
  "output": {
    "directory": "./output",
    "saveReports": true,
    "saveMetrics": true
  }
}
EOF

echo "✅ Arquivo config.json criado"

# Criar script de teste
echo ""
echo "🧪 Criando script de teste..."
cat > test_setup.js << EOF
#!/usr/bin/env node

// Script de teste para verificar se tudo está funcionando
const { crawl } = require('./src/crawler');
const { JSInstrumentation } = require('./src/instrumentation/js_instrumentation');
const { ModernWasmParser } = require('./src/analyzers/modern_wasm_parser');

async function testSetup() {
    console.log('🧪 Testando componentes...');
    
    try {
        // Testar instrumentação JS
        const jsInstrumentation = new JSInstrumentation();
        console.log('✅ JSInstrumentation carregado');
        
        // Testar parser WASM
        const wasmParser = new ModernWasmParser();
        console.log('✅ ModernWasmParser carregado');
        
        console.log('');
        console.log('🎉 Todos os componentes carregados com sucesso!');
        console.log('');
        console.log('Para testar o sistema completo, execute:');
        console.log('node src/main.js https://example.com');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        process.exit(1);
    }
}

testSetup();
EOF

chmod +x test_setup.js
echo "✅ Script de teste criado"

# Executar teste
echo ""
echo "🧪 Executando teste de componentes..."
node test_setup.js

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Setup concluído com sucesso!"
    echo "=========================================="
    echo ""
    echo "Comandos disponíveis:"
    echo "  node src/main.js <URL>                    # Executar análise completa"
    echo "  node src/main.js <URL> --help             # Ver opções disponíveis"
    echo "  node test_setup.js                        # Testar componentes"
    echo ""
    echo "Exemplos:"
    echo "  node src/main.js https://example.com"
    echo "  node src/main.js https://example.com --output-dir ./results"
    echo "  node src/main.js https://example.com --max-pages 3"
    echo ""
    echo "📁 Diretórios criados:"
    echo "  ./output    - Resultados de análise"
    echo "  ./logs      - Logs do sistema"
    echo "  ./temp      - Arquivos temporários"
    echo "  ./results   - Relatórios finais"
    echo ""
else
    echo "❌ Erro no teste de componentes"
    exit 1
fi

# Limpar arquivo de teste
rm -f test_setup.js

echo "🚀 Sistema pronto para uso!"
