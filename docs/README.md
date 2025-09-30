# 🔍 Sistema de Análise e Normalização de Código

Sistema completo para análise de arquivos JavaScript e WASM baixados, com detecção de ofuscação e ferramentas de normalização/desofuscação.

## 🚀 Funcionalidades

### 📊 Análise de Código
- **Detecção de Ofuscação**: Identifica diferentes tipos de ofuscação em JavaScript
- **Análise de Métricas**: Complexidade, nomenclatura, comentários, etc.
- **Análise de WASM**: Verificação de arquivos WebAssembly válidos
- **Relatórios Detalhados**: Geração de relatórios em texto legível

### 🔧 Normalização/Desofuscação
- **Beautify**: Formatação e indentação do código
- **Decodificação de Strings**: Hex, Unicode, Octal, String.fromCharCode
- **Desofuscação de Arrays**: Reconstrói arrays de strings ofuscados
- **Renomeação de Variáveis**: Substitui nomes curtos por nomes legíveis
- **Remoção de Código Morto**: Remove console.log e comentários de debug
- **Adição de Comentários**: Comentários explicativos automáticos

## 📁 Estrutura do Projeto

```
crawler/
├── crawler.js                    # Crawler principal para baixar arquivos
├── parser.js                     # Analisador de código JavaScript/WASM
├── normalizer.js                 # Ferramentas de normalização/desofuscação
├── analyze_and_normalize.js      # Script principal integrado
├── test_webdollar_analysis.js    # Teste específico para WebDollar.io
├── test_crawler.js              # Teste do crawler
├── downloads/                    # Diretório de arquivos baixados
│   └── webdollar.io/
│       ├── js/                  # Arquivos JavaScript
│       ├── wasm/                # Arquivos WASM
│       ├── normalized/          # Arquivos normalizados
│       └── analysis_report.txt  # Relatório de análise
└── README.md                    # Este arquivo
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Instalar Playwright (para o crawler)
npx playwright install chromium
```

## 📖 Como Usar

### 1. Baixar Arquivos de um Site

```bash
# Baixar arquivos do WebDollar.io
node test_crawler.js

# Ou usar o crawler diretamente
node crawler.js https://webdollar.io ./downloads 1
```

### 2. Analisar e Normalizar Código

```bash
# Análise completa do WebDollar.io
node test_webdollar_analysis.js

# Análise de diretório específico
node analyze_and_normalize.js ./downloads/webdollar.io

# Apenas análise (sem normalização)
node analyze_and_normalize.js ./downloads/webdollar.io --analyze-only

# Apenas normalização (sem análise)
node analyze_and_normalize.js ./downloads/webdollar.io --normalize-only
```

### 3. Opções Avançadas

```bash
# Especificar diretório de saída
node analyze_and_normalize.js ./downloads --output-dir ./normalized

# Desabilitar relatórios
node analyze_and_normalize.js ./downloads --no-report

# Opções de normalização
node analyze_and_normalize.js ./downloads \
  --no-beautify \
  --no-rename-vars \
  --no-decode-strings \
  --no-remove-dead-code \
  --no-add-comments
```

## 🔍 Tipos de Ofuscação Detectados

### 1. **Minified Code**
- Variáveis e funções com nomes curtos (1-2 caracteres)
- Código comprimido sem espaços desnecessários

### 2. **Packed Code**
- Uso de `eval()`, `Function()`, `atob()`, `btoa()`
- `String.fromCharCode()`, `unescape()`, `decodeURIComponent()`

### 3. **Encoded Strings**
- Strings em hexadecimal (`\x41`)
- Strings em Unicode (`\u0041`)
- Strings em octal (`\101`)

### 4. **Control Flow Obfuscation**
- Loops infinitos (`while(true)`, `for(;;)`)
- Switch statements complexos
- Try-catch aninhados

### 5. **String Array Obfuscation**
- Arrays de strings que são acessados por índice
- Operações `split()` e `join()`

## 📊 Métricas Analisadas

- **Complexidade**: Contagem de estruturas de controle
- **Nomenclatura**: Análise de nomes de variáveis e funções
- **Comentários**: Proporção de comentários no código
- **Tamanho**: Linhas, caracteres, bytes
- **Qualidade**: Detecção de padrões suspeitos

## 🔧 Ferramentas de Normalização

### Decodificação de Strings
```javascript
// Antes
var str = "\\x48\\x65\\x6c\\x6c\\x6f"; // "Hello"

// Depois
var str = "Hello";
```

### Desofuscação de Arrays
```javascript
// Antes
var a = ["Hello", "World"];
var msg = a[0] + " " + a[1];

// Depois
var msg = "Hello" + " " + "World";
```

### Renomeação de Variáveis
```javascript
// Antes
var a = 1, b = 2, c = a + b;

// Depois
var data = 1, value = 2, result = data + value;
```

### Beautify
```javascript
// Antes
function test(){var a=1;if(a>0){console.log("test");}}

// Depois
function test() {
  var data = 1;
  if (data > 0) {
    console.log("test");
  }
}
```

## 📄 Relatórios Gerados

### Relatório de Análise (`analysis_report.txt`)
- Resumo geral dos arquivos
- Detecção de ofuscação por arquivo
- Métricas detalhadas
- Sugestões de melhoria

### Relatório de Normalização (`normalization_report.txt`)
- Estatísticas de processamento
- Taxa de sucesso
- Comparação de tamanhos
- Lista de erros (se houver)

## 🎯 Exemplo de Uso Completo

```bash
# 1. Baixar arquivos do site
node test_crawler.js

# 2. Analisar e normalizar
node test_webdollar_analysis.js

# 3. Verificar resultados
ls -la downloads/webdollar.io/normalized/js/
cat downloads/webdollar.io/analysis_report.txt
```

## 🔍 Resultados do WebDollar.io

O sistema foi testado com sucesso no WebDollar.io e detectou:

- **19 arquivos JavaScript** processados com sucesso
- **1 arquivo WASM** (argon2.wasm) analisado
- **Nenhuma ofuscação maliciosa** detectada
- **Código minificado** identificado e normalizado
- **Taxa de sucesso**: 100% na normalização

### Arquivos Principais Analisados:
- `WebDollar-Protocol-bundle.js` (3.8 MB) - Protocolo principal
- `WebDollar-User-Interface-bundle.js` (721 KB) - Interface do usuário
- `argon2.min.js` (44 KB) - Criptografia Argon2
- `argon2.wasm` (23 KB) - Módulo WASM do Argon2

## ⚠️ Limitações

- **Desofuscação Avançada**: Não consegue desofuscar código altamente ofuscado
- **WASM**: Análise básica de arquivos WebAssembly
- **Performance**: Pode ser lento com arquivos muito grandes
- **Compatibilidade**: Focado em JavaScript moderno

## 🤝 Contribuição

Para melhorar o sistema:

1. Adicione novos padrões de ofuscação em `parser.js`
2. Implemente novas técnicas de normalização em `normalizer.js`
3. Melhore a análise de arquivos WASM
4. Adicione suporte a outros tipos de arquivo

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para análise de código.
