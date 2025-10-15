#!/usr/bin/env python3
"""
Consolidador de Artefatos LLM
Cria um relatório consolidado de todos os artefatos otimizados para análise por LLM
"""

import os
import json
from datetime import datetime
from pathlib import Path

class LLMConsolidator:
    def __init__(self, verbose=False):
        self.verbose = verbose

    def consolidate_artifacts(self, llm_optimized_dir, output_file="llm_consolidated_report.json"):
        """Consolida todos os artefatos otimizados em um relatório único"""
        consolidated = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_artifacts': 0,
                'total_original_size': 0,
                'total_optimized_size': 0,
                'average_compression': 0,
                'domains': {},
                'suspicious_artifacts': [],
                'miner_artifacts': [],
                'crypto_artifacts': []
            },
            'artifacts': []
        }
        
        for root, dirs, files in os.walk(llm_optimized_dir):
            for file in files:
                if file.startswith('metadata_') and file.endswith('.json'):
                    metadata_path = os.path.join(root, file)
                    try:
                        with open(metadata_path, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                        
                        # Extrai informações do caminho
                        relative_path = os.path.relpath(root, llm_optimized_dir)
                        path_parts = relative_path.split(os.sep)
                        domain = path_parts[0] if path_parts else 'unknown'
                        
                        # Adiciona ao consolidado
                        artifact_info = {
                            'domain': domain,
                            'path': relative_path,
                            'original_stats': metadata.get('original_stats', {}),
                            'optimization': metadata.get('optimization', {}),
                            'functions': metadata.get('functions', []),
                            'patterns': metadata.get('patterns', {}),
                            'suspicious_score': self.calculate_suspicious_score(metadata)
                        }
                        
                        consolidated['artifacts'].append(artifact_info)
                        consolidated['summary']['total_artifacts'] += 1
                        
                        # Atualiza estatísticas
                        original_size = metadata.get('original_stats', {}).get('total_chars', 0)
                        optimized_size = len(metadata.get('optimization', {}).get('size_reduction', '0%'))
                        consolidated['summary']['total_original_size'] += original_size
                        consolidated['summary']['total_optimized_size'] += optimized_size
                        
                        # Conta por domínio
                        if domain not in consolidated['summary']['domains']:
                            consolidated['summary']['domains'][domain] = 0
                        consolidated['summary']['domains'][domain] += 1
                        
                        # Classifica artefatos suspeitos
                        if artifact_info['suspicious_score'] > 0.7:
                            consolidated['summary']['suspicious_artifacts'].append({
                                'domain': domain,
                                'path': relative_path,
                                'score': artifact_info['suspicious_score']
                            })
                        
                        # Identifica artefatos de mineradores
                        patterns = metadata.get('patterns', {})
                        if patterns.get('miner_calls') or 'miner' in str(patterns).lower():
                            consolidated['summary']['miner_artifacts'].append({
                                'domain': domain,
                                'path': relative_path,
                                'miner_calls': patterns.get('miner_calls', [])
                            })
                        
                        # Identifica artefatos criptográficos
                        if patterns.get('crypto_functions') or 'crypto' in str(patterns).lower():
                            consolidated['summary']['crypto_artifacts'].append({
                                'domain': domain,
                                'path': relative_path,
                                'crypto_functions': patterns.get('crypto_functions', [])
                            })
                        
                    except Exception as e:
                        if self.verbose:
                            print(f"Erro processando {metadata_path}: {str(e)}")
        
        # Calcula compressão média
        if consolidated['summary']['total_original_size'] > 0:
            consolidated['summary']['average_compression'] = (
                consolidated['summary']['total_optimized_size'] / 
                consolidated['summary']['total_original_size']
            )
        
        # Ordena artefatos por score suspeito
        consolidated['artifacts'].sort(key=lambda x: x['suspicious_score'], reverse=True)
        
        # Salva relatório consolidado
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(consolidated, f, indent=2, ensure_ascii=False)
        
        if self.verbose:
            print(f"Relatório consolidado salvo: {output_file}")
            print(f"Total de artefatos: {consolidated['summary']['total_artifacts']}")
            print(f"Compressão média: {consolidated['summary']['average_compression']:.3f}")
            print(f"Artefatos suspeitos: {len(consolidated['summary']['suspicious_artifacts'])}")
            print(f"Artefatos de mineradores: {len(consolidated['summary']['miner_artifacts'])}")
        
        return consolidated

    def calculate_suspicious_score(self, metadata):
        """Calcula score de suspeita baseado nos padrões detectados"""
        score = 0.0
        patterns = metadata.get('patterns', {})
        
        # Padrões de ofuscação (peso alto)
        if patterns.get('obfuscation_patterns'):
            score += 0.3
        
        # Padrões de mineradores (peso alto)
        if patterns.get('miner_calls'):
            score += 0.4
        
        # Padrões criptográficos (peso médio)
        if patterns.get('crypto_functions'):
            score += 0.2
        
        # Strings suspeitas (peso baixo)
        if patterns.get('suspicious_strings'):
            score += 0.1
        
        # Código minificado (peso baixo)
        if metadata.get('original_stats', {}).get('is_minified'):
            score += 0.1
        
        return min(score, 1.0)

    def generate_llm_summary(self, consolidated_data, output_file="llm_analysis_summary.txt"):
        """Gera um resumo em texto para análise por LLM"""
        summary_lines = []
        
        summary_lines.append("=== RELATÓRIO CONSOLIDADO DE ANÁLISE DE ARTEFATOS ===")
        summary_lines.append(f"Timestamp: {consolidated_data['timestamp']}")
        summary_lines.append("")
        
        # Estatísticas gerais
        summary = consolidated_data['summary']
        summary_lines.append("=== ESTATÍSTICAS GERAIS ===")
        summary_lines.append(f"Total de artefatos: {summary['total_artifacts']}")
        summary_lines.append(f"Tamanho original total: {summary['total_original_size']:,} caracteres")
        summary_lines.append(f"Tamanho otimizado total: {summary['total_optimized_size']:,} caracteres")
        summary_lines.append(f"Compressão média: {summary['average_compression']:.3f}")
        summary_lines.append("")
        
        # Domínios
        summary_lines.append("=== DOMÍNIOS ANALISADOS ===")
        for domain, count in summary['domains'].items():
            summary_lines.append(f"- {domain}: {count} artefatos")
        summary_lines.append("")
        
        # Artefatos suspeitos
        if summary['suspicious_artifacts']:
            summary_lines.append("=== ARTEFATOS SUSPEITOS (Score > 0.7) ===")
            for artifact in summary['suspicious_artifacts'][:10]:  # Top 10
                summary_lines.append(f"- {artifact['domain']}: {artifact['path']} (score: {artifact['score']:.2f})")
            summary_lines.append("")
        
        # Artefatos de mineradores
        if summary['miner_artifacts']:
            summary_lines.append("=== ARTEFATOS DE MINERADORES ===")
            for artifact in summary['miner_artifacts']:
                summary_lines.append(f"- {artifact['domain']}: {artifact['path']}")
                summary_lines.append(f"  Miner calls: {', '.join(artifact['miner_calls'][:5])}")
            summary_lines.append("")
        
        # Artefatos criptográficos
        if summary['crypto_artifacts']:
            summary_lines.append("=== ARTEFATOS CRIPTOGRÁFICOS ===")
            for artifact in summary['crypto_artifacts'][:5]:  # Top 5
                summary_lines.append(f"- {artifact['domain']}: {artifact['path']}")
            summary_lines.append("")
        
        # Top artefatos mais suspeitos
        summary_lines.append("=== TOP 10 ARTEFATOS MAIS SUSPEITOS ===")
        for i, artifact in enumerate(consolidated_data['artifacts'][:10], 1):
            summary_lines.append(f"{i}. {artifact['domain']}: {artifact['path']}")
            summary_lines.append(f"   Score: {artifact['suspicious_score']:.2f}")
            summary_lines.append(f"   Funções: {len(artifact['functions'])}")
            summary_lines.append(f"   Padrões: {len(artifact['patterns'])}")
            summary_lines.append("")
        
        # Salva resumo
        summary_text = '\n'.join(summary_lines)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(summary_text)
        
        if self.verbose:
            print(f"Resumo LLM salvo: {output_file}")
        
        return summary_text

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Consolidador de artefatos LLM')
    parser.add_argument('--input', '-i', default='llm_optimized', help='Diretório de artefatos otimizados')
    parser.add_argument('--output', '-o', default='llm_consolidated', help='Diretório de saída')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída verbosa')
    
    args = parser.parse_args()
    
    consolidator = LLMConsolidator(verbose=args.verbose)
    
    # Cria diretório de saída
    Path(args.output).mkdir(exist_ok=True, parents=True)
    
    # Consolida artefatos
    consolidated = consolidator.consolidate_artifacts(
        args.input, 
        os.path.join(args.output, 'consolidated_report.json')
    )
    
    # Gera resumo para LLM
    consolidator.generate_llm_summary(
        consolidated,
        os.path.join(args.output, 'llm_analysis_summary.txt')
    )
