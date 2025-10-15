#!/usr/bin/env python3
"""
LLM-Optimized WASM AST Processor
Reduz drasticamente o tamanho dos ASTs de WASM para análise por LLM
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

class LLMWasmOptimizer:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.max_instructions = 5  # Máximo de instruções por função
        self.max_imports = 10  # Máximo de imports a manter
        self.max_exports = 10  # Máximo de exports a manter
        self.max_memory_pages = 5  # Máximo de páginas de memória a documentar
        self.compression_threshold = 0.1  # Se > 90% de compressão, aplicar otimizações agressivas

    def analyze_wasm_ast(self, ast_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa a estrutura do AST de WASM"""
        analysis = {
            'total_functions': 0,
            'total_imports': 0,
            'total_exports': 0,
            'has_memory': False,
            'has_tables': False,
            'has_globals': False,
            'complexity_score': 0
        }
        
        if 'module' in ast_data:
            module = ast_data['module']
            
            # Conta funções
            if 'functions' in module:
                analysis['total_functions'] = len(module['functions'])
            
            # Conta imports
            if 'imports' in module:
                analysis['total_imports'] = len(module['imports'])
            
            # Conta exports
            if 'exports' in module:
                analysis['total_exports'] = len(module['exports'])
            
            # Verifica seções
            analysis['has_memory'] = 'memory' in module
            analysis['has_tables'] = 'tables' in module
            analysis['has_globals'] = 'globals' in module
            
            # Calcula score de complexidade
            analysis['complexity_score'] = (
                analysis['total_functions'] * 2 +
                analysis['total_imports'] +
                analysis['total_exports'] +
                (10 if analysis['has_memory'] else 0) +
                (5 if analysis['has_tables'] else 0) +
                (3 if analysis['has_globals'] else 0)
            )
            
        
        return analysis


    def extract_key_functions(self, functions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extrai todas as funções com otimizações"""
        if not functions:
            return []
        
        # Processa todas as funções, mas otimiza cada uma
        key_functions = []
        for func in functions:
            simplified_func = {
                'name': func.get('name', 'anonymous'),
                'parameters': func.get('parameters', []),  # Mantém todos os parâmetros
                'return_type': func.get('return_type', 'void'),
                'instruction_count': len(func.get('body', {}).get('instructions', [])),
                'instructions_sample': self.sample_instructions(func.get('body', {}).get('instructions', []))
            }
            key_functions.append(simplified_func)
        
        return key_functions

    def sample_instructions(self, instructions: List[Any], max_count: int = None) -> List[str]:
        """Amostra instruções importantes"""
        if max_count is None:
            max_count = self.max_instructions
        
        if not instructions:
            return []
        
        # Filtra instruções importantes
        important_ops = ['call', 'call_indirect', 'local.get', 'local.set', 'global.get', 'global.set', 
                        'i32.load', 'i32.store', 'i32.add', 'i32.sub', 'i32.mul', 'i32.div',
                        'memory.grow', 'memory.size', 'table.get', 'table.set']
        
        important_instructions = []
        for instr in instructions:
            if isinstance(instr, dict) and 'op' in instr:
                op = instr['op']
                if op in important_ops or any(keyword in str(instr).lower() for keyword in ['crypto', 'hash', 'mine']):
                    important_instructions.append(str(instr)[:100])  # Limita tamanho
        
        # Se não encontrou instruções importantes, pega uma amostra geral
        if not important_instructions:
            important_instructions = [str(instr)[:100] for instr in instructions[:max_count]]
        
        return important_instructions[:max_count]

    def extract_key_imports(self, imports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extrai imports mais importantes"""
        if not imports:
            return []
        
        # Prioriza imports suspeitos ou importantes
        def import_importance(imp):
            if not isinstance(imp, dict):
                return 0
            
            module_name = imp.get('module', '').lower()
            import_name = imp.get('name', '').lower()
            
            score = 0
            if any(keyword in module_name for keyword in ['crypto', 'mining', 'hash']):
                score += 10
            if any(keyword in import_name for keyword in ['hash', 'mine', 'crypto', 'random']):
                score += 5
            if 'memory' in import_name:
                score += 3
            if 'table' in import_name:
                score += 2
            
            return score
        
        sorted_imports = sorted(imports, key=import_importance, reverse=True)
        return sorted_imports[:self.max_imports]

    def extract_key_exports(self, exports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extrai exports mais importantes"""
        if not exports:
            return []
        
        # Prioriza exports suspeitos ou importantes
        def export_importance(exp):
            if not isinstance(exp, dict):
                return 0
            
            export_name = exp.get('name', '').lower()
            score = 0
            if any(keyword in export_name for keyword in ['hash', 'mine', 'crypto', 'worker', 'main']):
                score += 10
            if 'memory' in export_name:
                score += 5
            if 'table' in export_name:
                score += 3
            
            return score
        
        sorted_exports = sorted(exports, key=export_importance, reverse=True)
        return sorted_exports[:self.max_exports]

    def create_optimized_summary(self, ast_data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um resumo otimizado do AST"""
        if 'module' not in ast_data:
            return {'error': 'Invalid WASM AST structure'}
        
        module = ast_data['module']
        
        # Estrutura otimizada
        optimized_ast = {
            'metadata': {
                'optimized_for_llm': True,
                'timestamp': datetime.now().isoformat(),
                'original_stats': analysis,
                'compression_info': {
                    'functions_kept': analysis['total_functions'],
                    'imports_kept': min(analysis['total_imports'], self.max_imports),
                    'exports_kept': min(analysis['total_exports'], self.max_exports)
                }
            },
            'module': {
                'functions': self.extract_key_functions(module.get('functions', [])),
                'imports': self.extract_key_imports(module.get('imports', [])),
                'exports': self.extract_key_exports(module.get('exports', []))
            }
        }
        
        # Adiciona informações de memória se existir
        if 'memory' in module:
            memory_info = module['memory']
            if isinstance(memory_info, dict):
                optimized_ast['module']['memory'] = {
                    'initial': memory_info.get('initial', 0),
                    'maximum': memory_info.get('maximum'),
                    'note': f"Memory section present - {memory_info.get('initial', 0)} initial pages"
                }
        
        
        return optimized_ast


    def optimize_wasm_ast(self, ast_file_path: str, output_dir: str = "llm_optimized") -> Dict[str, Any]:
        """Otimiza um arquivo AST de WASM para análise por LLM"""
        Path(output_dir).mkdir(exist_ok=True, parents=True)
        
        try:
            # Carrega o AST original
            with open(ast_file_path, 'r', encoding='utf-8') as f:
                ast_data = json.load(f)
            
            # Analisa o AST
            analysis = self.analyze_wasm_ast(ast_data)
            
            # Cria versão otimizada
            optimized_ast = self.create_optimized_summary(ast_data, analysis)
            
            # Calcula taxa de compressão
            original_size = os.path.getsize(ast_file_path)
            optimized_json = json.dumps(optimized_ast, indent=2, ensure_ascii=False)
            optimized_size = len(optimized_json.encode('utf-8'))
            compression_ratio = optimized_size / original_size if original_size > 0 else 0
            
            # Salva arquivo otimizado
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_name = Path(ast_file_path).stem
            output_file = os.path.join(output_dir, f"llm_optimized_{base_name}_{timestamp}.json")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(optimized_json)
            
            # Salva metadados
            metadata = {
                'timestamp': timestamp,
                'source_file': ast_file_path,
                'output_file': output_file,
                'original_size': original_size,
                'optimized_size': optimized_size,
                'compression_ratio': compression_ratio,
                'size_reduction': f"{((1 - compression_ratio) * 100):.1f}%",
                'analysis': analysis
            }
            
            metadata_file = os.path.join(output_dir, f"metadata_{base_name}_{timestamp}.json")
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            if self.verbose:
                print(f"Otimizado: {original_size} -> {optimized_size} bytes ({compression_ratio:.3f})")
                print(f"Arquivos salvos: {output_file}, {metadata_file}")
            
            return {
                'output_file': output_file,
                'metadata_file': metadata_file,
                'compression_ratio': compression_ratio,
                'analysis': analysis
            }
            
        except Exception as e:
            if self.verbose:
                print(f"Erro processando {ast_file_path}: {str(e)}")
            return {'error': str(e)}

def process_directory_for_llm(input_dir: str, output_base_dir: str = "llm_optimized", verbose: bool = False) -> List[Dict[str, Any]]:
    """Processa todos os arquivos JSON de AST de WASM para otimização LLM"""
    optimizer = LLMWasmOptimizer(verbose=verbose)
    
    results = []
    input_path = Path(input_dir)
    
    # Encontra todos os arquivos JSON de AST
    json_files = list(input_path.rglob("*.json"))
    
    for json_file in json_files:
        try:
            # Verifica se é um arquivo de AST de WASM (contém 'module' com 'functions')
            with open(json_file, 'r', encoding='utf-8') as f:
                sample_data = json.load(f)
            
            if isinstance(sample_data, dict) and 'module' in sample_data:
                module = sample_data['module']
                if isinstance(module, dict) and 'functions' in module:
                    # É um AST de WASM válido
                    relative_path = json_file.relative_to(input_path)
                    output_dir = Path(output_base_dir) / relative_path.parent
                    output_dir.mkdir(parents=True, exist_ok=True)
                    
                    result = optimizer.optimize_wasm_ast(str(json_file), str(output_dir))
                    result['source_file'] = str(json_file)
                    results.append(result)
                    
        except Exception as e:
            if verbose:
                print(f"Erro processando {json_file}: {str(e)}")
    
    return results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Otimizador de AST de WASM para LLM')
    parser.add_argument('--input', '-i', help='Arquivo ou diretório de entrada')
    parser.add_argument('--output', '-o', default='llm_optimized', help='Diretório de saída')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída verbosa')
    
    args = parser.parse_args()
    
    if args.input:
        if os.path.isfile(args.input):
            optimizer = LLMWasmOptimizer(verbose=args.verbose)
            result = optimizer.optimize_wasm_ast(args.input, args.output)
            if args.verbose and 'error' not in result:
                print(f"Compressão: {result['compression_ratio']:.3f}")
        elif os.path.isdir(args.input):
            results = process_directory_for_llm(args.input, args.output, verbose=args.verbose)
            if args.verbose and results:
                avg_compression = sum(r.get('compression_ratio', 0) for r in results) / len(results)
                print(f"Compressão média: {avg_compression:.3f}")
        else:
            print("Caminho inválido.")
    else:
        parser.print_help()
