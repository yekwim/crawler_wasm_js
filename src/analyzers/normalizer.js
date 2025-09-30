const fs = require('fs');
const path = require('path');

class CodeNormalizer {
  constructor() {
    this.variableCounter = 0;
    this.functionCounter = 0;
    this.stringMap = new Map();
  }

  // Normalizar código JavaScript
  normalizeJavaScript(content, options = {}) {
    const {
      beautify = true,
      renameVariables = true,
      decodeStrings = true,
      removeDeadCode = true,
      addComments = true
    } = options;

    let normalized = content;

    // 1. Decodificar strings se necessário
    if (decodeStrings) {
      normalized = this.decodeStrings(normalized);
    }

    // 2. Desofuscar arrays de strings
    normalized = this.deobfuscateStringArrays(normalized);

    // 3. Remover código morto
    if (removeDeadCode) {
      normalized = this.removeDeadCode(normalized);
    }

    // 4. Renomear variáveis
    if (renameVariables) {
      normalized = this.renameVariables(normalized);
    }

    // 5. Beautify/formatar código
    if (beautify) {
      normalized = this.beautifyCode(normalized);
    }

    // 6. Adicionar comentários explicativos
    if (addComments) {
      normalized = this.addExplanatoryComments(normalized);
    }

    return normalized;
  }

  // Decodificar strings codificadas
  decodeStrings(content) {
    let decoded = content;

    // Decodificar hex strings (\x41 -> A)
    decoded = decoded.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Decodificar unicode strings (\u0041 -> A)
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Decodificar octal strings (\101 -> A)
    decoded = decoded.replace(/\\([0-7]{1,3})/g, (match, octal) => {
      return String.fromCharCode(parseInt(octal, 8));
    });

    // Decodificar String.fromCharCode
    decoded = decoded.replace(/String\.fromCharCode\s*\(([^)]+)\)/g, (match, codes) => {
      try {
        const charCodes = codes.split(',').map(code => parseInt(code.trim()));
        return charCodes.map(code => String.fromCharCode(code)).join('');
      } catch (e) {
        return match; // Manter original se não conseguir decodificar
      }
    });

