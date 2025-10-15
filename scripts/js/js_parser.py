import os
import re
import json
import jsbeautifier
import esprima
from datetime import datetime
from pathlib import Path

class JavaScriptDeobfuscator:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.beautifier_opts = jsbeautifier.default_options()
        self.beautifier_opts.indent_size = 2
        self.beautifier_opts.space_in_empty_paren = True

    def decode_hex_strings(self, js_code):
        """Decodifica strings hexadecimais no formato \\xXX"""
        def decode_hex(match):
            hex_str = match.group(1)
            try:
                return chr(int(hex_str, 16))
            except:
                return match.group(0)
        
        js_code = re.sub(r'\\x([0-9a-fA-F]{2})', decode_hex, js_code)
        return js_code

    def decode_unicode_escapes(self, js_code):
        """Decodifica escapes unicode no formato \\uXXXX"""
        def decode_unicode(match):
            unicode_str = match.group(1)
            try:
                return chr(int(unicode_str, 16))
            except:
                return match.group(0)
        
        js_code = re.sub(r'\\u([0-9a-fA-F]{4})', decode_unicode, js_code)
        return js_code

    def extract_string_array(self, js_code):
        """Extrai e decodifica array de strings ofuscadas"""
        array_pattern = r'var\s+(\w+)\s*=\s*\[([^\]]+)\];'
        match = re.search(array_pattern, js_code, re.DOTALL)
        
        if not match:
            return js_code, None, None
            
        array_name = match.group(1)
        array_content = match.group(2)
        
        # Extrai strings individuais
        string_pattern = r"'([^']+)'|\"([^\"]+)\""
        strings = re.findall(string_pattern, array_content)
        decoded_strings = []
        
        for string_pair in strings:
            string = string_pair[0] or string_pair[1]
            decoded = self.decode_hex_strings(string)
            decoded = self.decode_unicode_escapes(decoded)
            decoded_strings.append(decoded)
        
        return js_code, array_name, decoded_strings

    def decode_rc4_like_obfuscation(self, js_code):
        """Decodifica obfuscação estilo RC4 comum em miners"""
        try:
            decoder_pattern = r'function\s+\w+\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{[^}]+\}'
            decoder_match = re.search(decoder_pattern, js_code)
            
            js_code, array_name, string_array = self.extract_string_array(js_code)
            
            if array_name and string_array:
                func_call_pattern = rf'{array_name}\[(\w+)\]'
                js_code = re.sub(func_call_pattern, f'/* decoded_array[{array_name}[\\1]] */', js_code)
                
            return js_code
            
        except Exception:
            return js_code

    def simplify_miner_patterns(self, js_code):
        """Simplifica padrões específicos de mineradores"""
        
        # Substitui padrões comuns de miners
        replacements = {
            r'miner\.\w+\s*==\s*[\'"]yes[\'"]': 'miner.isAvailable',
            r'miner\.start\([^)]+\)': 'miner.start()',
            r'miner\.stop\(\)': 'miner.stop()',
            r'miner\.getHashesPerSecond\(\)': 'miner.getHashesPerSecond()',
            r'miner\.getNumThreads\(\)': 'miner.getNumThreads()',
            r'miner\.setNumThreads\([^)]+\)': 'miner.setNumThreads()',
            r'this\.elements\.\w+': 'this.elements.component',
            r'this\.miner\.\w+': 'this.miner.method',
            r'hashesPerSecond': 'hashRate',
            r'totalHashes': 'totalHashes'
        }
        
        for pattern, replacement in replacements.items():
            js_code = re.sub(pattern, replacement, js_code)
            
        return js_code

    def restructure_miner_ui(self, js_code):
        """Reestrutura a classe MinerUI para forma legível"""
        miner_ui_pattern = r'var\s+MinerUI\s*=\s*function\s*\(([^)]+)\)\s*\{([^}]+)\}'
        match = re.search(miner_ui_pattern, js_code, re.DOTALL)
        
        if match:
            params = match.group(1)
            body = match.group(2)
            
            structured_constructor = f"""function MinerUI({params}) {{
    this.miner = miner;
    this.elements = elements;
    this.hashes = 0;
    this.acceptedHashes = 0;
    this.stats = [];
    this._eventListeners = {{
        open: [], authed: [], close: [], error: [],
        job: [], found: [], accepted: [], optin: []
    }};
    this._initializeComponents();
}}"""
            
            js_code = js_code.replace(match.group(0), structured_constructor)
            
        return js_code

    def beautify_code(self, js_code):
        """Aplica beautification ao código"""
        try:
            # Verifica se o código não está vazio
            if not js_code or not js_code.strip():
                return js_code
            
            # Tenta beautify com configurações mais tolerantes
            beautified = jsbeautifier.beautify(js_code, self.beautifier_opts)
            
            # Verifica se o resultado não está vazio
            if not beautified or not beautified.strip():
                if self.verbose:
                    print("Warning: Beautification resulted in empty code, using original")
                return js_code
                
            return beautified
        except Exception as e:
            if self.verbose:
                print(f"Warning: Beautification failed: {str(e)}, using original code")
            return js_code

    def generate_ast(self, js_code):
        """Gera AST do código estruturado"""
        try:
            ast = esprima.parseScript(js_code, {
                'range': True,
                'loc': True,
                'comment': True,
                'tokens': True,
                'tolerant': True
            })
            return ast
        except Exception:
            return None

    def analyze_ast_structure(self, ast):
        """Analisa a estrutura do AST para extrair informações importantes"""
        analysis = {
            'variables': [],
            'functions': [],
            'classes': [],
            'calls': [],
            'patterns': {
                'miner_calls': [],
                'event_listeners': [],
                'intervals': []
            }
        }
        
        def traverse_node(node, depth=0):
            if hasattr(node, 'type'):
                # Variáveis
                if node.type == 'VariableDeclarator':
                    if hasattr(node, 'id') and hasattr(node.id, 'name'):
                        analysis['variables'].append({
                            'name': node.id.name,
                            'type': 'variable'
                        })
                
                # Funções
                elif node.type == 'FunctionDeclaration':
                    if hasattr(node, 'id') and node.id:
                        analysis['functions'].append({
                            'name': node.id.name,
                            'type': 'function'
                        })
                
                # Chamadas de método
                elif node.type == 'CallExpression':
                    if (hasattr(node, 'callee') and 
                        hasattr(node.callee, 'property') and 
                        hasattr(node.callee.property, 'name')):
                        method_name = node.callee.property.name
                        analysis['calls'].append(method_name)
                        
                        # Padrões específicos de mineradores
                        if 'miner' in str(node.callee).lower():
                            analysis['patterns']['miner_calls'].append(method_name)
                        elif 'addEventListener' in method_name:
                            analysis['patterns']['event_listeners'].append(method_name)
                        elif 'setInterval' in method_name:
                            analysis['patterns']['intervals'].append(method_name)
            
            # Recursão para filhos
            for attr in ['body', 'declarations', 'expression', 'callee', 'arguments']:
                if hasattr(node, attr):
                    children = getattr(node, attr)
                    if isinstance(children, list):
                        for child in children:
                            traverse_node(child, depth + 1)
                    elif children:
                        traverse_node(children, depth + 1)
        
        if ast and hasattr(ast, 'body'):
            for node in ast.body:
                traverse_node(node)
        
        return analysis

    def deobfuscate_and_analyze(self, js_code, output_dir="output"):
        """Processo completo de desofuscação e análise"""
        Path(output_dir).mkdir(exist_ok=True, parents=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Preserva o código original para fallback
        original_code = js_code
        
        try:
            js_code = self.decode_hex_strings(js_code)
            js_code = self.decode_unicode_escapes(js_code)
            js_code = self.decode_rc4_like_obfuscation(js_code)
            js_code = self.beautify_code(js_code)
            js_code = self.simplify_miner_patterns(js_code)
            # js_code = self.restructure_miner_ui(js_code)  # Disabled to avoid syntax errors
            js_code = self.beautify_code(js_code)
        except Exception as e:
            if self.verbose:
                print(f"Warning: Deobfuscation failed: {str(e)}, using original code")
            js_code = original_code
        
        # Garante que sempre há código para salvar
        if not js_code or not js_code.strip():
            if self.verbose:
                print("Warning: Processed code is empty, using original code")
            js_code = original_code
        
        # Salva o código estruturado
        structured_file = os.path.join(output_dir, f"structured_{timestamp}.js")
        with open(structured_file, 'w', encoding='utf-8', errors='replace') as f:
            f.write(js_code)
        
        # Tenta gerar AST
        ast = None
        analysis = None
        
        try:
            ast = self.generate_ast(js_code)
            if ast:
                ast_file = os.path.join(output_dir, f"ast_{timestamp}.json")
                with open(ast_file, 'w', encoding='utf-8') as f:
                    json.dump(ast.toDict(), f, indent=2, default=str, ensure_ascii=False)
                
                analysis = self.analyze_ast_structure(ast)
                analysis_file = os.path.join(output_dir, f"analysis_{timestamp}.json")
                with open(analysis_file, 'w', encoding='utf-8') as f:
                    json.dump(analysis, f, indent=2, ensure_ascii=False)
        except Exception as e:
            if self.verbose:
                print(f"Warning: AST generation failed: {str(e)}")
        
        # Sempre retorna resultado, mesmo que AST falhe
        result = {
            'structured_code': js_code,
            'files': {
                'structured': structured_file
            }
        }
        
        if ast:
            result['ast'] = ast
            result['analysis'] = analysis
            result['files']['ast'] = os.path.join(output_dir, f"ast_{timestamp}.json")
            result['files']['analysis'] = os.path.join(output_dir, f"analysis_{timestamp}.json")
        
        return result

def process_directory(input_dir, output_base_dir="analysis_output", verbose=False):
    """Processa todos os arquivos JS em um diretório"""
    deobfuscator = JavaScriptDeobfuscator(verbose=verbose)
    
    # Encontra apenas o diretório 'js' dentro do input_dir
    js_dir = None
    for root, dirs, files in os.walk(input_dir):
        if 'js' in dirs:
            js_dir = os.path.join(root, 'js')
            break
    
    if not js_dir:
        if verbose:
            print(f"No 'js' directory found in {input_dir}")
        return
    
    # Estrutura: <dir de saída>/<domínio analisado>/<js>
    domain_name = os.path.basename(input_dir)  # Nome do domínio (ex: webdollar.io)
    output_js_dir = os.path.join(output_base_dir, domain_name, 'js')
    
    for root, dirs, files in os.walk(js_dir):
        for file in files:
            if file.endswith('.js'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(root, js_dir)
                if relative_path == '.':
                    output_dir = os.path.join(output_js_dir, os.path.splitext(file)[0])
                else:
                    output_dir = os.path.join(output_js_dir, relative_path, os.path.splitext(file)[0])
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        js_code = f.read()
                    
                    deobfuscator.deobfuscate_and_analyze(js_code, output_dir)
                    
                except Exception as e:
                    if verbose:
                        print(f"Error processing {file_path}: {str(e)}")

def interactive_deobfuscation():
    """Modo interativo para desofuscar código individual"""
    deobfuscator = JavaScriptDeobfuscator()
    
    print("JavaScript Deobfuscator - Interactive Mode")
    print("Paste your obfuscated code below (Ctrl+D to finish):")
    
    try:
        lines = []
        while True:
            try:
                line = input()
                lines.append(line)
            except EOFError:
                break
        
        js_code = '\n'.join(lines)
        
        if js_code.strip():
            result = deobfuscator.deobfuscate_and_analyze(js_code, "interactive_output")
            
            if result:
                print(f"\nFiles saved to: {result['files']['structured']}")
                analysis = result['analysis']
                print(f"Variables: {len(analysis['variables'])}, Functions: {len(analysis['functions'])}")
            
    except KeyboardInterrupt:
        print("\nCancelled.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='JavaScript deobfuscator and analyzer')
    parser.add_argument('--input', '-i', help='Input file or directory')
    parser.add_argument('--output', '-o', default='analysis_output', help='Output directory')
    parser.add_argument('--interactive', action='store_true', help='Interactive mode')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_deobfuscation()
    elif args.input:
        if os.path.isfile(args.input):
            deobfuscator = JavaScriptDeobfuscator(verbose=args.verbose)
            with open(args.input, 'r', encoding='utf-8', errors='ignore') as f:
                js_code = f.read()
            deobfuscator.deobfuscate_and_analyze(js_code, args.output)
        elif os.path.isdir(args.input):
            process_directory(args.input, args.output, verbose=args.verbose)
        else:
            print("Invalid path.")
    else:
        parser.print_help()