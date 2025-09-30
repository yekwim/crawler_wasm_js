const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor() {
    this.obfuscationPatterns = {
      // Padrões de ofuscação comuns
      minified: {
        name: 'Minified Code',
        patterns: [
          /[a-zA-Z_$][a-zA-Z0-9_$]{0,1}\s*[=\(]/g, // Variáveis de 1-2 caracteres
          /function\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*\(/g, // Funções com nomes curtos
          /var\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações var com nomes curtos
          /let\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações let com nomes curtos
          /const\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações const com nomes curtos
        ],
        threshold: 0.3 // 30% das variáveis/funções com nomes curtos
      },
      
      packed: {
        name: 'Packed Code',
        patterns: [
          /eval\s*\(/g, // Uso de eval
          /Function\s*\(/g, // Uso de Function constructor
          /atob\s*\(/g, // Decodificação base64
          /btoa\s*\(/g, // Codificação base64
          /String\.fromCharCode\s*\(/g, // Conversão de códigos de caractere
          /unescape\s*\(/g, // Unescape
          /decodeURIComponent\s*\(/g, // Decodificação URI
        ],
        threshold: 0.1 // 10% de uso dessas funções
      },
      
      encoded: {
        name: 'Encoded Strings',
        patterns: [
          /\\x[0-9a-fA-F]{2}/g, // Hex encoding
          /\\u[0-9a-fA-F]{4}/g, // Unicode encoding
          /\\[0-7]{1,3}/g, // Octal encoding
          /String\.fromCharCode\s*\([^)]+\)/g, // CharCode encoding
        ],
        threshold: 0.2 // 20% de strings codificadas
      },
      
      controlFlow: {
        name: 'Control Flow Obfuscation',
        patterns: [
          /while\s*\(\s*true\s*\)/g, // Loops infinitos
          /for\s*\(\s*;\s*;\s*\)/g, // Loops infinitos
          /switch\s*\([^)]+\)\s*\{[^}]*default[^}]*\}/g, // Switch statements complexos
          /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/g, // Try-catch aninhados
        ],
        threshold: 0.05 // 5% de uso desses padrões
      },
      
      stringArray: {
        name: 'String Array Obfuscation',
        patterns: [
          /var\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\[[^\]]*\]/g, // Arrays de strings
          /\[[^\]]*\]\s*\[[^\]]*\]/g, // Acesso a arrays
          /split\s*\([^)]*\)/g, // Split operations
          /join\s*\([^)]*\)/g, // Join operations
        ],
        threshold: 0.15 // 15% de uso desses padrões
      }
    };
  }

  // Analisar um arquivo JavaScript
  analyzeJavaScript(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = {
        filePath,
        size: content.length,
        lines: content.split('\n').length,
        obfuscation: this.detectObfuscation(content),
        metrics: this.calculateMetrics(content),
        suggestions: []
      };

      // Gerar sugestões baseadas na análise
      analysis.suggestions = this.generateSuggestions(analysis.obfuscation, analysis.metrics);
      
      return analysis;
    } catch (error) {
      return {
        filePath,
        error: error.message,
        obfuscation: {},
        metrics: {},
        suggestions: []
      };
    }
  }

  // Detectar ofuscação no código
  detectObfuscation(content) {
    const results = {};
    
    for (const [type, config] of Object.entries(this.obfuscationPatterns)) {
      let totalMatches = 0;
      let patternCounts = {};
      
      for (const pattern of config.patterns) {
        const matches = content.match(pattern) || [];
        patternCounts[pattern.toString()] = matches.length;
        totalMatches += matches.length;
      }
      
      // Calcular score de ofuscação
      const totalTokens = this.countTokens(content);
      const obfuscationScore = totalTokens > 0 ? totalMatches / totalTokens : 0;
      
      results[type] = {
        detected: obfuscationScore >= config.threshold,
        score: obfuscationScore,
        threshold: config.threshold,
        matches: totalMatches,
        patternCounts,
        confidence: Math.min(obfuscationScore / config.threshold, 1.0)
      };
    }
    
    return results;
  }

  // Calcular métricas do código
  calculateMetrics(content) {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      totalCharacters: content.length,
      averageLineLength: content.length / lines.length,
      commentRatio: this.calculateCommentRatio(content),
      complexity: this.calculateComplexity(content),
      variableNaming: this.analyzeVariableNaming(content),
      functionNaming: this.analyzeFunctionNaming(content)
    };
  }

  // Calcular proporção de comentários
  calculateCommentRatio(content) {
    const commentPatterns = [
      /\/\/.*$/gm, // Comentários de linha única
      /\/\*[\s\S]*?\*\//g // Comentários de bloco
    ];
    
    let commentChars = 0;
    for (const pattern of commentPatterns) {
      const matches = content.match(pattern) || [];
      commentChars += matches.join('').length;
    }
    
    return content.length > 0 ? commentChars / content.length : 0;
  }

  // Calcular complexidade do código
  calculateComplexity(content) {
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /try\s*\{/g,
      /function\s+/g,
      /=>\s*/g
    ];
    
    let complexity = 0;
    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    }
    
    return complexity;
  }

  // Analisar nomenclatura de variáveis
  analyzeVariableNaming(content) {
    const varPatterns = [
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];
    
    const variables = [];
    for (const pattern of varPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        variables.push(match[1]);
      }
    }
    
    const shortNames = variables.filter(name => name.length <= 2);
    const camelCase = variables.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name));
    const snakeCase = variables.filter(name => /^[a-z][a-z0-9_]*$/.test(name));
    
    return {
      total: variables.length,
      shortNames: shortNames.length,
      camelCase: camelCase.length,
      snakeCase: snakeCase.length,
      shortNameRatio: variables.length > 0 ? shortNames.length / variables.length : 0
    };
  }

  // Analisar nomenclatura de funções
  analyzeFunctionNaming(content) {
    const funcPatterns = [
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g
    ];
    
    const functions = [];
    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push(match[1]);
      }
    }
    
    const shortNames = functions.filter(name => name.length <= 2);
    const camelCase = functions.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name));
    
    return {
      total: functions.length,
      shortNames: shortNames.length,
      camelCase: camelCase.length,
      shortNameRatio: functions.length > 0 ? shortNames.length / functions.length : 0
    };
  }

  // Contar tokens no código
  countTokens(content) {
    // Contar palavras, operadores, símbolos
    const tokens = content.match(/\b\w+\b|[^\w\s]/g) || [];
    return tokens.length;
  }

  // Gerar sugestões baseadas na análise
  generateSuggestions(obfuscation, metrics) {
    const suggestions = [];
    
    // Sugestões baseadas em ofuscação detectada
    for (const [type, result] of Object.entries(obfuscation)) {
      if (result.detected) {
        switch (type) {
          case 'minified':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'high',
              message: 'Código minificado detectado. Considere usar um beautifier/pretty-printer.',
              action: 'use_beautifier'
            });
            break;
          case 'packed':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'high',
              message: 'Código empacotado detectado. Pode conter eval() ou Function() perigosos.',
              action: 'analyze_packed_code'
            });
            break;
          case 'encoded':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Strings codificadas detectadas. Considere decodificar para análise.',
              action: 'decode_strings'
            });
            break;
          case 'controlFlow':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'high',
              message: 'Ofuscação de fluxo de controle detectada. Código pode ser malicioso.',
              action: 'analyze_control_flow'
            });
            break;
          case 'stringArray':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Ofuscação de array de strings detectada. Considere reconstruir strings.',
              action: 'reconstruct_strings'
            });
            break;
        }
      }
    }
    
    // Sugestões baseadas em métricas
    if (metrics.variableNaming.shortNameRatio > 0.5) {
      suggestions.push({
        type: 'normalization',
        priority: 'medium',
        message: 'Muitas variáveis com nomes curtos. Considere renomear para melhor legibilidade.',
        action: 'rename_variables'
      });
    }
    
    if (metrics.commentRatio < 0.05) {
      suggestions.push({
        type: 'documentation',
        priority: 'low',
        message: 'Poucos comentários no código. Considere adicionar documentação.',
        action: 'add_comments'
      });
    }
    
    return suggestions;
  }

  // Analisar arquivo WASM
  analyzeWasm(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const analysis = {
        filePath,
        size: buffer.length,
        isWasm: this.isWasmFile(buffer),
        sections: this.analyzeWasmSections(buffer),
        imports: this.analyzeWasmImports(buffer),
        exports: this.analyzeWasmExports(buffer),
        suggestions: []
      };

      // Gerar sugestões para WASM
      analysis.suggestions = this.generateWasmSuggestions(analysis);
      
      return analysis;
    } catch (error) {
      return {
        filePath,
        error: error.message,
        isWasm: false,
        sections: {},
        imports: [],
        exports: [],
        suggestions: []
      };
    }
  }

  // Verificar se é um arquivo WASM válido
  isWasmFile(buffer) {
    return buffer.length >= 4 && 
           buffer[0] === 0x00 && 
           buffer[1] === 0x61 && 
           buffer[2] === 0x73 && 
           buffer[3] === 0x6d;
  }

  // Analisar seções do WASM (implementação básica)
  analyzeWasmSections(buffer) {
    // Implementação básica - em um parser real seria mais complexo
    return {
      magic: buffer.slice(0, 4).toString('hex'),
      version: buffer.slice(4, 8).readUInt32LE(0),
      totalSections: this.countWasmSections(buffer)
    };
  }

  // Contar seções do WASM
  countWasmSections(buffer) {
    let count = 0;
    let offset = 8; // Após magic e version
    
    while (offset < buffer.length) {
      if (offset >= buffer.length) break;
      const sectionId = buffer[offset];
      if (sectionId === 0) break; // End of sections
      count++;
      
      // Ler tamanho da seção
      offset++;
      let sectionSize = 0;
      let shift = 0;
      while (offset < buffer.length) {
        const byte = buffer[offset++];
        sectionSize |= (byte & 0x7F) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }
      
      offset += sectionSize;
    }
    
    return count;
  }

  // Analisar imports do WASM (implementação básica)
  analyzeWasmImports(buffer) {
    // Implementação básica - seria mais complexa em um parser real
    return [];
  }

  // Analisar exports do WASM (implementação básica)
  analyzeWasmExports(buffer) {
    // Implementação básica - seria mais complexa em um parser real
    return [];
  }

  // Gerar sugestões para arquivos WASM
  generateWasmSuggestions(analysis) {
    const suggestions = [];
    
    if (!analysis.isWasm) {
      suggestions.push({
        type: 'error',
        priority: 'high',
        message: 'Arquivo não é um WASM válido.',
        action: 'verify_file_format'
      });
    } else {
      suggestions.push({
        type: 'analysis',
        priority: 'medium',
        message: 'Arquivo WASM válido. Considere usar ferramentas como wasm2wat para análise.',
        action: 'use_wasm_tools'
      });
    }
    
    return suggestions;
  }

  // Analisar diretório completo
  analyzeDirectory(dirPath) {
    const results = {
      javascript: [],
      wasm: [],
      summary: {
        totalFiles: 0,
        obfuscatedFiles: 0,
        totalSize: 0,
        averageComplexity: 0
      }
    };

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          const subResults = this.analyzeDirectory(filePath);
          results.javascript.push(...subResults.javascript);
          results.wasm.push(...subResults.wasm);
        } else if (file.isFile()) {
          const ext = path.extname(file.name).toLowerCase();
          
          if (ext === '.js') {
            const analysis = this.analyzeJavaScript(filePath);
            results.javascript.push(analysis);
            
            // Atualizar resumo
            results.summary.totalFiles++;
            results.summary.totalSize += analysis.size || 0;
            
            if (this.hasObfuscation(analysis.obfuscation)) {
              results.summary.obfuscatedFiles++;
            }
          } else if (ext === '.wasm') {
            const analysis = this.analyzeWasm(filePath);
            results.wasm.push(analysis);
            
            results.summary.totalFiles++;
            results.summary.totalSize += analysis.size || 0;
          }
        }
      }
      
      // Calcular métricas do resumo
      if (results.javascript.length > 0) {
        const totalComplexity = results.javascript.reduce((sum, file) => 
          sum + (file.metrics?.complexity || 0), 0);
        results.summary.averageComplexity = totalComplexity / results.javascript.length;
      }
      
    } catch (error) {
      console.error(`Erro ao analisar diretório ${dirPath}:`, error.message);
    }
    
    return results;
  }

  // Verificar se há ofuscação detectada
  hasObfuscation(obfuscation) {
    return Object.values(obfuscation).some(result => result.detected);
  }

  // Gerar relatório em formato legível
  generateReport(analysis) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE DE CÓDIGO');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo geral
    report.push('RESUMO GERAL:');
    report.push(`- Total de arquivos: ${analysis.summary.totalFiles}`);
    report.push(`- Arquivos ofuscados: ${analysis.summary.obfuscatedFiles}`);
    report.push(`- Tamanho total: ${(analysis.summary.totalSize / 1024).toFixed(2)} KB`);
    report.push(`- Complexidade média: ${analysis.summary.averageComplexity.toFixed(2)}`);
    report.push('');
    
    // Análise de arquivos JavaScript
    if (analysis.javascript.length > 0) {
      report.push('ARQUIVOS JAVASCRIPT:');
      report.push('-'.repeat(40));
      
      for (const file of analysis.javascript) {
        report.push(`\nArquivo: ${file.filePath}`);
        report.push(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
        report.push(`Linhas: ${file.lines}`);
        
        if (file.error) {
          report.push(`ERRO: ${file.error}`);
          continue;
        }
        
        // Mostrar ofuscação detectada
        const obfuscationTypes = Object.entries(file.obfuscation)
          .filter(([_, result]) => result.detected)
          .map(([type, result]) => `${type} (${(result.confidence * 100).toFixed(1)}%)`);
        
        if (obfuscationTypes.length > 0) {
          report.push(`Ofuscação detectada: ${obfuscationTypes.join(', ')}`);
        } else {
          report.push('Nenhuma ofuscação detectada');
        }
        
        // Mostrar métricas importantes
        if (file.metrics) {
          report.push(`Complexidade: ${file.metrics.complexity}`);
          report.push(`Proporção de comentários: ${(file.metrics.commentRatio * 100).toFixed(1)}%`);
          report.push(`Variáveis com nomes curtos: ${(file.metrics.variableNaming.shortNameRatio * 100).toFixed(1)}%`);
        }
        
        // Mostrar sugestões
        if (file.suggestions.length > 0) {
          report.push('Sugestões:');
          for (const suggestion of file.suggestions) {
            report.push(`  - [${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
          }
        }
      }
    }
    
    // Análise de arquivos WASM
    if (analysis.wasm.length > 0) {
      report.push('\nARQUIVOS WASM:');
      report.push('-'.repeat(40));
      
      for (const file of analysis.wasm) {
        report.push(`\nArquivo: ${file.filePath}`);
        report.push(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
        report.push(`É WASM válido: ${file.isWasm ? 'Sim' : 'Não'}`);
        
        if (file.sections) {
          report.push(`Seções: ${file.sections.totalSections}`);
        }
        
        if (file.suggestions.length > 0) {
          report.push('Sugestões:');
          for (const suggestion of file.suggestions) {
            report.push(`  - [${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
          }
        }
      }
    }
    
    return report.join('\n');
  }
}

module.exports = { CodeAnalyzer };