    return decoded;
  }

  // Desofuscar arrays de strings
  deobfuscateStringArrays(content) {
    // Encontrar arrays de strings
    const arrayPattern = /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\[([^\]]+)\]/g;
    const stringArrays = new Map();
    
    let match;
    while ((match = arrayPattern.exec(content)) !== null) {
      const arrayName = match[1];
      const arrayContent = match[2];
      
      try {
        // Extrair strings do array
        const strings = this.extractStringsFromArray(arrayContent);
        stringArrays.set(arrayName, strings);
      } catch (e) {
        // Ignorar arrays que não conseguimos processar
      }
    }

    // Substituir referências aos arrays por strings literais
    let deobfuscated = content;
    for (const [arrayName, strings] of stringArrays) {
      // Padrão: arrayName[index]
      const indexPattern = new RegExp(`${arrayName}\\s*\\[\\s*(\\d+)\\s*\\]`, 'g');
      deobfuscated = deobfuscated.replace(indexPattern, (match, index) => {
        const idx = parseInt(index);
        if (idx >= 0 && idx < strings.length) {
          return `"${strings[idx].replace(/"/g, '\\"')}"`;
        }
        return match;
      });
    }

    return deobfuscated;
  }

  // Extrair strings de um array JavaScript
  extractStringsFromArray(arrayContent) {
    const strings = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let i = 0;

    while (i < arrayContent.length) {
      const char = arrayContent[i];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
          current = '';
        } else if (char === ',') {
          // Fim de um elemento
          if (current.trim()) {
            strings.push(current.trim());
            current = '';
          }
        } else if (!/\s/.test(char)) {
          current += char;
        }
      } else {
        if (char === stringChar && arrayContent[i-1] !== '\\') {
          // Fim da string
          strings.push(current);
          current = '';
          inString = false;
        } else if (char === '\\' && i + 1 < arrayContent.length) {
          // Escape sequence
          current += char + arrayContent[i + 1];
          i++; // Pular próximo caractere
        } else {
          current += char;
        }
      }
      
      i++;
    }

    // Adicionar última string se houver
    if (current.trim()) {
      strings.push(current.trim());
    }

    return strings;
  }

  // Remover código morto (implementação básica)
  removeDeadCode(content) {
    // Remover console.log em produção (opcional)
    let cleaned = content.replace(/console\.log\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Remover comentários de debug
    cleaned = cleaned.replace(/\/\*[\s\S]*?debug[\s\S]*?\*\//g, '');
    cleaned = cleaned.replace(/\/\/\s*debug.*$/gm, '');
    
    // Remover linhas vazias excessivas
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return cleaned;
  }

  // Renomear variáveis para nomes mais legíveis
  renameVariables(content) {
    this.variableCounter = 0;
    this.functionCounter = 0;
    const variableMap = new Map();
    const functionMap = new Map();

    // Encontrar e mapear variáveis
    const varPatterns = [
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];

    for (const pattern of varPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];
        if (varName.length <= 2 && !variableMap.has(varName)) {
          variableMap.set(varName, this.generateVariableName());
        }
      }
    }

    // Encontrar e mapear funções
    const funcPatterns = [
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g
    ];

    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const funcName = match[1];
        if (funcName.length <= 2 && !functionMap.has(funcName)) {
          functionMap.set(funcName, this.generateFunctionName());
        }
      }
    }

    // Aplicar renomeações
    let renamed = content;
    
    // Renomear variáveis
    for (const [oldName, newName] of variableMap) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      renamed = renamed.replace(regex, newName);
    }

    // Renomear funções
    for (const [oldName, newName] of functionMap) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      renamed = renamed.replace(regex, newName);
    }

    return renamed;
  }

  // Gerar nome de variável legível
  generateVariableName() {
    const names = [
      'data', 'value', 'result', 'item', 'element', 'object', 'array',
      'string', 'number', 'boolean', 'function', 'callback', 'handler',
      'config', 'options', 'settings', 'params', 'args', 'response',
      'request', 'error', 'success', 'flag', 'status', 'count', 'index'
    ];
    
    const name = names[this.variableCounter % names.length];
    this.variableCounter++;
    return name + (this.variableCounter > names.length ? this.variableCounter : '');
  }

  // Gerar nome de função legível
  generateFunctionName() {
    const names = [
      'init', 'setup', 'process', 'handle', 'execute', 'run', 'start',
      'stop', 'update', 'refresh', 'load', 'save', 'create', 'destroy',
      'validate', 'check', 'verify', 'parse', 'format', 'convert',
      'transform', 'calculate', 'compute', 'generate', 'build', 'make'
    ];
    
    const name = names[this.functionCounter % names.length];
    this.functionCounter++;
    return name + (this.functionCounter > names.length ? this.functionCounter : '');
  }

  // Beautify/formatar código
  beautifyCode(content) {
    let beautified = content;

    // Adicionar quebras de linha após ponto e vírgula
    beautified = beautified.replace(/;(\s*)/g, ';\n$1');

    // Adicionar quebras de linha após chaves de abertura
    beautified = beautified.replace(/\{(\s*)/g, '{\n$1');

    // Adicionar quebras de linha antes de chaves de fechamento
    beautified = beautified.replace(/(\s*)\}/g, '\n$1}');

    // Adicionar quebras de linha após vírgulas em objetos/arrays
    beautified = beautified.replace(/,(\s*)/g, ',\n$1');

    // Adicionar quebras de linha após operadores
    beautified = beautified.replace(/([+\-*/=<>!&|])\s*(\w)/g, '$1\n$2');

    // Indentar código
    beautified = this.indentCode(beautified);

    // Limpar linhas vazias excessivas
    beautified = beautified.replace(/\n\s*\n\s*\n/g, '\n\n');

    return beautified;
  }

  // Indentar código
  indentCode(content) {
    const lines = content.split('\n');
    const indented = [];
    let indentLevel = 0;
    const indentSize = 2;

    for (let line of lines) {
      line = line.trim();
      if (!line) {
        indented.push('');
        continue;
      }

      // Diminuir indentação antes de chaves de fechamento
      if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Adicionar linha com indentação
      indented.push(' '.repeat(indentLevel * indentSize) + line);

      // Aumentar indentação após chaves de abertura
      if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')) {
        indentLevel++;
      }
    }

    return indented.join('\n');
  }

  // Adicionar comentários explicativos
  addExplanatoryComments(content) {
    let commented = content;

    // Adicionar comentário no início
    commented = '/*\n * Código normalizado e desofuscado\n * Gerado automaticamente pelo CodeNormalizer\n */\n\n' + commented;

    // Adicionar comentários em funções complexas
    const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
    commented = commented.replace(functionPattern, (match, funcName) => {
      return `// Função: ${funcName}\n${match}`;
    });

    // Adicionar comentários em loops
    commented = commented.replace(/(for|while|do)\s*\([^)]*\)\s*\{/g, (match, loopType) => {
      return `// ${loopType.toUpperCase()} loop\n${match}`;
    });

    return commented;
  }

  // Normalizar arquivo e salvar
  normalizeFile(inputPath, outputPath, options = {}) {
    try {
      const content = fs.readFileSync(inputPath, 'utf8');
      const normalized = this.normalizeJavaScript(content, options);
      
      // Criar diretório de saída se não existir
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, normalized, 'utf8');
      
      return {
        success: true,
        inputPath,
        outputPath,
        originalSize: content.length,
        normalizedSize: normalized.length,
        compressionRatio: (1 - normalized.length / content.length) * 100
      };
    } catch (error) {
      return {
        success: false,
        inputPath,
        error: error.message
      };
    }
  }

  // Normalizar diretório completo
  normalizeDirectory(inputDir, outputDir, options = {}) {
    const results = {
      success: [],
      failed: [],
      summary: {
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        totalOriginalSize: 0,
        totalNormalizedSize: 0
      }
    };

    try {
      const files = fs.readdirSync(inputDir, { withFileTypes: true });
      
      for (const file of files) {
        const inputPath = path.join(inputDir, file.name);
        
        if (file.isDirectory()) {
          const subDir = path.join(outputDir, file.name);
          const subResults = this.normalizeDirectory(inputPath, subDir, options);
          
          results.success.push(...subResults.success);
          results.failed.push(...subResults.failed);
          
          results.summary.totalFiles += subResults.summary.totalFiles;
          results.summary.successfulFiles += subResults.summary.successfulFiles;
          results.summary.failedFiles += subResults.summary.failedFiles;
          results.summary.totalOriginalSize += subResults.summary.totalOriginalSize;
          results.summary.totalNormalizedSize += subResults.summary.totalNormalizedSize;
        } else if (file.isFile() && path.extname(file.name).toLowerCase() === '.js') {
          const outputPath = path.join(outputDir, file.name);
          const result = this.normalizeFile(inputPath, outputPath, options);
          
          results.summary.totalFiles++;
          
          if (result.success) {
            results.success.push(result);
            results.summary.successfulFiles++;
            results.summary.totalOriginalSize += result.originalSize;
            results.summary.totalNormalizedSize += result.normalizedSize;
          } else {
            results.failed.push(result);
            results.summary.failedFiles++;
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao normalizar diretório ${inputDir}:`, error.message);
    }
    
    return results;
  }

  // Gerar relatório de normalização
  generateNormalizationReport(results) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE NORMALIZAÇÃO DE CÓDIGO');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo
    report.push('RESUMO:');
    report.push(`- Total de arquivos: ${results.summary.totalFiles}`);
    report.push(`- Arquivos processados com sucesso: ${results.summary.successfulFiles}`);
    report.push(`- Arquivos com erro: ${results.summary.failedFiles}`);
    report.push(`- Taxa de sucesso: ${((results.summary.successfulFiles / results.summary.totalFiles) * 100).toFixed(1)}%`);
    report.push('');
    
    if (results.summary.totalOriginalSize > 0) {
      const compressionRatio = (1 - results.summary.totalNormalizedSize / results.summary.totalOriginalSize) * 100;
      report.push(`- Tamanho original: ${(results.summary.totalOriginalSize / 1024).toFixed(2)} KB`);
      report.push(`- Tamanho normalizado: ${(results.summary.totalNormalizedSize / 1024).toFixed(2)} KB`);
      report.push(`- Taxa de compressão: ${compressionRatio.toFixed(1)}%`);
      report.push('');
    }
    
    // Arquivos processados com sucesso
    if (results.success.length > 0) {
      report.push('ARQUIVOS PROCESSADOS COM SUCESSO:');
      report.push('-'.repeat(40));
      
      for (const result of results.success) {
        report.push(`\n${result.inputPath} -> ${result.outputPath}`);
        report.push(`  Tamanho original: ${(result.originalSize / 1024).toFixed(2)} KB`);
        report.push(`  Tamanho normalizado: ${(result.normalizedSize / 1024).toFixed(2)} KB`);
        report.push(`  Compressão: ${result.compressionRatio.toFixed(1)}%`);
      }
    }
    
    // Arquivos com erro
    if (results.failed.length > 0) {
      report.push('\nARQUIVOS COM ERRO:');
      report.push('-'.repeat(40));
      
      for (const result of results.failed) {
        report.push(`\n${result.inputPath}`);
        report.push(`  Erro: ${result.error}`);
      }
    }
    
    return report.join('\n');
  }
}

module.exports = { CodeNormalizer };
