# Guia de Início Rápido

## Instalação

```bash
# 1. Instalar dependências Python
pip install -r requirements.txt

# 2. Instalar browsers Playwright
playwright install chromium

# 3. Verificar instalação
python pipeline.py --help
```

## Uso Básico

### Pipeline Completo (Recomendado)

```bash
# Crawl + processamento completo em um comando
python pipeline.py https://example.com --verbose
```

### Exemplos Práticos

```bash
# Múltiplas páginas
python pipeline.py https://webassembly.org --max-pages 5 -v

# Diretórios customizados
python pipeline.py https://example.com -d custom_downloads -a custom_results

# Apenas WASM (pular JS)
python pipeline.py https://example.com --skip-js

# Apenas JS (pular WASM)
python pipeline.py https://example.com --skip-wasm
```

## Estrutura de Output

```
downloads/           # Artefatos brutos coletados
└── example.com/
    ├── js/         # JavaScript files
    └── wasm/       # WebAssembly binaries

analysis_output/    # Resultados processados
└── example.com/
    ├── js/
    │   └── script/
    │       ├── structured_*.js    # Código limpo
    │       ├── ast_*.json        # AST
    │       └── analysis_*.json   # Análise
    └── wasm/
        └── clean_ast/
            └── module.json       # AST WASM
```

## Módulos Individuais

### Apenas Crawl
```bash
python src/crawler.py https://example.com -o downloads -v
```

### Apenas Processamento JS
```bash
python scripts/js/js_parser.py -i downloads/ -o results -v
```

### Apenas Processamento WASM
```bash
python scripts/wasm/wasm_wat_ast.py --downloads downloads --analysis results -v
```

## Uso Programático

```python
from pipeline import Pipeline

pipeline = Pipeline(verbose=True)
result = pipeline.run(
    'https://example.com',
    max_pages=3
)

print(f"Completed in {result['total_time']:.2f}s")
```

## Troubleshooting

### Erro: playwright not found
```bash
playwright install chromium
```

### Erro: wasm2wat not found
Instale WABT: https://github.com/WebAssembly/wabt

### Erro: Permission denied
```bash
chmod +x pipeline.py
```

