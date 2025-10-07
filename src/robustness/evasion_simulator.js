/**
 * Simulador de Evasões
 * Simula técnicas de evasão (no-ops, reorder, rename) para testar resiliência
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EvasionSimulator {
  constructor(options = {}) {
    this.options = {
      enableNoOps: true,
      enableReorder: true,
      enableRename: true,
      enableControlFlow: true,
      enableDataObfuscation: true,
      enableStringEncoding: true,
      enableDeadCode: true,
      enableJunkCode: true,
      maxIterations: 10,
      complexityLevel: 1,
      ...options
    };
    
    this.evasionTechniques = {
      noOps: [],
      reorder: [],
      rename: [],
      controlFlow: [],
      dataObfuscation: [],
      stringEncoding: [],
      deadCode: [],
      junkCode: []
    };
    
    this.performanceMetrics = {
      simulationTime: 0,
      techniquesApplied: 0,
      successRate: 0,
      resilienceScore: 0
    };
  }

  /**
   * Simula evasões em arquivo JavaScript
   */
  async simulateJSEvasions(inputPath, outputPath, options = {}) {
    const startTime = performance.now();
    
    try {
      console.log(`[EVASION] Simulando evasões JS: ${inputPath}`);
      
      const jsCode = fs.readFileSync(inputPath, 'utf8');
      const evasions = await this.generateJSEvasions(jsCode, options);
      
      // Aplicar evasões
      let modifiedCode = jsCode;
      let techniquesApplied = 0;
      
      for (const evasion of evasions) {
        if (this.shouldApplyEvasion(evasion, options)) {
          modifiedCode = await this.applyJSEvasion(modifiedCode, evasion);
          techniquesApplied++;
        }
      }
      
      // Salvar código modificado
      fs.writeFileSync(outputPath, modifiedCode);
      
      // Salvar relatório de evasões
      const reportPath = outputPath.replace('.js', '.evasion_report.json');
      this.saveEvasionReport(reportPath, {
        inputPath,
        outputPath,
        evasions,
        techniquesApplied,
        timestamp: Date.now()
      });
      
      const endTime = performance.now();
      this.performanceMetrics.simulationTime = endTime - startTime;
      this.performanceMetrics.techniquesApplied = techniquesApplied;
      
      console.log(`[EVASION] Evasões JS aplicadas: ${techniquesApplied} técnicas em ${this.performanceMetrics.simulationTime.toFixed(2)}ms`);
      
      return {
        originalCode: jsCode,
        modifiedCode,
        evasions,
        metrics: this.performanceMetrics
      };
      
    } catch (error) {
      console.error(`[EVASION] Erro na simulação JS ${inputPath}:`, error);
      throw error;
    }
  }

  /**
   * Simula evasões em arquivo WASM
   */
  async simulateWasmEvasions(inputPath, outputPath, options = {}) {
    const startTime = performance.now();
    
    try {
      console.log(`[EVASION] Simulando evasões WASM: ${inputPath}`);
      
      const wasmBuffer = fs.readFileSync(inputPath);
      const evasions = await this.generateWasmEvasions(wasmBuffer, options);
      
      // Aplicar evasões
      let modifiedBuffer = wasmBuffer;
      let techniquesApplied = 0;
      
      for (const evasion of evasions) {
        if (this.shouldApplyEvasion(evasion, options)) {
          modifiedBuffer = await this.applyWasmEvasion(modifiedBuffer, evasion);
          techniquesApplied++;
        }
      }
      
      // Salvar buffer modificado
      fs.writeFileSync(outputPath, modifiedBuffer);
      
      // Salvar relatório de evasões
      const reportPath = outputPath.replace('.wasm', '.evasion_report.json');
      this.saveEvasionReport(reportPath, {
        inputPath,
        outputPath,
        evasions,
        techniquesApplied,
        timestamp: Date.now()
      });
      
      const endTime = performance.now();
      this.performanceMetrics.simulationTime = endTime - startTime;
      this.performanceMetrics.techniquesApplied = techniquesApplied;
      
      console.log(`[EVASION] Evasões WASM aplicadas: ${techniquesApplied} técnicas em ${this.performanceMetrics.simulationTime.toFixed(2)}ms`);
      
      return {
        originalBuffer: wasmBuffer,
        modifiedBuffer,
        evasions,
        metrics: this.performanceMetrics
      };
      
    } catch (error) {
      console.error(`[EVASION] Erro na simulação WASM ${inputPath}:`, error);
      throw error;
    }
  }

  /**
   * Gera evasões para código JavaScript
   */
  async generateJSEvasions(jsCode, options = {}) {
    const evasions = [];
    
    if (this.options.enableNoOps) {
      evasions.push(...this.generateNoOpEvasions(jsCode));
    }
    
    if (this.options.enableReorder) {
      evasions.push(...this.generateReorderEvasions(jsCode));
    }
    
    if (this.options.enableRename) {
      evasions.push(...this.generateRenameEvasions(jsCode));
    }
    
    if (this.options.enableControlFlow) {
      evasions.push(...this.generateControlFlowEvasions(jsCode));
    }
    
    if (this.options.enableDataObfuscation) {
      evasions.push(...this.generateDataObfuscationEvasions(jsCode));
    }
    
    if (this.options.enableStringEncoding) {
      evasions.push(...this.generateStringEncodingEvasions(jsCode));
    }
    
    if (this.options.enableDeadCode) {
      evasions.push(...this.generateDeadCodeEvasions(jsCode));
    }
    
    if (this.options.enableJunkCode) {
      evasions.push(...this.generateJunkCodeEvasions(jsCode));
    }
    
    return evasions;
  }

  /**
   * Gera evasões No-Op
   */
  generateNoOpEvasions(jsCode) {
    const evasions = [];
    const noOpPatterns = [
      /console\.log\(/g,
      /debugger;/g,
      /void\s*\(/g
    ];
    
    noOpPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(jsCode)) !== null) {
        evasions.push({
          type: 'no_op',
          technique: 'remove_debug',
          position: match.index,
          length: match[0].length,
          description: 'Remove declarações de debug'
        });
      }
    });
    
    return evasions;
  }

  /**
   * Gera evasões de reordenação
   */
  generateReorderEvasions(jsCode) {
    const evasions = [];
    
    // Identificar blocos que podem ser reordenados
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(jsCode)) !== null) {
      functions.push({
        name: match[1],
        position: match.index,
        start: match.index,
        end: this.findFunctionEnd(jsCode, match.index)
      });
    }
    
    // Gerar evasões de reordenação para funções
    for (let i = 0; i < functions.length - 1; i++) {
      evasions.push({
        type: 'reorder',
        technique: 'function_reorder',
        position: functions[i].position,
        target: functions[i + 1].position,
        description: `Reordenar função ${functions[i].name} com próxima função`
      });
    }
    
    return evasions;
  }

  /**
   * Gera evasões de renomeação
   */
  generateRenameEvasions(jsCode) {
    const evasions = [];
    
    // Identificar variáveis que podem ser renomeadas
    const varRegex = /(?:var|let|const)\s+(\w+)/g;
    let match;
    
    while ((match = varRegex.exec(jsCode)) !== null) {
      const varName = match[1];
      const newName = this.generateObfuscatedName(varName);
      
      evasions.push({
        type: 'rename',
        technique: 'variable_rename',
        position: match.index,
        oldName: varName,
        newName: newName,
        description: `Renomear variável ${varName} para ${newName}`
      });
    }
    
    return evasions;
  }

  /**
   * Gera evasões de fluxo de controle
   */
  generateControlFlowEvasions(jsCode) {
    const evasions = [];
    
    // Identificar estruturas de controle
    const controlFlowPatterns = [
      { pattern: /if\s*\(/g, type: 'if_statement' },
      { pattern: /for\s*\(/g, type: 'for_loop' },
      { pattern: /while\s*\(/g, type: 'while_loop' },
      { pattern: /switch\s*\(/g, type: 'switch_statement' }
    ];
    
    controlFlowPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(jsCode)) !== null) {
        evasions.push({
          type: 'control_flow',
          technique: 'flatten_control_flow',
          position: match.index,
          controlType: type,
          description: `Achatar estrutura de controle ${type}`
        });
      }
    });
    
    return evasions;
  }

  /**
   * Gera evasões de ofuscação de dados
   */
  generateDataObfuscationEvasions(jsCode) {
    const evasions = [];
    
    // Identificar literais que podem ser ofuscados
    const literalPatterns = [
      { pattern: /(\d+)/g, type: 'numeric_literal' },
      { pattern: /"([^"]+)"/g, type: 'string_literal' },
      { pattern: /'([^']+)'/g, type: 'string_literal' }
    ];
    
    literalPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(jsCode)) !== null) {
        evasions.push({
          type: 'data_obfuscation',
          technique: 'literal_obfuscation',
          position: match.index,
          literalType: type,
          originalValue: match[1],
          description: `Ofuscar literal ${type}: ${match[1]}`
        });
      }
    });
    
    return evasions;
  }

  /**
   * Gera evasões de codificação de strings
   */
  generateStringEncodingEvasions(jsCode) {
    const evasions = [];
    
    // Identificar strings que podem ser codificadas
    const stringRegex = /"([^"]+)"/g;
    let match;
    
    while ((match = stringRegex.exec(jsCode)) !== null) {
      const stringValue = match[1];
      if (stringValue.length > 3) { // Só codificar strings com mais de 3 caracteres
        evasions.push({
          type: 'string_encoding',
          technique: 'base64_encoding',
          position: match.index,
          originalString: stringValue,
          encodedString: Buffer.from(stringValue).toString('base64'),
          description: `Codificar string em base64: ${stringValue}`
        });
      }
    }
    
    return evasions;
  }

  /**
   * Gera evasões de código morto
   */
  generateDeadCodeEvasions(jsCode) {
    const evasions = [];
    
    // Identificar possíveis locais para inserir código morto
    const insertionPoints = this.findDeadCodeInsertionPoints(jsCode);
    
    insertionPoints.forEach(point => {
      evasions.push({
        type: 'dead_code',
        technique: 'insert_unreachable_code',
        position: point.position,
        code: this.generateDeadCode(),
        description: 'Inserir código morto'
      });
    });
    
    return evasions;
  }

  /**
   * Gera evasões de código lixo
   */
  generateJunkCodeEvasions(jsCode) {
    const evasions = [];
    
    // Identificar possíveis locais para inserir código lixo
    const insertionPoints = this.findJunkCodeInsertionPoints(jsCode);
    
    insertionPoints.forEach(point => {
      evasions.push({
        type: 'junk_code',
        technique: 'insert_junk_operations',
        position: point.position,
        code: this.generateJunkCode(),
        description: 'Inserir código lixo'
      });
    });
    
    return evasions;
  }

  /**
   * Gera evasões para código WASM
   */
  async generateWasmEvasions(wasmBuffer, options = {}) {
    const evasions = [];
    
    // Identificar seções que podem ser modificadas
    const sections = this.identifyWasmSections(wasmBuffer);
    
    for (const section of sections) {
      // Evasões de reordenação de instruções
      evasions.push({
        type: 'reorder',
        technique: 'instruction_reorder',
        section: section.id,
        position: section.offset,
        description: 'Reordenar instruções WASM'
      });
      
      // Evasões de inserção de NOPs
      evasions.push({
        type: 'no_op',
        technique: 'insert_nops',
        section: section.id,
        position: section.offset,
        description: 'Inserir instruções NOP'
      });
      
      // Evasões de ofuscação de constantes
      evasions.push({
        type: 'data_obfuscation',
        technique: 'constant_obfuscation',
        section: section.id,
        position: section.offset,
        description: 'Ofuscar constantes WASM'
      });
    }
    
    return evasions;
  }

  /**
   * Aplica evasão JavaScript
   */
  async applyJSEvasion(jsCode, evasion) {
    switch (evasion.type) {
      case 'no_op':
        return this.applyNoOpEvasion(jsCode, evasion);
      
      case 'reorder':
        return this.applyReorderEvasion(jsCode, evasion);
      
      case 'rename':
        return this.applyRenameEvasion(jsCode, evasion);
      
      case 'control_flow':
        return this.applyControlFlowEvasion(jsCode, evasion);
      
      case 'data_obfuscation':
        return this.applyDataObfuscationEvasion(jsCode, evasion);
      
      case 'string_encoding':
        return this.applyStringEncodingEvasion(jsCode, evasion);
      
      case 'dead_code':
        return this.applyDeadCodeEvasion(jsCode, evasion);
      
      case 'junk_code':
        return this.applyJunkCodeEvasion(jsCode, evasion);
      
      default:
        console.warn(`[EVASION] Tipo de evasão não suportado: ${evasion.type}`);
        return jsCode;
    }
  }

  /**
   * Aplica evasão WASM
   */
  async applyWasmEvasion(wasmBuffer, evasion) {
    switch (evasion.type) {
      case 'reorder':
        return this.applyWasmReorderEvasion(wasmBuffer, evasion);
      
      case 'no_op':
        return this.applyWasmNoOpEvasion(wasmBuffer, evasion);
      
      case 'data_obfuscation':
        return this.applyWasmDataObfuscationEvasion(wasmBuffer, evasion);
      
      default:
        console.warn(`[EVASION] Tipo de evasão WASM não suportado: ${evasion.type}`);
        return wasmBuffer;
    }
  }

  /**
   * Implementações específicas de evasões JS
   */
  applyNoOpEvasion(jsCode, evasion) {
    // Remover declarações de debug
    const before = jsCode.substring(0, evasion.position);
    const after = jsCode.substring(evasion.position + evasion.length);
    return before + after;
  }

  applyReorderEvasion(jsCode, evasion) {
    // Implementação simplificada de reordenação
    return jsCode; // Manter original por simplicidade
  }

  applyRenameEvasion(jsCode, evasion) {
    // Renomear variável
    const regex = new RegExp(`\\b${evasion.oldName}\\b`, 'g');
    return jsCode.replace(regex, evasion.newName);
  }

  applyControlFlowEvasion(jsCode, evasion) {
    // Implementação simplificada de achatar fluxo de controle
    return jsCode; // Manter original por simplicidade
  }

  applyDataObfuscationEvasion(jsCode, evasion) {
    // Implementação simplificada de ofuscação de dados
    return jsCode; // Manter original por simplicidade
  }

  applyStringEncodingEvasion(jsCode, evasion) {
    // Codificar string em base64
    const encodedString = `atob("${evasion.encodedString}")`;
    return jsCode.replace(`"${evasion.originalString}"`, encodedString);
  }

  applyDeadCodeEvasion(jsCode, evasion) {
    // Inserir código morto
    const before = jsCode.substring(0, evasion.position);
    const after = jsCode.substring(evasion.position);
    return before + evasion.code + after;
  }

  applyJunkCodeEvasion(jsCode, evasion) {
    // Inserir código lixo
    const before = jsCode.substring(0, evasion.position);
    const after = jsCode.substring(evasion.position);
    return before + evasion.code + after;
  }

  /**
   * Implementações específicas de evasões WASM
   */
  applyWasmReorderEvasion(wasmBuffer, evasion) {
    // Implementação simplificada de reordenação WASM
    return wasmBuffer; // Manter original por simplicidade
  }

  applyWasmNoOpEvasion(wasmBuffer, evasion) {
    // Inserir NOPs WASM
    const nopInstruction = Buffer.from([0x01]); // NOP opcode
    const result = Buffer.alloc(wasmBuffer.length + nopInstruction.length);
    wasmBuffer.copy(result, 0, 0, evasion.position);
    nopInstruction.copy(result, evasion.position);
    wasmBuffer.copy(result, evasion.position + nopInstruction.length, evasion.position);
    return result;
  }

  applyWasmDataObfuscationEvasion(wasmBuffer, evasion) {
    // Implementação simplificada de ofuscação de dados WASM
    return wasmBuffer; // Manter original por simplicidade
  }

  /**
   * Métodos auxiliares
   */
  shouldApplyEvasion(evasion, options) {
    const probability = options.evasionProbability || 0.7;
    return Math.random() < probability;
  }

  findFunctionEnd(jsCode, startPos) {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = startPos; i < jsCode.length; i++) {
      const char = jsCode[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
      } else if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0) return i + 1;
        }
      }
    }
    
    return jsCode.length;
  }

  generateObfuscatedName(originalName) {
    const prefixes = ['_', '__', 'a', 'b', 'c'];
    const suffixes = ['', '_', '1', '2', '3'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const hash = crypto.createHash('md5').update(originalName).digest('hex').substring(0, 8);
    return `${prefix}${hash}${suffix}`;
  }

  findDeadCodeInsertionPoints(jsCode) {
    const points = [];
    
    // Encontrar pontos após ponto e vírgula
    const semicolonRegex = /;/g;
    let match;
    
    while ((match = semicolonRegex.exec(jsCode)) !== null) {
      points.push({
        position: match.index + 1,
        type: 'after_semicolon'
      });
    }
    
    return points.slice(0, 5); // Limitar a 5 pontos
  }

  findJunkCodeInsertionPoints(jsCode) {
    const points = [];
    
    // Encontrar pontos após chaves
    const braceRegex = /}/g;
    let match;
    
    while ((match = braceRegex.exec(jsCode)) !== null) {
      points.push({
        position: match.index + 1,
        type: 'after_brace'
      });
    }
    
    return points.slice(0, 3); // Limitar a 3 pontos
  }

  generateDeadCode() {
    const deadCodeSnippets = [
      'if (false) { console.log("never executed"); }',
      'var _unused = Math.random();',
      'void(0);',
      'true && false;'
    ];
    
    return deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)] + '\n';
  }

  generateJunkCode() {
    const junkCodeSnippets = [
      'var _junk = Date.now(); _junk = _junk * 2; _junk = _junk / 2;',
      'Math.random() + Math.random() - Math.random();',
      'var _temp = [1,2,3]; _temp = _temp.reverse();'
    ];
    
    return junkCodeSnippets[Math.floor(Math.random() * junkCodeSnippets.length)] + '\n';
  }

  identifyWasmSections(wasmBuffer) {
    // Implementação simplificada de identificação de seções WASM
    const sections = [];
    let offset = 8; // Pular magic bytes + version
    
    while (offset < wasmBuffer.length) {
      const sectionId = wasmBuffer.readUInt8(offset);
      const size = this.readLEB128(wasmBuffer, offset + 1);
      
      sections.push({
        id: sectionId,
        offset: offset,
        size: size.value
      });
      
      offset += 1 + size.bytesRead + size.value;
    }
    
    return sections;
  }

  readLEB128(buffer, offset) {
    let result = 0;
    let shift = 0;
    let bytesRead = 0;
    
    while (offset < buffer.length) {
      const byte = buffer.readUInt8(offset++);
      bytesRead++;
      
      result |= (byte & 0x7F) << shift;
      
      if ((byte & 0x80) === 0) {
        break;
      }
      
      shift += 7;
    }
    
    return { value: result, bytesRead };
  }

  saveEvasionReport(reportPath, data) {
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
  }

  /**
   * Calcula score de resiliência
   */
  calculateResilienceScore(originalCode, modifiedCode, evasions) {
    let score = 0;
    
    // Pontos baseados no número de técnicas aplicadas
    score += evasions.length * 10;
    
    // Pontos baseados na diferença de tamanho
    const sizeDiff = Math.abs(modifiedCode.length - originalCode.length);
    score += sizeDiff / 100;
    
    // Pontos baseados na complexidade das evasões
    const complexEvasions = evasions.filter(e => 
      e.type === 'control_flow' || e.type === 'data_obfuscation'
    );
    score += complexEvasions.length * 20;
    
    this.performanceMetrics.resilienceScore = Math.min(score, 100);
    return this.performanceMetrics.resilienceScore;
  }
}

module.exports = { EvasionSimulator };
