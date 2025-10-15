#!/bin/bash
# Script para configurar ambiente virtual unificado

echo "🔧 Configurando ambiente virtual unificado (.venv)..."

# Verifica se Python 3 está disponível
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3 primeiro."
    exit 1
fi

# Remove ambiente virtual existente se houver
if [ -d ".venv" ]; then
    echo "Removendo ambiente virtual existente..."
    rm -rf .venv
fi

# Cria novo ambiente virtual
echo "Criando novo ambiente virtual (.venv)..."
python3 -m venv .venv

# Ativa ambiente virtual
echo "Ativando ambiente virtual..."
source .venv/bin/activate

# Atualiza pip
echo "Atualizando pip..."
pip install --upgrade pip

# Instala dependências
echo "Instalando dependências Python..."
pip install -r requirements.txt

# Instala browsers do Playwright
echo "Instalando browsers do Playwright..."
playwright install chromium

echo "✅ Ambiente configurado com sucesso!"
echo ""
echo "Para ativar o ambiente:"
echo "  source .venv/bin/activate"
echo ""
echo "Para desativar:"
echo "  deactivate"
