@echo off
echo ============================================================
echo   ANALISADOR PRONTO PARA LLM
echo   Sistema de Analise Completa para Classificacao por LLM
echo   Versao 2.0.0 - Crawler + AST Parser + Pipeline Integrado
echo ============================================================
echo.

echo Verificando ambiente...
wsl -e bash -c "cd /home/yekwim/documentos/crawler && node --version"
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado no WSL
    pause
    exit /b 1
)

echo.
echo Iniciando analisador LLM...
wsl -e bash -c "cd /home/yekwim/documentos/crawler && node llm_analyzer.js %*"

pause
