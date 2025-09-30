# 🚀 Pipeline Integrado de Análise de Código

Este documento explica como usar o **Pipeline Integrado** que combina análise AST para JavaScript e análise avançada para WebAssembly, com detecção especializada de mining de criptomoedas.

## 📋 Visão Geral

O Pipeline Integrado oferece:

- ✅ **Análise AST completa** para ficheiros JavaScript (.js)
- ✅ **Análise semântica avançada** para ficheiros WebAssembly (.wat)
- ✅ **Detecção especializada de mining** com alta precisão
- ✅ **Relatórios detalhados** em múltiplos formatos
- ✅ **Integração perfeita** com o sistema existente

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Instalar dependências AST (se necessário)
npm install acorn acorn-walk acorn-loose
```

## 🚀 Uso Básico

### 1. Executar Pipeline Completo

```bash
# Análise de todo o diretório downloads
npm run integrated

# Ou especificar diretórios
node integrated_pipeline.js ./downloads ./analysis_output
```

### 2. Executar Apenas Análise AST

```bash
# Análise AST para JavaScript
npm run ast

# Testar AST parser
npm run test-ast
```

### 3. Executar Testes

```bash
# Testar pipeline integrado
npm run test-integrated

# Testar componentes individuais
npm run test-ast
npm run test-wasm
```

## 📊 Estrutura de Saída

O pipeline gera:

```
analysis_output/
├── analysis_results.json          # Resultados completos em JSON
├── general_report.txt             # Relatório geral
├── mining_report.txt              # Relatório de mining
├── javascript_report.txt          # Relatório JavaScript
├── wasm_report.txt                # Relatório WASM
└── normalized/                    # Código normalizado (se aplicável)
    ├── js/
    └── wasm/
```

## 🔍 Análise JavaScript (AST)

### Funcionalidades

- **Parsing AST completo** com Acorn
- **Análise semântica profunda**
- **Detecção de padrões de mining**
- **Análise de complexidade**
- **Extração de funções, variáveis, classes**

### Exemplo de Uso

```javascript
const { ASTParser } = require('./ast_parser.js');

const parser = new ASTParser();
const result = parser.parseFile('./suspicious.js');

console.log('Funções:', result.semantic.functions.length);
console.log('Complexidade:', result.semantic.complexity.cyclomatic);
console.log('Padrões crypto:', result.semantic.patterns.crypto_related);
```

## 🔧 Análise WASM Avançada

### Funcionalidades

- **Parsing de estrutura WASM**
- **Detecção de algoritmos de mining**
- **Análise de performance**
- **Análise de segurança**
- **Extração de funções e imports**

### Padrões Detectados

#### Algoritmos de Hash
- Argon2 (argon2id, argon2i, argon2d)
- Blake2 (blake2b, blake2s, blake3)
- CryptoNight (cryptonight, cryptonight_lite)
- Keccak (keccak256, keccak512)
- SHA-3 (sha3_256, sha3_512)

#### Padrões de Mining
- Proof-of-Work algorithms
- Memory-intensive operations
- CPU-intensive loops
- Cryptographic libraries

### Exemplo de Uso

```javascript
const { EnhancedWasmAnalyzer } = require('./enhanced_wasm_analyzer.js');

const analyzer = new EnhancedWasmAnalyzer();
const result = await analyzer.analyzeWasm('./suspicious.wat');

console.log('Mining detectado:', result.mining.detected);
console.log('Confiança:', result.mining.confidence);
console.log('Algoritmos:', result.mining.algorithms);
```

## ⛏️ Detecção de Mining

### Níveis de Confiança

- **🔴 Alta (≥80%)**: Mining altamente provável
- **🟡 Média (60-79%)**: Mining suspeito
- **🟢 Baixa (<60%)**: Não detectado

### Indicadores JavaScript

```javascript
// Padrões detectados
- CoinHive, CryptoNight, WebDollar
- Web Workers para mining
- Operações de hash intensivas
- Loops de alta complexidade
- Bibliotecas de mining conhecidas
```

### Indicadores WASM

```wat
;; Padrões detectados
- Funções de hash (argon2id_hash, blake2b_hash)
- Algoritmos PoW (proof_of_work, difficulty_check)
- Operações de memória intensivas
- Loops complexos com operações aritméticas
```

## 📈 Exemplos de Detecção

### JavaScript com Mining

```javascript
// Detectado com alta confiança
class CoinMiner {
  constructor() {
    this.hashrate = 0;
    this.difficulty = 1;
  }
  
