# 🚀 Início Rápido - Sistema de Análise de Código

## ⚡ Iniciar com Funções Essenciais

### 🪟 Windows
```cmd
start.bat
```

### 🐧 Linux/WSL
```bash
./start.sh
```

### 🔧 Manual
```bash
node start.js
```

## 📋 Menu Principal

O sistema oferece um menu interativo com as seguintes opções:

### 1. 🔍 Crawler
- Baixa ficheiros JavaScript e WASM de qualquer website
- Detecta automaticamente recursos relevantes
- Salva ficheiros organizados por domínio

### 2. 📊 Análise
- Analisa ficheiros baixados
- Detecta ofuscação e padrões suspeitos
- Gera relatórios detalhados

### 3. 🔧 Pipeline Integrado
- Executa análise completa
- Combina múltiplas técnicas de análise
- Gera relatórios consolidados

### 4. 🧪 Testes
- Executa testes do sistema
- Verifica funcionalidades
- Valida instalação

### 5. 📁 Ver Downloads
- Lista ficheiros baixados
- Mostra estatísticas
- Organiza por tipo (JS/WASM)

### 6. 🚀 Início Rápido
- Exemplo completo com WebDollar.io
- Baixa e analisa automaticamente
- Demonstra todas as funcionalidades

## 🎯 Exemplo de Uso Rápido

1. **Execute o sistema:**
   ```bash
   node start.js
   ```

2. **Escolha opção 6** (Início Rápido)

3. **Aguarde a conclusão** - o sistema irá:
   - Baixar ficheiros do WebDollar.io
   - Analisar código JavaScript e WASM
   - Gerar relatórios de análise
   - Mostrar resultados

4. **Verifique os resultados** na pasta `./analysis_output`

## 📁 Estrutura de Saída

```
analysis_output/
├── general_report.txt          # Relatório geral
├── javascript_report.txt       # Análise de JavaScript
├── wasm_report.txt            # Análise de WebAssembly
├── mining_report.txt          # Detecção de mining
└── analysis_results.json      # Dados estruturados
```

## 🔧 Comandos Avançados

### Crawler Direto
```bash
node src/crawler.js https://example.com ./downloads 1
```

### Pipeline Integrado
```bash
node src/pipelines/integrated_pipeline.js
```

### Testes Específicos
```bash
npm run test-integrated
npm run test-crawler
npm run test-webdollar
```

## 🆘 Resolução de Problemas

### Node.js não encontrado
```bash
# Instalar Node.js no WSL
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Playwright não instalado
```bash
npm install playwright
npx playwright install
```

### Dependências em falta
```bash
npm install
```

## 📚 Documentação Completa

- `docs/README.md` - Documentação principal
- `docs/INTEGRATED_PIPELINE_README.md` - Pipeline integrado
- `docs/PIPELINE_DOCUMENTATION.md` - Documentação técnica

## 🎉 Pronto para Usar!

O sistema está configurado e pronto para analisar código JavaScript e WebAssembly. Comece com o **Início Rápido** para ver todas as funcionalidades em ação!
