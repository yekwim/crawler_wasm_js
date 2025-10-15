"""
Módulo de pré-processamento de artefatos JavaScript.

Este módulo contém ferramentas para:
- Desofuscação de código JavaScript
- Beautification e formatação
- Geração de AST (Abstract Syntax Tree)
- Análise estrutural e detecção de padrões
- Extração de strings e variáveis ofuscadas
"""

from .js_parser import JavaScriptDeobfuscator

__all__ = ['JavaScriptDeobfuscator']

