#!/usr/bin/env python3

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional


class SimpleWatParser:
    def __init__(self):
        pass

    def run_wasm2wat(self, input_wasm: Path, output_wat: Path) -> None:
        """Converte WASM para WAT usando wasm2wat"""
        output_wat.parent.mkdir(parents=True, exist_ok=True)
        try:
            subprocess.run([
                'wasm2wat', str(input_wasm), '-o', str(output_wat)
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except FileNotFoundError as exc:
            raise RuntimeError('wasm2wat não encontrado no PATH. Instale o wabt.') from exc
        except subprocess.CalledProcessError as exc:
            raise RuntimeError(f'Falha ao converter {input_wasm.name}: {exc.stderr.decode("utf-8", "ignore").strip()}') from exc

    def read_text(self, file_path: Path) -> str:
        return file_path.read_text(encoding='utf-8', errors='ignore')

    def extract_functions_basic(self, wat: str) -> List[Dict[str, Any]]:
        """Extrai funções básicas sem análise"""
        functions = []
        
        # Regex para capturar funções
        func_pattern = r'\(func\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*((?:\([^)]*\))*)\s*((?:\([^()]*(?:\([^()]*\)[^()]*)*\)|[^()\s])*?)\)'
        
        for match in re.finditer(func_pattern, wat, re.DOTALL):
            name = match.group(1) or f'anonymous_{len(functions)}'
            signature = match.group(2) or ''
            body = match.group(3) or ''
            
            # Extrai parâmetros básicos
            params = []
            param_matches = re.finditer(r'\(param\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*([a-zA-Z0-9_.]+)\)', signature + body)
            for pm in param_matches:
                params.append({
                    'name': pm.group(1) or f'param_{len(params)}',
                    'type': pm.group(2)
                })
            
            # Extrai tipo de retorno
            return_match = re.search(r'\(result\s+([a-zA-Z0-9_.]+)\)', signature + body)
            return_type = return_match.group(1) if return_match else 'void'
            
            # Extrai variáveis locais
            locals_list = []
            local_matches = re.finditer(r'\(local\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*([a-zA-Z0-9_.]+)\)', body)
            for lm in local_matches:
                locals_list.append({
                    'name': lm.group(1) or f'local_{len(locals_list)}',
                    'type': lm.group(2)
                })
            
            # Instruções básicas (apenas contagem)
            instructions = []
            instr_matches = re.finditer(r'\(([a-zA-Z0-9_.]+)(?:\s+[^)]*)?\)', body)
            for im in instr_matches:
                instructions.append(im.group(1))
            
            functions.append({
                'name': name,
                'parameters': params,
                'return_type': return_type,
                'locals': locals_list,
                'instruction_count': len(instructions),
                'instructions_sample': instructions[:10]  # Apenas amostra
            })
        
        return functions

    def extract_module_metadata(self, wat: str) -> Dict[str, Any]:
        """Extrai metadados básicos do módulo"""
        metadata = {
            'imports': [],
            'exports': [],
            'memory_sections': [],
            'tables': [],
            'globals': [],
            'data_sections': [],
            'types': []
        }
        
        # Imports
        import_matches = re.finditer(r'\(import\s+"([^"]+)"\s+"([^"]+)"\s*\(([^)]+)\)\)', wat)
        for im in import_matches:
            metadata['imports'].append({
                'module': im.group(1),
                'name': im.group(2),
                'type': im.group(3)
            })
        
        # Exports
        export_matches = re.finditer(r'\(export\s+"([^"]+)"\s*\(([^)]+)\)\)', wat)
        for em in export_matches:
            metadata['exports'].append({
                'name': em.group(1),
                'type': em.group(2)
            })
        
        # Memory
        memory_matches = re.finditer(r'\(memory\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*(\d+)(?:\s+(\d+))?\)', wat)
        for mm in memory_matches:
            metadata['memory_sections'].append({
                'name': mm.group(1) or 'memory',
                'initial': int(mm.group(2)),
                'maximum': int(mm.group(3)) if mm.group(3) else None
            })
        
        # Tables
        table_matches = re.finditer(r'\(table\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*(\d+)(?:\s+(\d+))?\s+([a-zA-Z0-9_]+)\)', wat)
        for tm in table_matches:
            metadata['tables'].append({
                'name': tm.group(1) or 'table',
                'initial': int(tm.group(2)),
                'maximum': int(tm.group(3)) if tm.group(3) else None,
                'element_type': tm.group(4)
            })
        
        # Globals
        global_matches = re.finditer(r'\(global\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*([a-zA-Z0-9_]+)(?:\s+([^)]+))?\)', wat)
        for gm in global_matches:
            metadata['globals'].append({
                'name': gm.group(1) or 'global',
                'type': gm.group(2),
                'init': gm.group(3) or None
            })
        
        # Data sections
        data_matches = re.finditer(r'\(data\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*([^)]+)\)', wat)
        for dm in data_matches:
            metadata['data_sections'].append({
                'name': dm.group(1) or 'data',
                'content': dm.group(2)
            })
        
        # Types
        type_matches = re.finditer(r'\(type\s+(?:\$([a-zA-Z_][a-zA-Z0-9_]*))?\s*\(func\s*([^)]*)\)\)', wat)
        for tm in type_matches:
            metadata['types'].append({
                'name': tm.group(1) or 'type',
                'signature': tm.group(2)
            })
        
        return metadata

    def _convert_s_expr_to_instruction(self, expr: Any) -> Dict[str, Any]:
        """Converte uma S-expression aninhada numa instrução estruturada recursivamente."""
        if not isinstance(expr, list) or not expr:
            return {"op": expr, "args": []}

        op = expr[0]
        instruction = {"op": op}
        
        # Bloco de instruções: (block <label> <instr>*) / (loop <label> <instr>*) / (if <label> <expr> (then <instr>*) (else <instr>*))
        if op in ('block', 'loop', 'if'):
            arg_idx = 1
            # Verifica se existe um label
            if len(expr) > arg_idx and isinstance(expr[arg_idx], str) and expr[arg_idx].startswith('$'):
                instruction['label'] = expr[arg_idx]
                arg_idx += 1
            
            # Ignora anotações de tipo como (result i32)
            while arg_idx < len(expr) and isinstance(expr[arg_idx], list) and expr[arg_idx][0] in ('param', 'result'):
                arg_idx += 1

            body_exprs = expr[arg_idx:]
            
            # O 'if' é especial, pode ter cláusulas 'then' e 'else'
            if op == 'if':
                # As primeiras expressões são a condição
                condition_exprs = []
                then_clause = None
                else_clause = None

                for sub_expr in body_exprs:
                    if isinstance(sub_expr, list) and sub_expr[0] == 'then':
                        then_clause = [self._convert_s_expr_to_instruction(e) for e in sub_expr[1:]]
                    elif isinstance(sub_expr, list) and sub_expr[0] == 'else':
                        else_clause = [self._convert_s_expr_to_instruction(e) for e in sub_expr[1:]]
                    elif then_clause is None: # Tudo antes do 'then' é condição
                        condition_exprs.append(self._convert_s_expr_to_instruction(sub_expr))
                
                instruction['condition'] = condition_exprs
                if then_clause is not None:
                    instruction['body'] = then_clause
                if else_clause is not None:
                    instruction['else'] = else_clause

            else: # para 'block' e 'loop'
                instruction['body'] = [self._convert_s_expr_to_instruction(e) for e in body_exprs]
        else:
            # Instrução simples
            instruction['args'] = expr[1:]
            
        return instruction

    def _process_func_s_expr(self, func_s_expr: list, func_index: int) -> Dict[str, Any]:
        """Processa uma única S-expression de função para extrair seus detalhes."""
        name = f'anonymous_{func_index}' # Placeholder, será atualizado se encontrarmos um nome
        params: List[Dict[str, Any]] = []
        return_type = 'void'
        body_instructions = []

        body_started = False
        for item in func_s_expr[1:]:
            if isinstance(item, str) and item.startswith('$'):
                if not body_started:
                    name = item
            elif isinstance(item, list):
                keyword = item[0]
                if keyword == 'param':
                    param_name = None
                    param_type = None
                    if len(item) > 2 and isinstance(item[1], str) and item[1].startswith('$'):
                        param_name = item[1]
                        param_type = item[2]
                    else:
                        param_name = f'param_{len(params)}'
                        param_type = item[1]
                    params.append({'name': param_name, 'type': param_type})
                elif keyword == 'result':
                    return_type = item[1] if len(item) > 1 else 'void'
                elif keyword == 'local':
                    pass  # Ignora locais
                else:
                    body_started = True
                    body_instructions.append(self._convert_s_expr_to_instruction(item))
            elif body_started:
                body_instructions.append(self._convert_s_expr_to_instruction(item))
        
        return {
            'name': name,
            'parameters': params,
            'return_type': return_type,
            'body': {"instructions": body_instructions}
        }

    def parse_wat_to_clean_ast(self, wat_text: str) -> Dict[str, Any]:
        """Parse WAT para AST limpa do módulo, de forma estruturalmente consciente."""
        
        module_s_expr = self._parse_s_expression(wat_text)
        
        if not module_s_expr or module_s_expr[0] != 'module':
            raise ValueError("Ficheiro WAT não contém um módulo de topo.")

        functions = []
        imports = []
        exports = []
        memory = None
        
        # Lista de secções a serem ignoradas
        ignored_sections = {'data', 'type', 'table', 'global', 'elem', 'start', 'custom'}

        for expr in module_s_expr[1:]:
            if not isinstance(expr, list) or not expr:
                continue

            keyword = expr[0]
            
            if keyword in ignored_sections:
                continue  # Ignora explicitamente a secção

            if keyword == 'func':
                functions.append(self._process_func_s_expr(expr, len(functions)))
            elif keyword == 'import':
                module_name = expr[1]
                import_name = expr[2]
                desc = expr[3]
                
                import_type = desc[0]
                imports.append({'module': module_name, 'name': import_name, 'type': import_type})
                
                # Se a memória for importada, preenche também a secção de memória de topo
                if import_type == 'memory':
                    initial = desc[1]
                    maximum = desc[2] if len(desc) > 2 else None
                    memory = {'initial': initial, 'maximum': maximum}

            elif keyword == 'export':
                export_name = expr[1]
                desc = expr[2]
                export_type = desc[0]
                exports.append({'name': export_name, 'type': export_type})
            
            elif keyword == 'memory' and not memory: # Só processa se a memória não foi importada
                initial = expr[1]
                maximum = expr[2] if len(expr) > 2 else None
                memory = {'initial': initial, 'maximum': maximum}

        clean_ast = {
            'module': {
                'functions': functions,
                'imports': imports,
                'exports': exports,
                'memory': memory,
            }
        }
        
        if not clean_ast['module']['memory']:
            del clean_ast['module']['memory']

        return clean_ast

    def _parse_s_expression(self, wat_content: str) -> Any:
        """
        Faz o parsing do conteúdo de um ficheiro WAT para uma AST em JSON (S-expression).
        Esta versão robusta usa um tokenizer regex para lidar com strings e S-expressions aninhadas.
        """
        # Regex para tokenizar: captura parênteses, strings, comentários de bloco e de linha, ou sequências de caracteres sem espaço.
        token_regex = re.compile(r'\s*(\(;.*?;\)|;;.*$|"[^"]*"|\(|\)|[^\s()]+)', re.MULTILINE)
        raw_tokens = token_regex.findall(wat_content)
        # Filtra os tokens para remover espaços em branco e comentários
        tokens = [token for token in raw_tokens if token and not token.startswith('(;') and not token.startswith(';;')]

        if not tokens:
            return None

        pos = 0

        def parse_expression():
            nonlocal pos
            if pos >= len(tokens):
                raise ValueError("Fim inesperado do input")
            
            token = tokens[pos]
            pos += 1

            if token == '(':
                expression = []
                while pos < len(tokens) and tokens[pos] != ')':
                    expression.append(parse_expression())
                
                if pos < len(tokens) and tokens[pos] == ')':
                    pos += 1
                    return expression
                else:
                    raise ValueError("Expressão S não terminada (parêntese de fecho em falta)")
            
            elif token == ')':
                raise ValueError("Parêntese de fecho inesperado")
            
            else:
                if token.startswith('"') and token.endswith('"'):
                    return token[1:-1]
                try:
                    return int(token)
                except ValueError:
                    try:
                        return float(token)
                    except ValueError:
                        return token

        try:
            ast = []
            while pos < len(tokens):
                ast.append(parse_expression())
            
            if len(ast) == 1:
                return ast[0]
            
            return ast
        except (ValueError, IndexError) as e:
            raise ValueError(f"Erro ao fazer o parsing do WAT: {e}") from e

    def extract_functions_balanced(self, wat: str) -> List[Dict[str, Any]]:
        """Este método está obsoleto e será removido. A lógica foi movida para parse_wat_to_clean_ast."""
        # A lógica principal agora está em parse_wat_to_clean_ast para uma análise estrutural.
        # Esta função pode ser removida ou mantida vazia para evitar erros se ainda for chamada.
        return []


def find_domain_dirs(downloads_dir: Path):
    if not downloads_dir.exists():
        return []
    domains = []
    for child in downloads_dir.iterdir():
        if child.is_dir() and child.name == 'wasm':  # Apenas processa diretório 'wasm'
            domains.append(child)
    return domains


def find_wasm_files(domain_dir: Path):
    return [p for p in domain_dir.rglob('*.wasm')]


def derive_wat_path(wasm_path: Path, temp_wat_root: Path) -> Path:
    rel = wasm_path.relative_to(wasm_path.anchor if wasm_path.is_absolute() else Path('.'))
    return temp_wat_root.joinpath(*rel.parts).with_suffix('.wat')


def output_paths_for_domain(analysis_root: Path, domain_dir: Path):
    # Estrutura: <dir de saída>/<domínio analisado>/<wasm>
    domain_name = domain_dir.parent.name  # Nome do domínio (ex: webdollar.io)
    out_dir = analysis_root.joinpath(domain_name, 'wasm')
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir


def process_domain(domain_dir: Path, analysis_root: Path, temp_wat_root: Path, verbose: bool = False) -> dict:
    wasm_files = find_wasm_files(domain_dir)
    results = []
    
    if verbose:
        print(f"Processing domain: {domain_dir.name} ({len(wasm_files)} files)")
    
    for i, wasm_file in enumerate(wasm_files):
        try:
            rel = wasm_file.relative_to(domain_dir)
            wat_temp = temp_wat_root.joinpath(domain_dir.name, rel).with_suffix('.wat')
            wat_temp.parent.mkdir(parents=True, exist_ok=True)
            
            parser = SimpleWatParser()
            parser.run_wasm2wat(wasm_file, wat_temp)

            wat_text = parser.read_text(wat_temp)
            ast = parser.parse_wat_to_clean_ast(wat_text)

            results.append({
                'filePath': str(wasm_file),
                'watPath': str(wat_temp),
                'wasmSize': wasm_file.stat().st_size,
                'ast': ast
            })
            
        except Exception as exc:
            if verbose:
                print(f"Error processing {wasm_file.name}: {exc}")
            results.append({
                'filePath': str(wasm_file),
                'error': str(exc)
            })

    # Save per-domain outputs
    out_dir = output_paths_for_domain(analysis_root, domain_dir)

    # Save one JSON per module
    for item in results:
        if 'ast' in item:
            base = Path(item['filePath']).with_suffix('').name
            (out_dir / f'{base}.json').write_text(json.dumps(item['ast'], indent=2, ensure_ascii=False), encoding='utf-8')

    return {
        'domain': domain_dir.name,
        'totalWasm': len(wasm_files),
        'processed': sum(1 for r in results if 'ast' in r),
        'errors': [r for r in results if 'error' in r]
    }


def process_single_wasm_file(wasm_file: Path, analysis_root: Path, temp_wat_root: Path, verbose: bool = False) -> Optional[Dict[str, Any]]:
    """Processa um único arquivo WASM"""
    try:
        # Cria diretório de saída baseado no arquivo
        output_dir = analysis_root / 'single_wasm' / wasm_file.stem
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Converte WASM para WAT
        wat_file = temp_wat_root / f"{wasm_file.stem}.wat"
        parser = SimpleWatParser()
        parser.run_wasm2wat(wasm_file, wat_file)
        
        if verbose:
            print(f"Converted {wasm_file.name} to WAT")
        
        # Lê e processa WAT
        wat_content = parser.read_text(wat_file)
        clean_ast = parser.parse_wat_to_clean_ast(wat_content)
        
        # Salva AST limpo
        ast_file = output_dir / 'clean_ast.json'
        ast_file.write_text(json.dumps(clean_ast, ensure_ascii=False, indent=2), encoding='utf-8')
        
        if verbose:
            print(f"Generated clean AST: {ast_file}")
        
        return {
            'wasm_file': str(wasm_file),
            'output_dir': str(output_dir),
            'ast_file': str(ast_file),
            'functions_count': len(clean_ast.get('functions', [])),
            'imports_count': len(clean_ast.get('imports', [])),
            'exports_count': len(clean_ast.get('exports', []))
        }
        
    except Exception as e:
        if verbose:
            print(f"Error processing {wasm_file.name}: {str(e)}")
        return None


def main():
    parser = argparse.ArgumentParser(description='Convert WASM to WAT and generate clean AST')
    parser.add_argument('--input', '-i', help='Input file or directory')
    parser.add_argument('--output', '-o', default='analysis_output', help='Output directory')
    parser.add_argument('--temp_wat', default='temp/wat_converted', help='Temporary WAT directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    args = parser.parse_args()

    # Determina diretório de entrada
    if args.input:
        input_path = Path(args.input).resolve()
        if input_path.is_file():
            # Se é um arquivo, processa apenas esse arquivo
            if input_path.suffix == '.wasm':
                analysis_root = Path(args.output).resolve()
                temp_wat_root = Path(args.temp_wat).resolve()
                temp_wat_root.mkdir(parents=True, exist_ok=True)
                
                # Processa arquivo individual
                result = process_single_wasm_file(input_path, analysis_root, temp_wat_root, verbose=args.verbose)
                if args.verbose:
                    print(f"Processed: {input_path.name}")
                    if result:
                        print(f"Output saved to: {result['output_dir']}")
                return 0
            else:
                print(f"Error: {input_path} is not a .wasm file")
                return 1
        elif input_path.is_dir():
            # Se é um diretório, usa como downloads_dir
            downloads_dir = input_path
        else:
            print(f"Error: {input_path} is not a valid file or directory")
            return 1
    else:
        # Usa downloads padrão
        downloads_dir = Path('downloads').resolve()

    analysis_root = Path(args.output).resolve()
    temp_wat_root = Path(args.temp_wat).resolve()
    temp_wat_root.mkdir(parents=True, exist_ok=True)

    domains = find_domain_dirs(downloads_dir)
    if not domains:
        if args.verbose:
            print('No domains found in downloads/')
        return 0

    summary = []
    for domain in domains:
        domain_summary = process_domain(domain, analysis_root, temp_wat_root, verbose=args.verbose)
        summary.append(domain_summary)
        if args.verbose:
            print(f"{domain.name}: {domain_summary['processed']}/{domain_summary['totalWasm']} processed")

    if args.verbose:
        print(f'Output saved to: {analysis_root}')
    
    return 0


if __name__ == '__main__':
    sys.exit(main())