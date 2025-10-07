# 🔧 Correção de Problemas de Instalação

## ❌ Problema Identificado

O erro ocorreu porque algumas dependências no `package.json` não existem:
- `@wasm-tool/wasm-parser` - Não existe no npm
- `binaryen` - Pode causar problemas de compilação
- `fs`, `path`, `crypto`, `os`, `perf_hooks` - São módulos built-in do Node.js

## ✅ Solução Aplicada

### 1. Dependências Corrigidas

Removidas dependências problemáticas e mantidas apenas as essenciais:

```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "acorn": "^8.11.0", 
    "acorn-walk": "^8.3.0",
    "acorn-loose": "^8.3.0",
    "wabt": "^1.0.33",
    "esprima": "^4.0.1",
    "estraverse": "^5.3.0",
    "escodegen": "^2.0.0",
    "ws": "^8.14.2",
    "node-fetch": "^3.3.2",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "performance-now": "^2.1.0"
  }
}
```

### 2. Scripts de Instalação Criados

- `quick_install.sh` - Instalação rápida e simples
- `install_deps.sh` - Instalação detalhada
- `test_dependencies.js` - Teste de dependências

## 🚀 Como Instalar Agora

### Opção 1: Instalação Rápida (Recomendada)
```bash
# Tornar executável e executar
chmod +x quick_install.sh
./quick_install.sh
```

### Opção 2: Usando NPM Script
```bash
npm run quick-install
```

### Opção 3: Instalação Manual
```bash
# Limpar instalação anterior
rm -rf node_modules package-lock.json

# Instalar com flags de compatibilidade
npm install --legacy-peer-deps

# Instalar browsers do Playwright
npx playwright install chromium
```

### Opção 4: Instalação Individual
```bash
npm install playwright acorn acorn-walk acorn-loose esprima estraverse escodegen ws node-fetch uuid lodash performance-now
npx playwright install chromium
```

## 🧪 Testar Instalação

```bash
# Executar teste de dependências
node test_dependencies.js

# Executar teste do sistema
npm run test
```

## 📝 Notas Importantes

1. **Módulos Built-in**: `fs`, `path`, `crypto`, `os`, `perf_hooks`, `events` são módulos nativos do Node.js e não precisam ser instalados

2. **Parser WASM**: Implementação própria criada em `src/analyzers/modern_wasm_parser.js` sem dependências externas

3. **Playwright**: Pode precisar de instalação adicional de browsers:
   ```bash
   npx playwright install chromium
   ```

4. **Compatibilidade**: Usar `--legacy-peer-deps` se houver conflitos de versão

## 🔍 Verificar se Funcionou

Após a instalação, execute:
```bash
node src/main.js --help
```

Se mostrar a ajuda, a instalação foi bem-sucedida! 🎉

## 🆘 Se Ainda Houver Problemas

1. **Limpar tudo**:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Usar versões específicas**:
   ```bash
   npm install playwright@1.40.0 acorn@8.11.0
   ```

3. **Verificar Node.js**:
   ```bash
   node --version  # Deve ser >= 16.0.0
   npm --version
   ```

4. **Usar Yarn** (alternativa):
   ```bash
   yarn install
   ```