  startMining() {
    // Loops intensivos de CPU
    setInterval(() => {
      this.mineBlock();
    }, 100);
  }
  
  mineBlock() {
    let nonce = 0;
    while (nonce < 100000) {
      const hash = this.calculateHash(nonce);
      if (this.verifyHash(hash)) {
        console.log('Block mined!');
        break;
      }
      nonce++;
    }
  }
}
```

**Resultado**: Mining detectado (Confiança: 85%)

### WASM com Argon2

```wat
;; Detectado com alta confiança
(func $argon2id_hash
  (param $password i32)
  (param $salt i32)
  (param $iterations i32)
  (result i32)
  (local $i i32)
  (local $j i32)
  
  ;; Loop externo para iterações
  (loop $outer
    ;; Loop interno para operações de hash
    (loop $inner
      (call $blake2b_hash)
      (local.set $j (i32.add (local.get $j) (i32.const 1)))
      (br_if $inner (i32.lt_u (local.get $j) (i32.const 1024)))
    )
    (local.set $i (i32.add (local.get $i) (i32.const 1)))
    (br_if $outer (i32.lt_u (local.get $i) (local.get $iterations)))
  )
)
```

**Resultado**: Mining detectado (Confiança: 92%)

## 🔧 Configuração Avançada

### Opções do Pipeline

```javascript
const pipeline = new IntegratedPipeline({
  inputDir: './downloads',           // Diretório de entrada
  outputDir: './analysis_output',    // Diretório de saída
  generateReports: true,             // Gerar relatórios
  analyzeMining: true               // Analisar mining
});
```

### Opções do AST Parser

```javascript
const parser = new ASTParser({
  ecmaVersion: 2022,                // Versão ECMAScript
  sourceType: 'script',             // Tipo de fonte
  locations: true,                  // Incluir localizações
  ranges: true                      // Incluir ranges
});
```

## 📊 Relatórios

### Relatório Geral

```
RELATÓRIO GERAL - PIPELINE INTEGRADO DE ANÁLISE
===============================================

RESUMO EXECUTIVO:
- Total de ficheiros analisados: 15
- Ficheiros JavaScript: 12
- Ficheiros WASM: 3
- Mining detectado: 2
- Alta confiança de mining: 1
- Erros de análise: 0

FICHEIROS COM MINING DETECTADO:
--------------------------------

📄 mining.js
   Tipo: JAVASCRIPT
   Confiança: 85.0%
   Indicadores: mining_pattern, web_workers, hash_operations
```

### Relatório de Mining

```
RELATÓRIO DE DETECÇÃO DE MINING
===============================

🚨 ATENÇÃO: 2 ficheiro(s) com mining detectado!

🔴 ALTA CONFIANÇA (≥80%):
----------------------------------------

📄 mining.wat
   Confiança: 92.0%
   Tipo: WASM
   Indicadores: argon2id_hash, blake2b_hash, proof_of_work
```

## 🧪 Testes

### Executar Todos os Testes

```bash
npm run test-integrated
```

### Testes Individuais

```bash
# Testar AST parser
npm run test-ast

# Testar WASM analyzer
npm run test-wasm

# Testar pipeline completo
npm run test-integrated
```

### Exemplo de Teste

```javascript
const { IntegratedPipelineTester } = require('./test_integrated_pipeline.js');

const tester = new IntegratedPipelineTester();
const results = await tester.runTests();

console.log('Testes passaram:', results.summary.totalFiles === 6);
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de parsing AST**
   ```bash
   # Verificar dependências
   npm install acorn acorn-walk acorn-loose
   ```

2. **Ficheiros WASM não encontrados**
   ```bash
   # Verificar se existem ficheiros .wat
   find ./downloads -name "*.wat"
   ```

3. **Permissões de ficheiro**
   ```bash
   # Dar permissões de execução
   chmod +x integrated_pipeline.js
   ```

### Logs de Debug

```javascript
// Habilitar logs detalhados
const pipeline = new IntegratedPipeline({
  debug: true,
  verbose: true
});
```

## 📚 Referências

- [Acorn Parser](https://github.com/acornjs/acorn)
- [WebAssembly Text Format](https://webassembly.github.io/spec/core/text/index.html)
- [Mining Detection Patterns](https://github.com/cryptonight)

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Adicione testes para novas funcionalidades
4. Execute `npm run test-integrated`
5. Submeta um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License.
