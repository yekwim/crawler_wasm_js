# 🔍 Sistema de Análise de Código e Detecção de Mining

Sistema avançado para análise de código JavaScript e WebAssembly com detecção especializada de mining de criptomoedas.

## 📁 Estrutura do Projeto

```
crawler/
├── src/                          # Código fonte principal
│   ├── analyzers/               # Analisadores de código
│   │   ├── parser.js            # Analisador tradicional
│   │   ├── normalizer.js        # Normalizador de código
│   │   ├── ast_parser.js        # Parser AST para JavaScript
│   │   └── enhanced_wasm_analyzer.js # Analisador WASM avançado
│   ├── pipelines/               # Pipelines de análise
│   │   ├── semantic_pipeline.js # Pipeline semântico tradicional
│   │   ├── wasm_pipeline.js     # Pipeline para WebAssembly
│   │   ├── ast_semantic_pipeline.js # Pipeline AST
│   │   └── integrated_pipeline.js # Pipeline integrado principal
│   ├── utils/                   # Utilitários
│   │   ├── analyze_and_normalize.js
│   │   └── enhanced_parser.js
│   └── index.js                 # Índice principal
├── tests/                       # Testes
│   ├── test_integrated_pipeline.js
│   ├── test_ast_pipeline.js
│   └── test_*.js
├── docs/                        # Documentação
│   ├── README.md
│   ├── INTEGRATED_PIPELINE_README.md
│   ├── PIPELINE_DOCUMENTATION.md
│   └── WASM_PIPELINE_DOCUMENTATION.md
├── examples/                    # Exemplos e scripts
│   └── run_test.sh
├── crawler.js                   # Crawler principal
├── downloads/                   # Ficheiros baixados
├── analysis_output/             # Resultados de análise
└── package.json
```

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Instalar dependências AST (se necessário)
npm install acorn acorn-walk acorn-loose
```

## 📋 Comandos Principais

### Pipeline Integrado (Recomendado)
```bash
# Executar análise completa
npm run integrated

# Com diretórios específicos
node src/pipelines/integrated_pipeline.js ./downloads ./analysis_output
```

### Pipelines Individuais
```bash
# Análise AST para JavaScript
npm run ast

# Pipeline semântico tradicional
npm run semantic

# Pipeline para WebAssembly
npm run wasm

# Análise e normalização
npm run analyze
```

### Testes
```bash
# Testar pipeline integrado
npm run test-integrated

# Testar componentes individuais
npm run test-ast
npm run test-wasm
npm run test-crawler
```

## 🔍 Funcionalidades

### ✅ Análise JavaScript
- **Parser AST completo** com Acorn
- **Análise semântica profunda**
- **Detecção de obfuscação**
- **Normalização de código**
- **Análise de complexidade**

### ✅ Análise WebAssembly
- **Parsing de estrutura WASM**
- **Detecção de algoritmos de mining**
- **Análise de performance**
- **Análise de segurança**

### ✅ Detecção de Mining
- **Algoritmos de hash** (Argon2, Blake2, CryptoNight, Keccak)
- **Padrões de proof-of-work**
- **Bibliotecas de mining conhecidas**
- **Análise de uso de CPU/memória**

## 📊 Exemplo de Uso

```javascript
const { IntegratedPipeline } = require('./src/index.js');

// Criar pipeline
const pipeline = new IntegratedPipeline({
  inputDir: './downloads',
  outputDir: './analysis_output'
});

// Executar análise
const results = await pipeline.run();

// Verificar resultados
console.log(`Mining detectado: ${results.summary.miningDetected}`);
console.log(`Total de ficheiros: ${results.summary.totalFiles}`);
```

## 📈 Resultados

O sistema gera:

- **JSON estruturado** com análise completa
- **Relatórios em texto** para leitura humana
- **Métricas de confiança** para detecção de mining
- **Evidências detalhadas** de padrões suspeitos

### Exemplo de Saída

```
📊 RESUMO DA ANÁLISE
============================================================
📁 Total de ficheiros: 15
📄 JavaScript: 12
🔧 WASM: 3
⛏️ Mining detectado: 2
🚨 Alta confiança: 1
❌ Erros: 0

🚨 ATENÇÃO: Ficheiros com mining detectado!
```

## 🧪 Testes

```bash
# Executar todos os testes
npm run test-integrated

# Testes específicos
npm run test-ast
npm run test-wasm
npm run test-crawler
```

## 📚 Documentação

- **[Pipeline Integrado](docs/INTEGRATED_PIPELINE_README.md)** - Guia completo do pipeline principal
- **[Documentação de Pipelines](docs/PIPELINE_DOCUMENTATION.md)** - Pipelines individuais
- **[Documentação WASM](docs/WASM_PIPELINE_DOCUMENTATION.md)** - Análise WebAssembly

## 🔧 Configuração Avançada

### Thresholds de Detecção

```javascript
// Ajustar sensibilidade
const pipeline = new IntegratedPipeline({
  miningThreshold: 0.5,  // 50% de confiança
  debug: true,
  verbose: true
});
```

### Análise Personalizada

```javascript
const { ASTParser, EnhancedWasmAnalyzer } = require('./src/index.js');

// Análise AST personalizada
const astParser = new ASTParser({
  ecmaVersion: 2022,
  sourceType: 'module'
});

// Análise WASM personalizada
const wasmAnalyzer = new EnhancedWasmAnalyzer();
```

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Adicione testes para novas funcionalidades
4. Execute `npm run test-integrated`
5. Submeta um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🆘 Suporte

Para problemas ou dúvidas:

1. Consulte a documentação em `docs/`
2. Execute os testes para verificar funcionamento
3. Verifique os logs de debug
4. Abra uma issue no repositório

---

**Versão**: 2.0.0  
**Última atualização**: Setembro 2024
