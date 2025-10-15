"""
Scripts de pré-processamento de artefatos coletados pelo crawler.

Estrutura:
- scripts/wasm/ - Processamento de arquivos WASM
- scripts/js/   - Processamento de arquivos JavaScript
"""

from .wasm import SimpleWatParser
from .js import JavaScriptDeobfuscator

__all__ = ['SimpleWatParser', 'JavaScriptDeobfuscator']

