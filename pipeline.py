#!/usr/bin/env python3

import argparse
from pathlib import Path
import time
from src.crawler import ArtifactCrawler
from scripts.js import JavaScriptDeobfuscator
from scripts.wasm import SimpleWatParser


class Pipeline:
    def __init__(self, verbose=False):
        self.verbose = verbose
        
    def run(self, url, downloads_dir='downloads', analysis_dir='analysis_output', 
            max_pages=1, process_js=True, process_wasm=True):
        
        downloads_path = Path(downloads_dir)
        analysis_path = Path(analysis_dir)
        
        if self.verbose:
            print(f"Pipeline started for: {url}")
            print(f"Downloads: {downloads_path}")
            print(f"Analysis: {analysis_path}")
        
        start_time = time.time()
        
        # Step 1: Crawl
        if self.verbose:
            print("\n[1/3] Crawling...")
        
        crawler = ArtifactCrawler(verbose=self.verbose)
        crawler.crawl(url, downloads_dir, max_pages=max_pages)
        
        crawl_time = time.time() - start_time
        if self.verbose:
            print(f"Crawling completed in {crawl_time:.2f}s")
        
        # Step 2: Process JavaScript
        if process_js:
            if self.verbose:
                print("\n[2/3] Processing JavaScript files...")
            
            js_start = time.time()
            js_files = list(downloads_path.rglob('*.js'))
            
            if js_files:
                deobfuscator = JavaScriptDeobfuscator(verbose=self.verbose)
                
                for js_file in js_files:
                    try:
                        js_code = js_file.read_text(encoding='utf-8', errors='ignore')
                        
                        relative_path = js_file.relative_to(downloads_path)
                        output_dir = analysis_path / relative_path.parent / js_file.stem
                        
                        deobfuscator.deobfuscate_and_analyze(js_code, str(output_dir))
                        
                        if self.verbose:
                            print(f"  Processed: {relative_path}")
                    
                    except Exception as e:
                        if self.verbose:
                            print(f"  Error processing {js_file.name}: {e}")
                
                js_time = time.time() - js_start
                if self.verbose:
                    print(f"JavaScript processing completed in {js_time:.2f}s ({len(js_files)} files)")
            else:
                if self.verbose:
                    print("  No JavaScript files found")
        
        # Step 3: Process WASM
        if process_wasm:
            if self.verbose:
                print("\n[3/3] Processing WASM files...")
            
            wasm_start = time.time()
            wasm_files = list(downloads_path.rglob('*.wasm'))
            
            if wasm_files:
                parser = SimpleWatParser()
                temp_wat_dir = Path('temp/wat_converted')
                temp_wat_dir.mkdir(parents=True, exist_ok=True)
                
                processed = 0
                for wasm_file in wasm_files:
                    try:
                        relative_path = wasm_file.relative_to(downloads_path)
                        wat_file = temp_wat_dir / relative_path.with_suffix('.wat')
                        wat_file.parent.mkdir(parents=True, exist_ok=True)
                        
                        parser.run_wasm2wat(wasm_file, wat_file)
                        
                        wat_text = parser.read_text(wat_file)
                        ast = parser.parse_wat_to_clean_ast(wat_text)
                        
                        output_dir = analysis_path / relative_path.parent / 'clean_ast'
                        output_dir.mkdir(parents=True, exist_ok=True)
                        
                        ast_file = output_dir / f"{wasm_file.stem}.json"
                        import json
                        ast_file.write_text(json.dumps(ast, indent=2, ensure_ascii=False), encoding='utf-8')
                        
                        processed += 1
                        if self.verbose:
                            print(f"  Processed: {relative_path}")
                    
                    except Exception as e:
                        if self.verbose:
                            print(f"  Error processing {wasm_file.name}: {e}")
                
                wasm_time = time.time() - wasm_start
                if self.verbose:
                    print(f"WASM processing completed in {wasm_time:.2f}s ({processed}/{len(wasm_files)} files)")
            else:
                if self.verbose:
                    print("  No WASM files found")
        
        total_time = time.time() - start_time
        
        if self.verbose:
            print(f"\nPipeline completed in {total_time:.2f}s")
            print(f"Results saved to: {analysis_path}")
        
        return {
            'downloads': str(downloads_path),
            'analysis': str(analysis_path),
            'total_time': total_time
        }


def main():
    parser = argparse.ArgumentParser(
        description='Unified pipeline: crawl + process JavaScript + process WASM'
    )
    parser.add_argument('url', help='URL to crawl')
    parser.add_argument('--downloads', '-d', default='downloads', help='Downloads directory')
    parser.add_argument('--analysis', '-a', default='analysis_output', help='Analysis output directory')
    parser.add_argument('--max-pages', '-m', type=int, default=1, help='Maximum pages to crawl')
    parser.add_argument('--skip-js', action='store_true', help='Skip JavaScript processing')
    parser.add_argument('--skip-wasm', action='store_true', help='Skip WASM processing')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    pipeline = Pipeline(verbose=args.verbose)
    
    result = pipeline.run(
        args.url,
        downloads_dir=args.downloads,
        analysis_dir=args.analysis,
        max_pages=args.max_pages,
        process_js=not args.skip_js,
        process_wasm=not args.skip_wasm
    )
    
    if not args.verbose:
        print(f"Pipeline completed. Results: {result['analysis']}")


if __name__ == '__main__':
    main()

