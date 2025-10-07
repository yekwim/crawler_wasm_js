# Sistema de Detecção de Mining - Crawler WASM/JS Aprimorado

Um sistema avançado de detecção de atividades de cryptocurrency mining em websites, implementando análise híbrida de JavaScript e WebAssembly com suporte completo a features modernas.

## 🚀 Características Principais

### Coleta e Pré-processamento
- ✅ Extração de scripts JS e binários WASM do site
- ✅ Instrumentação JS para capturar chamadas a WebAssembly, WebWorkers e WebSockets
- ✅ Parser WASM moderno com suporte a SIMD, threads, memory64, e outras features avançadas

### Construção do ICFG Híbrido
- ✅ Grafo unificado representando funções Wasm e JS
- ✅ Análise de interações assíncronas e síncronas
- ✅ Mapeamento completo de fluxo de controle e dados

### Robustez e Transformações
- ✅ Simulação de evasões (no-ops, reorder, rename)
- ✅ Teste de resiliência contra técnicas de ofuscação
- ✅ ICFG normalizado, resistente a ofuscação

### Análise Semântica com LLM
- ✅ Conversão do ICFG em texto padronizado
- ✅ Classificação como malicioso ou benigno
- ✅ Explicação detalhada dos caminhos que levaram à decisão

### Monitorização Runtime
- ✅ Observação de eventos críticos de execução JS + Wasm
- ✅ Detecção reforçada sem consumir muitos recursos
- ✅ Análise de performance em tempo real

### Resultado e Ação
- ✅ Alertas em tempo real ou bloqueio do miner detectado
- ✅ Métricas de desempenho para validação
- ✅ Sistema de relatórios detalhados

## 📁 Estrutura do Projeto

```
crawler_wasm_js/
├── src/
│   ├── crawler.js                           # Crawler principal
│   ├── main.js                             # Script principal de execução
│   ├── instrumentation/
│   │   └── js_instrumentation.js           # Sistema de instrumentação JS
│   ├── analyzers/
│   │   ├── modern_wasm_parser.js           # Parser WASM moderno
│   │   └── hybrid_icfg_builder.js          # Construtor de ICFG híbrido
│   ├── robustness/
│   │   └── evasion_simulator.js            # Simulador de evasões
│   ├── normalization/
│   │   └── obfuscation_resistant_normalizer.js # Normalizador resistente
│   ├── analysis/
│   │   └── llm_semantic_analyzer.js        # Analisador semântico LLM
│   ├── runtime/
│   │   └── runtime_monitor.js              # Monitor runtime
│   ├── alerting/
│   │   └── real_time_alert_system.js       # Sistema de alertas
│   ├── metrics/
│   │   └── performance_metrics_collector.js # Coletor de métricas
│   └── pipelines/
│       └── enhanced_integrated_pipeline.js  # Pipeline integrado
├── package.json
└── README.md
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js >= 16.0.0
- NPM ou Yarn
- Ambiente WSL (Windows Subsystem for Linux)

### Instalação das Dependências

```bash
# Instalar dependências
npm install

# Ou com Yarn
yarn install
```

### Dependências Principais
- **Playwright**: Automação de browser para crawling
- **Acorn**: Parser JavaScript para análise AST
- **WABT**: Kit de ferramentas WebAssembly
- **Binaryen**: Compilador e otimizador WebAssembly
- **Esprima**: Parser JavaScript alternativo
- **WS**: WebSocket client para comunicação
- **Lodash**: Utilitários JavaScript

## 🚀 Uso

### Execução Básica

```bash
# Executar análise em um site
node src/main.js https://example.com

# Especificar diretório de saída
node src/main.js https://example.com --output-dir ./results

# Analisar múltiplas páginas
node src/main.js https://example.com --max-pages 3
```

### Opções Avançadas

```bash
# Desabilitar componentes específicos
node src/main.js https://example.com --disable-llm --disable-monitoring

# Configurar modo headless
node src/main.js https://example.com --headless false

