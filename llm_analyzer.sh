#!/bin/bash

echo "============================================================"
echo "   ANALISADOR PRONTO PARA LLM"
echo "   Sistema de Análise Completa para Classificação por LLM"
echo "   Versão 2.0.0 - Crawler + AST Parser + Pipeline Integrado"
echo "============================================================"
echo

echo "Verificando ambiente..."
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado"
    exit 1
fi

echo "Node.js: $(node --version)"
echo

echo "Iniciando analisador LLM..."
node llm_analyzer.js "$@"
