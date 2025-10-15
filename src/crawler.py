import os
import re
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import base64


class ArtifactCrawler:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.saved = set()
        
    def sanitize_filename(self, url):
        clean = re.sub(r'[^a-zA-Z0-9-_./]', '_', url)
        return clean[:200] if len(clean) > 200 else clean
    
    def guess_ext_from_content_type(self, ct):
        if not ct:
            return None
        lower = ct.lower()
        if 'application/wasm' in lower:
            return '.wasm'
        if any(x in lower for x in ['javascript', 'ecmascript', 'text/js']):
            return '.js'
        return None
    
    def is_wasm_by_magic(self, data):
        return len(data) >= 4 and data[:4] == b'\x00\x61\x73\x6d'
    
    def is_likely_js_by_heuristics(self, ct, url):
        if ct and 'javascript' in ct.lower():
            return True
        if re.search(r'\.(?:m?js)(?:\?|#|$)', url, re.I):
            return True
        if any(p in url for p in ['/js/', '/javascript/', '/scripts/', '.min.js', '.bundle.js', '.chunk.js']):
            return True
        return False
    
    def is_likely_wasm_by_heuristics(self, ct, url):
        if ct and 'application/wasm' in ct.lower():
            return True
        if re.search(r'\.(?:wasm)(?:\?|#|$)', url, re.I):
            return True
        if re.match(r'^data:application/wasm(?:;|,)', url, re.I):
            return True
        wasm_paths = ['/wasm/', '/webassembly/', '/canvas/', '/canvas2d/', '/webgl/', 
                      '/flutter/', '/canvaskit/', '/emscripten/', '/unity/', '/unreal/']
        return any(p in url for p in wasm_paths)
    
    def target_path_for(self, url, base_dir, default_ext, content_type, main_site_hostname=None):
        url_obj = urlparse(url)
        hostname = url_obj.hostname or 'unknown'
        pathname = url_obj.path
        
        file_type = 'other'
        if default_ext == '.js' or (content_type and 'javascript' in content_type.lower()):
            file_type = 'js'
        elif default_ext == '.wasm' or (content_type and 'application/wasm' in content_type.lower()):
            file_type = 'wasm'
        elif content_type:
            ct_lower = content_type.lower()
            if 'css' in ct_lower:
                file_type = 'css'
            elif 'image' in ct_lower:
                file_type = 'images'
            elif 'font' in ct_lower:
                file_type = 'fonts'
            elif 'json' in ct_lower:
                file_type = 'data'
        
        filename = pathname.replace('/', '_').lstrip('_')
        if not filename or filename.endswith('_'):
            filename += 'index'
        
        ext = Path(filename).suffix or default_ext or self.guess_ext_from_content_type(content_type) or ''
        if not Path(filename).suffix:
            filename += ext
        
        target_hostname = hostname
        if main_site_hostname and hostname != main_site_hostname:
            target_hostname = main_site_hostname
            service_name = self.sanitize_filename(hostname)
            filename = f"{service_name}_{filename}"
        
        return Path(base_dir) / self.sanitize_filename(target_hostname) / file_type / self.sanitize_filename(filename)
    
    def save_buffer(self, file_path, data):
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
    
    def crawl(self, start_url, out_dir, max_pages=1, headless=True):
        out_dir = Path(out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        
        main_site_hostname = urlparse(start_url).hostname
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=headless,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            )
            
            context = browser.new_context(
                java_script_enabled=True,
                bypass_csp=True,
                service_workers='allow',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
                extra_http_headers={
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            )
            
            def handle_response(response):
                try:
                    url = response.url
                    if not url or url in self.saved:
                        return
                    
                    resource_type = response.request.resource_type
                    headers = response.headers
                    content_type = headers.get('content-type') or headers.get('Content-Type')
                    
                    if self.verbose:
                        print(f"Resource: {url} (type: {resource_type}, ct: {content_type})")
                    
                    is_wasm_heur = self.is_likely_wasm_by_heuristics(content_type, url)
                    is_js_heur = self.is_likely_js_by_heuristics(content_type, url)
                    is_script_resource = resource_type == 'script'
                    is_js_by_ct = content_type and any(x in content_type.lower() for x in 
                                                       ['javascript', 'ecmascript', 'text/js', 
                                                        'application/javascript', 'application/x-javascript'])
                    
                    should_process = is_wasm_heur or is_js_heur or is_script_resource or is_js_by_ct
                    
                    if not should_process:
                        return
                    
                    try:
                        body = response.body()
                    except Exception as e:
                        if self.verbose:
                            print(f"Failed to get body for {url}: {e}")
                        return
                    
                    if not body:
                        return
                    
                    is_wasm_magic = self.is_wasm_by_magic(body)
                    
                    is_js_by_content = False
                    if body and not is_wasm_magic:
                        try:
                            text = body[:1000].decode('utf-8', errors='ignore')
                            is_js_by_content = bool(re.search(
                                r'(?:function|var|let|const|=>|import|export|class|async|await|console\.|document\.|window\.)',
                                text
                            ))
                        except:
                            pass
                    
                    default_ext = None
                    if is_wasm_heur or is_wasm_magic:
                        default_ext = '.wasm'
                    elif is_js_heur or is_script_resource or is_js_by_ct or is_js_by_content:
                        default_ext = '.js'
                    elif is_script_resource:
                        default_ext = '.js'
                    
                    if url.startswith('data:'):
                        import time
                        import random
                        synthetic_name = f"inline/{int(time.time())}_{random.randint(1000, 9999)}{default_ext or ''}"
                        file_path = out_dir / synthetic_name
                    else:
                        file_path = self.target_path_for(url, out_dir, default_ext, content_type, main_site_hostname)
                    
                    if self.verbose and default_ext == '.wasm':
                        print(f"Saving WASM: {url} -> {file_path}")
                    
                    self.save_buffer(file_path, body)
                    self.saved.add(url)
                    
                    if (default_ext == '.js' or is_js_heur) and body:
                        try:
                            text = body.decode('utf-8', errors='ignore')
                            data_url_pattern = r'data:application/wasm;base64,([A-Za-z0-9+/=]+)'
                            for match in re.finditer(data_url_pattern, text):
                                b64 = match.group(1)
                                wasm_buf = base64.b64decode(b64)
                                if wasm_buf and self.is_wasm_by_magic(wasm_buf):
                                    import time
                                    import random
                                    inline_path = out_dir / f"inline/embedded_{int(time.time())}_{random.randint(1000, 9999)}.wasm"
                                    self.save_buffer(inline_path, wasm_buf)
                        except:
                            pass
                
                except:
                    pass
            
            context.on('response', handle_response)
            
            to_visit = [start_url]
            visited = set()
            
            while to_visit and len(visited) < max_pages:
                url = to_visit.pop(0)
                if not url or url in visited:
                    continue
                visited.add(url)
                
                page = context.new_page()
                
                try:
                    if self.verbose:
                        print(f"Navigating to: {url}")
                    
                    response = page.goto(url, wait_until='domcontentloaded', timeout=60000)
                    
                    page.wait_for_timeout(5000)
                    
                    if len(visited) < max_pages:
                        try:
                            links = page.eval_on_selector_all('a[href]', 
                                '(elements) => elements.map(e => e.href).filter(Boolean)')
                            origin = urlparse(url).netloc
                            for href in links:
                                try:
                                    if urlparse(href).netloc == origin and href not in visited:
                                        to_visit.append(href)
                                except:
                                    pass
                        except:
                            pass
                    
                except Exception as e:
                    if self.verbose:
                        print(f"Error navigating to {url}: {e}")
                finally:
                    page.close()
            
            context.close()
            browser.close()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Artifact crawler for JavaScript and WebAssembly')
    parser.add_argument('url', help='Starting URL to crawl')
    parser.add_argument('--output', '-o', default='downloads', help='Output directory')
    parser.add_argument('--max-pages', '-m', type=int, default=1, help='Maximum pages to crawl')
    parser.add_argument('--headless', action='store_true', default=True, help='Run in headless mode')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    crawler = ArtifactCrawler(verbose=args.verbose)
    
    if args.verbose:
        print(f"Starting crawl: {args.url}")
        print(f"Output: {args.output}")
        print(f"Max pages: {args.max_pages}")
    
    crawler.crawl(args.url, args.output, max_pages=args.max_pages, headless=args.headless)
    
    if args.verbose:
        print(f"Crawl completed. Check: {args.output}")


if __name__ == '__main__':
    main()