# Executar apenas crawling
node src/main.js https://example.com --disable-icfg --disable-llm
```

### Opções Disponíveis

| Opção | Descrição | Padrão |
|-------|-----------|---------|
| `--output-dir <dir>` | Diretório de saída | `./output` |
| `--max-pages <num>` | Número máximo de páginas | `1` |
| `--headless <bool>` | Modo headless do browser | `true` |
| `--enable-crawling` | Habilitar crawling | `true` |
| `--enable-instrumentation` | Habilitar instrumentação JS | `true` |
| `--enable-parsing` | Habilitar parsing WASM | `true` |
| `--enable-icfg` | Habilitar construção ICFG | `true` |
| `--enable-evasion` | Habilitar simulação de evasões | `true` |
| `--enable-normalization` | Habilitar normalização | `true` |
| `--enable-llm` | Habilitar análise LLM | `true` |
| `--enable-monitoring` | Habilitar monitorização runtime | `true` |
| `--enable-alerting` | Habilitar sistema de alertas | `true` |
| `--enable-metrics` | Habilitar coleta de métricas | `true` |

## 📊 Saídas do Sistema

### Arquivos Gerados

1. **Arquivos Coletados**
   - `js/`: Scripts JavaScript originais
   - `wasm/`: Módulos WebAssembly
   - `instrumented/`: Scripts JavaScript instrumentados
   - `evaded/`: Arquivos com evasões aplicadas

2. **Relatórios de Análise**
   - `pipeline_report.json`: Relatório completo do pipeline
   - `*.instrumentation.json`: Dados de instrumentação
   - `*.evasion_report.json`: Relatórios de evasão
   - `*.analysis.json`: Resultados de análise LLM

3. **Métricas e Monitorização**
   - `monitoring_data.json`: Dados de monitorização runtime
   - `performance_metrics.json`: Métricas de desempenho
   - `alert_history.json`: Histórico de alertas

### Estrutura do Relatório Principal

```json
{
  "pipeline": {
    "status": "completed",
    "duration": 45000,
    "stepsCompleted": 7,
    "errors": []
  },
  "results": {
    "crawlResults": { ... },
    "instrumentationResults": { ... },
    "wasmParseResults": { ... },
    "icfgResults": { ... },
    "evasionResults": { ... },
    "normalizedICFG": { ... },
    "llmAnalysisResults": { ... },
    "runtimeMonitoringResults": { ... },
    "alertResults": { ... },
    "performanceMetrics": { ... }
  },
  "summary": {
    "filesProcessed": { ... },
    "analysisResults": { ... },
    "classification": { ... },
    "performance": { ... }
  },
  "recommendations": [ ... ]
}
```

## 🔧 Componentes do Sistema

### 1. Crawler (`src/crawler.js`)
- Navegação automatizada com Playwright
- Detecção inteligente de arquivos JS e WASM
- Extração de recursos inline (data: URLs)
- Suporte a Web Workers e Service Workers

### 2. Instrumentação JS (`src/instrumentation/js_instrumentation.js`)
- Captura de chamadas WebAssembly
- Monitorização de Web Workers
- Rastreamento de WebSockets
- Análise de fluxo de controle

### 3. Parser WASM Moderno (`src/analyzers/modern_wasm_parser.js`)
- Suporte completo a features WASM modernas
- Detecção de SIMD, threads, memory64
- Análise de seções customizadas
- Parsing de instruções avançadas

### 4. ICFG Híbrido (`src/analyzers/hybrid_icfg_builder.js`)
- Grafo unificado JS + WASM
- Análise de interações assíncronas
- Mapeamento de fluxo de dados
- Otimização de grafos

### 5. Simulador de Evasões (`src/robustness/evasion_simulator.js`)
- Simulação de técnicas de ofuscação
- Teste de resiliência
- Geração de código evasivo
- Análise de robustez

### 6. Normalizador (`src/normalization/obfuscation_resistant_normalizer.js`)
- Normalização resistente a ofuscação
- Preservação de semântica
- Cálculo de resistência
- Otimização de ICFG

### 7. Analisador LLM (`src/analysis/llm_semantic_analyzer.js`)
- Conversão para texto padronizado
- Classificação semântica
- Geração de explicações
- Análise de caminhos críticos

### 8. Monitor Runtime (`src/runtime/runtime_monitor.js`)
- Monitorização de eventos críticos
- Análise de performance
- Detecção de anomalias
- Coleta de métricas

### 9. Sistema de Alertas (`src/alerting/real_time_alert_system.js`)
- Alertas em tempo real
- Sistema de bloqueio
- Múltiplos canais de notificação
- Gestão de cooldowns

### 10. Coletor de Métricas (`src/metrics/performance_metrics_collector.js`)
- Métricas de sistema e processo
- Análise de tendências
- Detecção de anomalias
- Relatórios de performance

## 🔍 Exemplos de Uso

### Exemplo 1: Análise Completa
```bash
node src/main.js https://suspicious-site.com --output-dir ./analysis_results
```

### Exemplo 2: Análise Rápida (Sem LLM)
```bash
node src/main.js https://example.com --disable-llm --disable-monitoring
```

### Exemplo 3: Apenas Crawling
```bash
node src/main.js https://example.com --disable-icfg --disable-llm --disable-alerting
```

### Exemplo 4: Análise de Múltiplas Páginas
```bash
node src/main.js https://example.com --max-pages 5 --output-dir ./multi_page_analysis
```

## 📈 Métricas e Performance

### Métricas Coletadas
- **Sistema**: CPU, memória, disco, rede
- **Processo**: Uso de memória, tempo de execução
- **Aplicação**: Tempo de detecção, precisão, recall
- **Customizadas**: Métricas específicas de detecção

### Indicadores de Performance
- Tempo total de execução
- Tempo por fase do pipeline
- Uso de recursos do sistema
- Taxa de detecção e precisão

## 🚨 Alertas e Bloqueio

### Tipos de Alertas
- **Critical**: Bloqueio imediato recomendado
- **High**: Monitorização intensiva
- **Medium**: Monitorização padrão
- **Low**: Logging apenas

### Modos de Bloqueio
- **Soft**: Redução de recursos, delays
- **Hard**: Terminação completa de processos

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```bash
# Configurar diretório de saída padrão
export CRAWLER_OUTPUT_DIR=/path/to/output

