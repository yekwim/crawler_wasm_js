#!/usr/bin/env python3
"""
LLM-Optimized JavaScript Artifact Processor
Reduz drasticamente o tamanho dos artefatos JS para análise por LLM
"""

import os
import re
import json
import esprima
from datetime import datetime
from pathlib import Path

class LLMJavaScriptOptimizer:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.max_functions = 20  # Máximo de funções a manter
        self.max_lines_per_function = 10  # Máximo de linhas por função
        self.max_total_lines = 200  # Máximo total de linhas
        self.minify_threshold = 0.8  # Se > 80% minificado, aplicar otimizações agressivas

    def is_minified(self, js_code):
        """Detecta se o código está minificado"""
        lines = js_code.split('\n')
        avg_line_length = sum(len(line) for line in lines) / len(lines) if lines else 0
        return avg_line_length > 100 or len(lines) > 1000

    def extract_key_functions(self, js_code):
        """Extrai apenas as funções mais importantes"""
        try:
            ast = esprima.parseScript(js_code, {'tolerant': True})
            functions = []
            
            def traverse_node(node, depth=0):
                if hasattr(node, 'type'):
                    if node.type == 'FunctionDeclaration' and hasattr(node, 'id') and node.id:
                        functions.append({
                            'name': node.id.name,
                            'type': 'function',
                            'start': getattr(node, 'range', [0, 0])[0] if hasattr(node, 'range') else 0,
                            'end': getattr(node, 'range', [0, 0])[1] if hasattr(node, 'range') else 0
                        })
                    elif node.type == 'VariableDeclarator' and hasattr(node, 'init') and node.init:
                        if (hasattr(node.init, 'type') and 
                            node.init.type == 'FunctionExpression' and 
                            hasattr(node, 'id') and node.id):
                            functions.append({
                                'name': node.id.name,
                                'type': 'variable_function',
                                'start': getattr(node, 'range', [0, 0])[0] if hasattr(node, 'range') else 0,
                                'end': getattr(node, 'range', [0, 0])[1] if hasattr(node, 'range') else 0
                            })
                
                # Recursão limitada para performance
                if depth < 3:
                    for attr in ['body', 'declarations', 'expression', 'callee', 'arguments']:
                        if hasattr(node, attr):
                            children = getattr(node, attr)
                            if isinstance(children, list):
                                for child in children[:5]:  # Limita filhos
                                    traverse_node(child, depth + 1)
                            elif children:
                                traverse_node(children, depth + 1)
            
            if ast and hasattr(ast, 'body'):
                for node in ast.body[:50]:  # Limita nós principais
                    traverse_node(node)
            
            return functions
        except Exception:
            return []

    def extract_important_patterns(self, js_code):
        """Extrai padrões importantes sem o código completo"""
        patterns = {
            'miner_calls': [],
            'crypto_functions': [],
            'network_calls': [],
            'obfuscation_patterns': [],
            'suspicious_strings': []
        }
        
        # Padrões de mineradores
        miner_patterns = [
            r'miner\.(start|stop|getHashesPerSecond|setNumThreads)',
            r'hashesPerSecond|totalHashes|acceptedHashes',
            r'WebAssembly\.(instantiate|compile)',
            r'crypto\.(getRandomValues|subtle)'
        ]
        
        for pattern in miner_patterns:
            matches = re.findall(pattern, js_code, re.IGNORECASE)
            patterns['miner_calls'].extend(matches[:5])  # Limita resultados
        
        # Padrões de criptografia
        crypto_patterns = [
            r'[A-Za-z0-9+/]{20,}={0,2}',  # Base64
            r'0x[0-9a-fA-F]{8,}',  # Hex
            r'[a-fA-F0-9]{32,}',  # Hash-like
        ]
        
        for pattern in crypto_patterns:
            matches = re.findall(pattern, js_code)
            patterns['crypto_functions'].extend(matches[:10])
        
        # Padrões de rede
        network_patterns = [
            r'fetch\(|XMLHttpRequest|WebSocket',
            r'postMessage|onmessage',
            r'addEventListener'
        ]
        
        for pattern in network_patterns:
            matches = re.findall(pattern, js_code)
            patterns['network_calls'].extend(matches[:5])
        
        # Padrões de ofuscação
        obfuscation_patterns = [
            r'_0x[0-9a-fA-F]+',
            r'function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]{100,}\}',
            r'var\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\[[^\]]{50,}\]'
        ]
        
        for pattern in obfuscation_patterns:
            matches = re.findall(pattern, js_code)
            patterns['obfuscation_patterns'].extend(matches[:5])
        
        # Strings suspeitas
        suspicious_strings = re.findall(r'["\'][^"\']{20,}["\']', js_code)
        patterns['suspicious_strings'] = suspicious_strings[:10]
        
        return patterns

    def create_summary(self, js_code, functions, patterns):
        """Cria um resumo compacto para LLM"""
        lines = js_code.split('\n')
        total_lines = len(lines)
        total_chars = len(js_code)
        
        # Estatísticas básicas
        stats = {
            'total_lines': total_lines,
            'total_chars': total_chars,
            'functions_found': len(functions),
            'is_minified': self.is_minified(js_code),
            'compression_ratio': 0
        }
        
        # Seleciona funções mais importantes
        important_functions = functions[:self.max_functions]
        
        # Cria código resumido
        summary_code = []
        summary_code.append("// === RESUMO PARA ANÁLISE LLM ===")
        summary_code.append(f"// Total: {total_lines} linhas, {total_chars} caracteres")
        summary_code.append(f"// Funções encontradas: {len(functions)}")
        summary_code.append(f"// Código minificado: {'Sim' if stats['is_minified'] else 'Não'}")
        summary_code.append("")
        
        # Adiciona padrões importantes
        if any(patterns.values()):
            summary_code.append("// === PADRÕES DETECTADOS ===")
            for category, items in patterns.items():
                if items:
                    summary_code.append(f"// {category}: {len(items)} itens")
                    for item in items[:3]:  # Máximo 3 por categoria
                        summary_code.append(f"//   - {str(item)[:50]}...")
            summary_code.append("")
        
        # Adiciona funções importantes (resumidas)
        if important_functions:
            summary_code.append("// === FUNÇÕES PRINCIPAIS ===")
            for func in important_functions:
                summary_code.append(f"// {func['name']} ({func['type']})")
            summary_code.append("")
        
        # Adiciona amostras do código original (primeiras e últimas linhas)
        summary_code.append("// === AMOSTRA DO CÓDIGO ORIGINAL ===")
        summary_code.append("// Primeiras 10 linhas:")
        for line in lines[:10]:
            summary_code.append(f"// {line[:80]}...")
        
        if total_lines > 20:
            summary_code.append("// ...")
            summary_code.append("// Últimas 10 linhas:")
            for line in lines[-10:]:
                summary_code.append(f"// {line[:80]}...")
        
        summary_code.append("")
        summary_code.append("// === CÓDIGO COMPLETO REMOVIDO PARA ECONOMIA DE CONTEXTO ===")
        summary_code.append("// Use as informações acima para análise")
        
        return '\n'.join(summary_code), stats

    def optimize_for_llm(self, js_code, output_dir="llm_optimized"):
        """Otimiza código JavaScript para análise por LLM"""
        Path(output_dir).mkdir(exist_ok=True, parents=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Extrai informações importantes
        functions = self.extract_key_functions(js_code)
        patterns = self.extract_important_patterns(js_code)
        
        # Cria resumo otimizado
        summary_code, stats = self.create_summary(js_code, functions, patterns)
        
        # Calcula taxa de compressão
        original_size = len(js_code)
        optimized_size = len(summary_code)
        stats['compression_ratio'] = optimized_size / original_size if original_size > 0 else 0
        
        # Salva arquivos
        summary_file = os.path.join(output_dir, f"llm_summary_{timestamp}.js")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(summary_code)
        
        # Salva metadados
        metadata = {
            'timestamp': timestamp,
            'original_stats': stats,
            'functions': functions,
            'patterns': patterns,
            'optimization': {
                'compression_ratio': stats['compression_ratio'],
                'size_reduction': f"{((1 - stats['compression_ratio']) * 100):.1f}%"
            }
        }
        
        metadata_file = os.path.join(output_dir, f"metadata_{timestamp}.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        if self.verbose:
            print(f"Otimizado: {original_size} -> {optimized_size} chars ({stats['compression_ratio']:.3f})")
            print(f"Arquivos salvos: {summary_file}, {metadata_file}")
        
        return {
            'summary_file': summary_file,
            'metadata_file': metadata_file,
            'stats': stats,
            'compression_ratio': stats['compression_ratio']
        }

def process_directory_for_llm(input_dir, output_base_dir="llm_optimized", verbose=False):
    """Processa todos os arquivos JS para otimização LLM"""
    optimizer = LLMJavaScriptOptimizer(verbose=verbose)
    
    results = []
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith('.js'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(root, input_dir)
                output_dir = os.path.join(output_base_dir, relative_path, os.path.splitext(file)[0])
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        js_code = f.read()
                    
                    result = optimizer.optimize_for_llm(js_code, output_dir)
                    result['source_file'] = file_path
                    results.append(result)
                    
                except Exception as e:
                    if verbose:
                        print(f"Erro processando {file_path}: {str(e)}")
    
    return results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Otimizador de JavaScript para LLM')
    parser.add_argument('--input', '-i', help='Arquivo ou diretório de entrada')
    parser.add_argument('--output', '-o', default='llm_optimized', help='Diretório de saída')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída verbosa')
    
    args = parser.parse_args()
    
    if args.input:
        if os.path.isfile(args.input):
            optimizer = LLMJavaScriptOptimizer(verbose=args.verbose)
            with open(args.input, 'r', encoding='utf-8', errors='ignore') as f:
                js_code = f.read()
            optimizer.optimize_for_llm(js_code, args.output)
        elif os.path.isdir(args.input):
            results = process_directory_for_llm(args.input, args.output, verbose=args.verbose)
            if args.verbose:
                total_compression = sum(r['compression_ratio'] for r in results) / len(results) if results else 0
                print(f"Compressão média: {total_compression:.3f}")
        else:
            print("Caminho inválido.")
    else:
        parser.print_help()
