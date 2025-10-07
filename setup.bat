@echo off
REM Script de Setup do Sistema de Detecção de Mining para Windows/WSL
REM Configura o ambiente e instala dependências

echo ==========================================
echo Sistema de Detecção de Mining - Setup
echo ==========================================

REM Verificar se estamos no WSL
where wsl >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Ambiente WSL detectado
) else (
    echo ⚠️  Aviso: Este script é otimizado para WSL
    echo    Para melhor experiência, execute no WSL
)

REM Verificar Node.js
node --version >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: %NODE_VERSION%
) else (
    echo ❌ Node.js não encontrado
    echo    Por favor, instale Node.js 16.0.0 ou superior
    pause
    exit /b 1
)

REM Verificar NPM
npm --version >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ NPM encontrado: %NPM_VERSION%
) else (
    echo ❌ NPM não encontrado
    echo    Por favor, instale NPM
    pause
    exit /b 1
)

REM Criar diretórios necessários
echo.
echo 📁 Criando diretórios...
if not exist "output" mkdir output
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp
if not exist "results" mkdir results

echo ✅ Diretórios criados

REM Instalar dependências
echo.
echo 📦 Instalando dependências...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependências instaladas com sucesso
) else (
    echo ❌ Erro na instalação de dependências
    pause
    exit /b 1
)

REM Verificar dependências críticas
echo.
echo 🔍 Verificando dependências críticas...

REM Verificar se o diretório node_modules existe
if exist "node_modules" (
    echo ✅ node_modules encontrado
) else (
    echo ❌ node_modules não encontrado
    pause
    exit /b 1
)

REM Criar arquivo de configuração padrão
echo.
echo ⚙️  Criando configuração padrão...
(
echo {
echo   "crawler": {
echo     "maxPages": 1,
echo     "headless": true,
echo     "timeout": 60000
echo   },
echo   "analysis": {
echo     "enableLLM": true,
echo     "enableMonitoring": true,
echo     "enableAlerting": true
echo   },
echo   "output": {
echo     "directory": "./output",
echo     "saveReports": true,
echo     "saveMetrics": true
echo   }
echo }
) > config.json

echo ✅ Arquivo config.json criado

REM Criar script de teste
echo.
echo 🧪 Criando script de teste...
(
echo // Script de teste para verificar se tudo está funcionando
echo const { crawl } = require('./src/crawler'^);
echo const { JSInstrumentation } = require('./src/instrumentation/js_instrumentation'^);
echo const { ModernWasmParser } = require('./src/analyzers/modern_wasm_parser'^);
echo.
echo async function testSetup(^) {
echo     console.log('🧪 Testando componentes...'^);
echo     
echo     try {
echo         // Testar instrumentação JS
echo         const jsInstrumentation = new JSInstrumentation(^);
echo         console.log('✅ JSInstrumentation carregado'^);
echo         
echo         // Testar parser WASM
echo         const wasmParser = new ModernWasmParser(^);
echo         console.log('✅ ModernWasmParser carregado'^);
echo         
echo         console.log(''^);
echo         console.log('🎉 Todos os componentes carregados com sucesso!'^);
echo         console.log(''^);
echo         console.log('Para testar o sistema completo, execute:'^);
echo         console.log('node src/main.js https://example.com'^);
echo         
echo     } catch (error^) {
echo         console.error('❌ Erro no teste:', error.message^);
echo         process.exit(1^);
echo     }
echo }
echo.
echo testSetup(^);
) > test_setup.js

echo ✅ Script de teste criado

REM Executar teste
echo.
echo 🧪 Executando teste de componentes...
node test_setup.js

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo ✅ Setup concluído com sucesso!
    echo ==========================================
    echo.
    echo Comandos disponíveis:
    echo   node src/main.js ^<URL^>                    # Executar análise completa
    echo   node src/main.js ^<URL^> --help             # Ver opções disponíveis
    echo   node test_setup.js                        # Testar componentes
    echo.
    echo Exemplos:
    echo   node src/main.js https://example.com
    echo   node src/main.js https://example.com --output-dir ./results
    echo   node src/main.js https://example.com --max-pages 3
    echo.
    echo 📁 Diretórios criados:
    echo   ./output    - Resultados de análise
    echo   ./logs      - Logs do sistema
    echo   ./temp      - Arquivos temporários
    echo   ./results   - Relatórios finais
    echo.
) else (
    echo ❌ Erro no teste de componentes
    pause
    exit /b 1
)

REM Limpar arquivo de teste
del test_setup.js

echo 🚀 Sistema pronto para uso!
pause
