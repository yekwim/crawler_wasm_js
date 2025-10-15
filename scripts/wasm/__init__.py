"""
Módulo de pré-processamento de artefatos WASM.

Este módulo contém ferramentas para:
- Conversão de WASM para WAT (formato textual)
- Parsing de WAT para AST
- Análise estrutural de módulos WASM
- Extração de metadados (funções, imports, exports, memória)
"""

from .wasm_wat_ast import SimpleWatParser

__all__ = ['SimpleWatParser']