# Configurar timeout de crawling
export CRAWLER_TIMEOUT=60000

# Configurar modo headless
export CRAWLER_HEADLESS=true
```

### Configuração de LLM
```javascript
const options = {
  llmProvider: 'openai',
  model: 'gpt-4',
  temperature: 0.1,
  maxTokens: 4000
};
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão**
   - Verificar conectividade de rede
   - Tentar com `--headless false` para debug

2. **Timeout de crawling**
   - Aumentar timeout nas configurações
   - Verificar se o site não tem proteção anti-bot

3. **Erro de parsing WASM**
   - Verificar se o arquivo é WASM válido
   - Tentar com `--disable-parsing` se necessário

4. **Alto uso de memória**
   - Reduzir `--max-pages`
   - Usar `--disable-monitoring` para reduzir overhead

### Logs e Debug
- Logs detalhados no console
- Arquivos de log em `./logs/`
- Relatórios de erro em `pipeline_report.json`

## 🤝 Contribuição

### Desenvolvimento Local
```bash
# Clonar repositório
git clone <repository-url>
cd crawler_wasm_js

# Instalar dependências
npm install

# Executar testes
npm test

# Executar linting
npm run lint
```

### Estrutura de Contribuição
1. Fork do repositório
2. Criar branch para feature
3. Implementar mudanças
4. Adicionar testes
5. Submeter pull request

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Ver arquivo `LICENSE` para detalhes.

## 🙏 Agradecimentos

- Playwright team pela excelente ferramenta de automação
- WABT e Binaryen por ferramentas WebAssembly
- Comunidade Node.js pelo ecossistema robusto

## 📞 Suporte

Para questões e suporte:
- Abrir issue no repositório
- Verificar documentação em `docs/`
- Consultar exemplos em `examples/`

---

**⚠️ Aviso**: Este sistema é destinado para uso em ambientes controlados e para fins de pesquisa em segurança. Use com responsabilidade e em conformidade com as leis aplicáveis.