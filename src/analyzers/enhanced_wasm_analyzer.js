#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class EnhancedWasmAnalyzer {
  constructor() {
    // Padrões de mining em WASM
    this.miningPatterns = {
      // Funções de hash conhecidas para mining
      hashFunctions: [
        'argon2id_hash', 'argon2i_hash', 'argon2d_hash',
        'blake2b_hash', 'blake2s_hash', 'blake3_hash',
        'scrypt_hash', 'pbkdf2_hash', 'bcrypt_hash',
        'cryptonight_hash', 'cryptonight_lite_hash',
        'keccak256', 'keccak512', 'sha3_256', 'sha3_512',
        'double_sha256', 'hash160', 'ripemd160',
        'siphash', 'xxhash', 'fnv1a'
      ],
      
      // Algoritmos de proof-of-work
      powAlgorithms: [
        'proof_of_work', 'pow_verify', 'difficulty_check',
        'target_verify', 'nonce_increment', 'block_hash',
        'mining_verify', 'hash_cash', 'work_verify'
      ],
      
      // Padrões de mining específicos
      miningPatterns: [
        'mining', 'mine', 'miner', 'hashrate', 'difficulty',
        'nonce', 'target', 'block', 'chain', 'coinbase',
        'merkle_root', 'timestamp', 'bits', 'version',
        'prev_hash', 'tx_root', 'state_root'
      ],
      
      // Bibliotecas de crypto conhecidas
      cryptoLibraries: [
        'argon2', 'blake2', 'blake3', 'scrypt', 'pbkdf2',
        'bcrypt', 'cryptonight', 'keccak', 'sha3',
        'openssl', 'libsodium', 'crypto', 'hash'
      ],
      
      // Padrões de memória intensiva (comum em mining)
      memoryIntensive: [
        'memory_grow', 'memory_copy', 'memory_fill',
        'large_buffer', 'scratchpad', 'memory_pool'
      ],
      
      // Padrões de CPU intensivo
      cpuIntensive: [
        'loop_unroll', 'parallel_hash', 'vector_hash',
        'simd_hash', 'avx_hash', 'sse_hash'
      ]
    };
    
    // Padrões de strings suspeitas
    this.suspiciousStrings = [
      'coin', 'bitcoin', 'ethereum', 'monero', 'zcash',
      'mining', 'pool', 'stratum', 'work', 'share',
      'hash', 'nonce', 'difficulty', 'target', 'block'
    ];
  }

  // Analisar ficheiro WASM (.wat)
  async analyzeWasm(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const analysis = {
        filePath,
        content,
        size: content.length,
        lines: content.split('\n').length,
        wasm: this.parseWasmStructure(content),
        semantic: this.analyzeWasmSemantics(content),
        mining: this.detectMiningPatterns(content),
        security: this.analyzeSecurityRisks(content),
        performance: this.analyzePerformancePatterns(content),
        metadata: {
          analyzedAt: new Date().toISOString(),
          language: 'webassembly',
          format: 'wat'
        }
      };

      return analysis;

    } catch (error) {
      return {
        filePath,
        error: error.message,
        wasm: null,
        semantic: null,
        mining: null
      };
    }
  }

  // Parse estrutura WASM
  parseWasmStructure(content) {
    const structure = {
      functions: [],
      imports: [],
      exports: [],
      memory: null,
      tables: [],
      globals: [],
      types: [],
      data: [],
      elements: [],
      start: null,
      customSections: []
    };

    // Extrair funções
    structure.functions = this.extractFunctions(content);
    
    // Extrair imports
    structure.imports = this.extractImports(content);
    
    // Extrair exports
    structure.exports = this.extractExports(content);
    
    // Extrair memória
    structure.memory = this.extractMemory(content);
    
    // Extrair tabelas
    structure.tables = this.extractTables(content);
    
    // Extrair globais
    structure.globals = this.extractGlobals(content);
    
    // Extrair tipos
    structure.types = this.extractTypes(content);
    
    // Extrair dados
    structure.data = this.extractData(content);
    
    // Extrair elementos
    structure.elements = this.extractElements(content);
    
    // Extrair seção start
    structure.start = this.extractStart(content);
    
    // Extrair seções customizadas
    structure.customSections = this.extractCustomSections(content);

    return structure;
  }

  // Extrair funções com análise detalhada
  extractFunctions(content) {
    const functions = [];
    
    // Regex para capturar funções completas
    const funcRegex = /\(func\s+\$?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*(?:\([^)]*\))?\s*([\s\S]*?)(?=\(func|\n\(export|\n\(memory|\n\(table|\n\(global|\n\(data|\n\(element|\n\(start|\n\(module|\n$)/g;
    
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const funcName = match[1];
      const funcBody = match[2];
      
      const funcData = {
        name: funcName,
        parameters: this.extractFunctionParameters(funcBody),
        returnType: this.extractReturnType(funcBody),
        locals: this.extractLocals(funcBody),
        body: funcBody.trim(),
        complexity: this.calculateFunctionComplexity(funcBody),
        instructions: this.extractInstructions(funcBody),
        patterns: this.analyzeFunctionPatterns(funcBody),
        line: this.getLineNumber(content, match.index)
      };
      
      functions.push(funcData);
    }
    
    return functions;
  }

  // Extrair parâmetros de função
  extractFunctionParameters(funcBody) {
    const params = [];
    
    // Procurar por (param ...)
    const paramRegex = /\(param\s+\$?([a-zA-Z_][a-zA-Z0-9_]*)\s*([a-zA-Z0-9_]+)/g;
    let match;
    
    while ((match = paramRegex.exec(funcBody)) !== null) {
      params.push({
        name: match[1],
        type: match[2]
      });
    }
    
    return params;
  }

  // Extrair tipo de retorno
  extractReturnType(funcBody) {
    const resultRegex = /\(result\s+([a-zA-Z0-9_]+)/;
    const match = funcBody.match(resultRegex);
    return match ? match[1] : null;
  }

  // Extrair variáveis locais
  extractLocals(funcBody) {
    const locals = [];
    
    const localRegex = /\(local\s+\$?([a-zA-Z_][a-zA-Z0-9_]*)\s*([a-zA-Z0-9_]+)/g;
    let match;
    
    while ((match = localRegex.exec(funcBody)) !== null) {
      locals.push({
        name: match[1],
        type: match[2]
      });
    }
    
    return locals;
  }

  // Extrair instruções
  extractInstructions(funcBody) {
    const instructions = [];
    
    // Regex para capturar instruções WASM
    const instRegex = /\b([a-zA-Z][a-zA-Z0-9_.]*)\b/g;
    let match;
    
    while ((match = instRegex.exec(funcBody)) !== null) {
      const inst = match[1];
      if (this.isWasmInstruction(inst)) {
        instructions.push(inst);
      }
    }
    
    return instructions;
  }

  // Verificar se é instrução WASM
  isWasmInstruction(inst) {
    const wasmInstructions = [
      'local.get', 'local.set', 'local.tee', 'global.get', 'global.set',
      'i32.load', 'i64.load', 'f32.load', 'f64.load',
      'i32.store', 'i64.store', 'f32.store', 'f64.store',
      'i32.const', 'i64.const', 'f32.const', 'f64.const',
      'i32.add', 'i32.sub', 'i32.mul', 'i32.div',
      'i32.and', 'i32.or', 'i32.xor', 'i32.shl', 'i32.shr',
      'call', 'call_indirect', 'return', 'br', 'br_if',
      'loop', 'block', 'if', 'else', 'end',
      'memory.grow', 'memory.size', 'memory.copy', 'memory.fill',
      'drop', 'select', 'unreachable', 'nop'
    ];
    
    return wasmInstructions.includes(inst) || 
           wasmInstructions.some(wi => inst.startsWith(wi.split('.')[0] + '.'));
  }

  // Calcular complexidade de função
  calculateFunctionComplexity(funcBody) {
    let complexity = 1; // Base complexity
    
    // Contar estruturas de controle
    const controlStructures = [
      'loop', 'block', 'if', 'else', 'br', 'br_if', 'br_table'
    ];
    
    controlStructures.forEach(struct => {
      const regex = new RegExp(`\\b${struct}\\b`, 'g');
      const matches = funcBody.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    // Contar chamadas de função
    const callMatches = funcBody.match(/\bcall\b/g);
    if (callMatches) {
      complexity += callMatches.length * 0.5;
    }
    
    // Contar loops aninhados
    const loopMatches = funcBody.match(/\(loop/g);
    if (loopMatches) {
      complexity += loopMatches.length * 2;
    }
    
    return Math.round(complexity * 10) / 10;
  }

  // Analisar padrões de função
  analyzeFunctionPatterns(funcBody) {
    const patterns = {
      crypto: 0,
      memory: 0,
      loops: 0,
      calls: 0,
      arithmetic: 0
    };
    
    // Padrões de crypto
    this.miningPatterns.hashFunctions.forEach(func => {
      if (funcBody.includes(func)) {
        patterns.crypto++;
      }
    });
    
    // Padrões de memória
    if (funcBody.includes('memory.')) {
      patterns.memory++;
    }
    
    // Padrões de loops
    if (funcBody.includes('loop')) {
      patterns.loops++;
    }
    
    // Padrões de chamadas
    const callMatches = funcBody.match(/\bcall\b/g);
    if (callMatches) {
      patterns.calls = callMatches.length;
    }
    
    // Padrões aritméticos
    const arithMatches = funcBody.match(/\b(add|sub|mul|div|and|or|xor|shl|shr)\b/g);
    if (arithMatches) {
      patterns.arithmetic = arithMatches.length;
    }
    
    return patterns;
  }

  // Extrair imports
  extractImports(content) {
    const imports = [];
    
    const importRegex = /\(import\s+"([^"]+)"\s+"([^"]+)"\s*(?:\(([^)]+)\))?/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        module: match[1],
        name: match[2],
        type: match[3] || 'unknown'
      });
    }
    
    return imports;
  }

  // Extrair exports
  extractExports(content) {
    const exports = [];
    
    const exportRegex = /\(export\s+"([^"]+)"\s*\(([^)]+)\)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: match[2]
      });
    }
    
    return exports;
  }

  // Extrair memória
  extractMemory(content) {
    const memoryRegex = /\(memory\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?(\d+)(?:\s+(\d+))?\)/;
    const match = content.match(memoryRegex);
    
    if (match) {
      return {
        name: match[1] || 'memory',
        initial: parseInt(match[2]),
        maximum: match[3] ? parseInt(match[3]) : null
      };
    }
    
    return null;
  }

  // Extrair tabelas
  extractTables(content) {
    const tables = [];
    
    const tableRegex = /\(table\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?(\d+)(?:\s+(\d+))?\s+([a-zA-Z0-9_]+)\)/g;
    let match;
    
    while ((match = tableRegex.exec(content)) !== null) {
      tables.push({
        name: match[1] || 'table',
        initial: parseInt(match[2]),
        maximum: match[3] ? parseInt(match[3]) : null,
        elementType: match[4]
      });
    }
    
    return tables;
  }

  // Extrair globais
  extractGlobals(content) {
    const globals = [];
    
    const globalRegex = /\(global\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?([a-zA-Z0-9_]+)(?:\s+([^)]+))?\)/g;
    let match;
    
    while ((match = globalRegex.exec(content)) !== null) {
      globals.push({
        name: match[1] || 'global',
        type: match[2],
        init: match[3] || null
      });
    }
    
    return globals;
  }

  // Extrair tipos
  extractTypes(content) {
    const types = [];
    
    const typeRegex = /\(type\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?\(func\s*([^)]*)\)\)/g;
    let match;
    
    while ((match = typeRegex.exec(content)) !== null) {
      types.push({
        name: match[1] || 'type',
        signature: match[2]
      });
    }
    
    return types;
  }

  // Extrair dados
  extractData(content) {
    const data = [];
    
    const dataRegex = /\(data\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?([^)]+)\)/g;
    let match;
    
    while ((match = dataRegex.exec(content)) !== null) {
      data.push({
        name: match[1] || 'data',
        content: match[2]
      });
    }
    
    return data;
  }

  // Extrair elementos
  extractElements(content) {
    const elements = [];
    
    const elementRegex = /\(element\s+(?:\$?([a-zA-Z_][a-zA-Z0-9_]*)\s+)?([^)]+)\)/g;
    let match;
    
    while ((match = elementRegex.exec(content)) !== null) {
      elements.push({
        name: match[1] || 'element',
        content: match[2]
      });
    }
    
    return elements;
  }

  // Extrair start
  extractStart(content) {
    const startRegex = /\(start\s+\$?([a-zA-Z_][a-zA-Z0-9_]*)\)/;
    const match = content.match(startRegex);
    return match ? match[1] : null;
  }

  // Extrair seções customizadas
  extractCustomSections(content) {
    const sections = [];
    
    const sectionRegex = /\(custom\s+"([^"]+)"\s+([^)]+)\)/g;
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      sections.push({
        name: match[1],
        content: match[2]
      });
    }
    
    return sections;
  }

  // Analisar semântica WASM
  analyzeWasmSemantics(content) {
    const semantic = {
      functions: this.extractFunctions(content),
      complexity: this.calculateOverallComplexity(content),
      patterns: this.identifySemanticPatterns(content),
      dependencies: this.extractDependencies(content),
      architecture: this.analyzeArchitecture(content)
    };

    return semantic;
  }

  // Calcular complexidade geral
  calculateOverallComplexity(content) {
    let complexity = 0;
    
    // Contar funções
    const funcMatches = content.match(/\(func/g);
    if (funcMatches) {
      complexity += funcMatches.length;
    }
    
    // Contar loops
    const loopMatches = content.match(/\(loop/g);
    if (loopMatches) {
      complexity += loopMatches.length * 2;
    }
    
    // Contar condicionais
    const ifMatches = content.match(/\(if/g);
    if (ifMatches) {
      complexity += ifMatches.length;
    }
    
    // Contar chamadas
    const callMatches = content.match(/\(call/g);
    if (callMatches) {
      complexity += callMatches.length * 0.5;
    }
    
    return Math.round(complexity * 10) / 10;
  }

  // Identificar padrões semânticos
  identifySemanticPatterns(content) {
    const patterns = {
      crypto: 0,
      memory: 0,
      arithmetic: 0,
      control: 0,
      io: 0
    };
    
    // Padrões de crypto
    this.miningPatterns.hashFunctions.forEach(func => {
      if (content.includes(func)) {
        patterns.crypto++;
      }
    });
    
    // Padrões de memória
    if (content.includes('memory.')) {
      patterns.memory++;
    }
    
    // Padrões aritméticos
    const arithMatches = content.match(/\b(add|sub|mul|div|and|or|xor|shl|shr)\b/g);
    if (arithMatches) {
      patterns.arithmetic = arithMatches.length;
    }
    
    // Padrões de controle
    const controlMatches = content.match(/\(loop|\(if|\(block/g);
    if (controlMatches) {
      patterns.control = controlMatches.length;
    }
    
    // Padrões de I/O
    if (content.includes('import') || content.includes('export')) {
      patterns.io++;
    }
    
    return patterns;
  }

  // Extrair dependências
  extractDependencies(content) {
    const dependencies = new Set();
    
    // Extrair imports
    const importMatches = content.match(/\(import\s+"([^"]+)"/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const module = match.match(/"([^"]+)"/)[1];
        dependencies.add(module);
      });
    }
    
    return Array.from(dependencies);
  }

  // Analisar arquitetura
  analyzeArchitecture(content) {
    const architecture = {
      modular: false,
      functional: false,
      objectOriented: false,
      procedural: false
    };
    
    // Modular se tem muitos imports/exports
    const importCount = (content.match(/\(import/g) || []).length;
    const exportCount = (content.match(/\(export/g) || []).length;
    if (importCount > 5 || exportCount > 5) {
      architecture.modular = true;
    }
    
    // Funcional se tem muitas funções puras
    const funcCount = (content.match(/\(func/g) || []).length;
    const callCount = (content.match(/\(call/g) || []).length;
    if (funcCount > 10 && callCount > funcCount) {
      architecture.functional = true;
    }
    
    // Procedural se tem muitas funções simples
    if (funcCount > 5 && callCount < funcCount * 2) {
      architecture.procedural = true;
    }
    
    return architecture;
  }

  // Detectar padrões de mining
  detectMiningPatterns(content) {
    const mining = {
      detected: false,
      confidence: 0,
      indicators: [],
      algorithms: [],
      patterns: [],
      evidence: []
    };
    
    let score = 0;
    let totalChecks = 0;
    
    // 1. Verificar funções de hash
    const hashScore = this.checkHashFunctions(content, mining);
    score += hashScore;
    totalChecks += 1;
    
    // 2. Verificar algoritmos de PoW
    const powScore = this.checkPowAlgorithms(content, mining);
    score += powScore;
    totalChecks += 1;
    
    // 3. Verificar padrões de mining
    const patternScore = this.checkMiningPatterns(content, mining);
    score += patternScore;
    totalChecks += 1;
    
    // 4. Verificar bibliotecas de crypto
    const libScore = this.checkCryptoLibraries(content, mining);
    score += libScore;
    totalChecks += 1;
    
    // 5. Verificar uso intensivo de memória
    const memScore = this.checkMemoryIntensive(content, mining);
    score += memScore;
    totalChecks += 1;
    
    // 6. Verificar padrões de CPU intensivo
    const cpuScore = this.checkCpuIntensive(content, mining);
    score += cpuScore;
    totalChecks += 1;
    
    // 7. Verificar strings suspeitas
    const stringScore = this.checkSuspiciousStrings(content, mining);
    score += stringScore;
    totalChecks += 1;
    
    // Calcular resultado final
    mining.confidence = totalChecks > 0 ? score / totalChecks : 0;
    mining.detected = mining.confidence >= 0.3;
    
    return mining;
  }

  // Verificar funções de hash
  checkHashFunctions(content, mining) {
    let score = 0;
    
    this.miningPatterns.hashFunctions.forEach(func => {
      if (content.includes(func)) {
        score += 0.5;
        mining.indicators.push(`hash_function: ${func}`);
        mining.algorithms.push(func);
        mining.evidence.push(`${func} function detected - commonly used in mining`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Verificar algoritmos de PoW
  checkPowAlgorithms(content, mining) {
    let score = 0;
    
    this.miningPatterns.powAlgorithms.forEach(algo => {
      if (content.includes(algo)) {
        score += 0.6;
        mining.indicators.push(`pow_algorithm: ${algo}`);
        mining.algorithms.push(algo);
        mining.evidence.push(`${algo} detected - proof-of-work algorithm`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Verificar padrões de mining
  checkMiningPatterns(content, mining) {
    let score = 0;
    
    this.miningPatterns.miningPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        score += 0.2;
        mining.indicators.push(`mining_pattern: ${pattern}`);
        mining.patterns.push(pattern);
        mining.evidence.push(`Mining-related pattern: ${pattern}`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Verificar bibliotecas de crypto
  checkCryptoLibraries(content, mining) {
    let score = 0;
    
    this.miningPatterns.cryptoLibraries.forEach(lib => {
      if (content.includes(lib)) {
        score += 0.3;
        mining.indicators.push(`crypto_library: ${lib}`);
        mining.evidence.push(`Cryptographic library: ${lib}`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Verificar uso intensivo de memória
  checkMemoryIntensive(content, mining) {
    let score = 0;
    
    // Verificar operações de memória
    if (content.includes('memory.grow')) {
      score += 0.3;
      mining.indicators.push('memory_grow');
      mining.evidence.push('Dynamic memory growth detected');
    }
    
    if (content.includes('memory.copy') || content.includes('memory.fill')) {
      score += 0.2;
      mining.indicators.push('memory_operations');
      mining.evidence.push('Intensive memory operations detected');
    }
    
    // Verificar tamanho de memória
    const memoryMatch = content.match(/\(memory\s+\d+\s+(\d+)\)/);
    if (memoryMatch) {
      const maxMemory = parseInt(memoryMatch[1]);
      if (maxMemory > 1024) { // Mais de 1GB
        score += 0.3;
        mining.indicators.push('large_memory');
        mining.evidence.push(`Large memory allocation: ${maxMemory}MB`);
      }
    }
    
    return Math.min(score, 1);
  }

  // Verificar padrões de CPU intensivo
  checkCpuIntensive(content, mining) {
    let score = 0;
    
    // Verificar loops complexos
    const loopCount = (content.match(/\(loop/g) || []).length;
    if (loopCount > 5) {
      score += 0.3;
      mining.indicators.push('complex_loops');
      mining.evidence.push(`Multiple loops detected: ${loopCount}`);
    }
    
    // Verificar operações aritméticas
    const arithCount = (content.match(/\b(add|sub|mul|div|and|or|xor|shl|shr)\b/g) || []).length;
    if (arithCount > 50) {
      score += 0.2;
      mining.indicators.push('intensive_arithmetic');
      mining.evidence.push(`Intensive arithmetic operations: ${arithCount}`);
    }
    
    // Verificar padrões de CPU intensivo
    this.miningPatterns.cpuIntensive.forEach(pattern => {
      if (content.includes(pattern)) {
        score += 0.2;
        mining.indicators.push(`cpu_intensive: ${pattern}`);
        mining.evidence.push(`CPU-intensive pattern: ${pattern}`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Verificar strings suspeitas
  checkSuspiciousStrings(content, mining) {
    let score = 0;
    
    this.suspiciousStrings.forEach(str => {
      if (content.includes(str)) {
        score += 0.1;
        mining.indicators.push(`suspicious_string: ${str}`);
        mining.evidence.push(`Suspicious string: ${str}`);
      }
    });
    
    return Math.min(score, 1);
  }

  // Analisar riscos de segurança
  analyzeSecurityRisks(content) {
    const security = {
      risks: [],
      severity: 'low',
      score: 0
    };
    
    let riskScore = 0;
    
    // Verificar imports suspeitos
    if (content.includes('import "env"')) {
      riskScore += 0.3;
      security.risks.push('environment_import');
    }
    
    // Verificar operações de memória perigosas
    if (content.includes('memory.grow')) {
      riskScore += 0.2;
      security.risks.push('dynamic_memory');
    }
    
    // Verificar chamadas indiretas
    if (content.includes('call_indirect')) {
      riskScore += 0.2;
      security.risks.push('indirect_calls');
    }
    
    // Verificar operações não controladas
    if (content.includes('unreachable')) {
      riskScore += 0.1;
      security.risks.push('unreachable_code');
    }
    
    security.score = riskScore;
    
    if (riskScore >= 0.7) {
      security.severity = 'high';
    } else if (riskScore >= 0.4) {
      security.severity = 'medium';
    }
    
    return security;
  }

  // Analisar padrões de performance
  analyzePerformancePatterns(content) {
    const performance = {
      issues: [],
      score: 0,
      recommendations: []
    };
    
    let perfScore = 0;
    
    // Verificar loops aninhados
    const loopCount = (content.match(/\(loop/g) || []).length;
    if (loopCount > 10) {
      perfScore += 0.3;
      performance.issues.push('excessive_loops');
      performance.recommendations.push('Consider optimizing loop structures');
    }
    
    // Verificar operações de memória custosas
    const memOpsCount = (content.match(/memory\./g) || []).length;
    if (memOpsCount > 100) {
      perfScore += 0.2;
      performance.issues.push('memory_intensive');
      performance.recommendations.push('Optimize memory access patterns');
    }
    
    // Verificar chamadas de função excessivas
    const callCount = (content.match(/\(call/g) || []).length;
    if (callCount > 50) {
      perfScore += 0.2;
      performance.issues.push('excessive_calls');
      performance.recommendations.push('Consider inlining frequently called functions');
    }
    
    performance.score = perfScore;
    
    return performance;
  }

  // Utilitários
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Analisar múltiplos ficheiros WASM
  async analyzeDirectory(dirPath) {
    const results = [];
    const watFiles = this.findWasmFiles(dirPath);
    
    console.log(`🔍 Encontrados ${watFiles.length} ficheiros WASM para análise...`);
    
    for (const file of watFiles) {
      console.log(`📄 Analisando: ${path.basename(file)}`);
      const result = await this.analyzeWasm(file);
      results.push(result);
    }
    
    return {
      files: results,
      summary: {
        totalFiles: results.length,
        successfulAnalyses: results.filter(r => r.wasm !== null).length,
        miningDetected: results.filter(r => r.mining && r.mining.detected).length,
        totalFunctions: results.reduce((sum, r) => sum + (r.wasm ? r.wasm.functions.length : 0), 0),
        totalComplexity: results.reduce((sum, r) => sum + (r.semantic ? r.semantic.complexity : 0), 0)
      }
    };
  }

  // Encontrar ficheiros WASM
  findWasmFiles(dirPath) {
    const files = [];
    
    function traverse(currentDir) {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            traverse(fullPath);
          } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.wat') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao acessar diretório ${currentDir}: ${error.message}`);
      }
    }
    
    traverse(dirPath);
    return files;
  }

  // Gerar relatório de análise WASM
  generateWasmReport(analysis) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE WASM (WEBASSEMBLY)');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo geral
    report.push('RESUMO GERAL:');
    report.push(`- Total de arquivos: ${analysis.summary.totalFiles}`);
    report.push(`- Análises bem-sucedidas: ${analysis.summary.successfulAnalyses}`);
    report.push(`- Mining detectado: ${analysis.summary.miningDetected}`);
    report.push(`- Total de funções: ${analysis.summary.totalFunctions}`);
    report.push(`- Complexidade total: ${analysis.summary.totalComplexity.toFixed(2)}`);
    report.push('');
    
    // Análise detalhada por arquivo
    report.push('ANÁLISE DETALHADA POR ARQUIVO:');
    report.push('-'.repeat(60));
    
    for (const file of analysis.files) {
      report.push(`\n📄 Arquivo: ${path.basename(file.filePath)}`);
      report.push(`   Caminho: ${file.filePath}`);
      report.push(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
      report.push(`   Linhas: ${file.lines}`);
      
      if (file.error) {
        report.push(`   ❌ Erro: ${file.error}`);
        continue;
      }
      
      if (file.wasm) {
        report.push(`   📊 Estrutura WASM:`);
        report.push(`     - Funções: ${file.wasm.functions.length}`);
        report.push(`     - Imports: ${file.wasm.imports.length}`);
        report.push(`     - Exports: ${file.wasm.exports.length}`);
        report.push(`     - Memória: ${file.wasm.memory ? `${file.wasm.memory.initial}MB` : 'N/A'}`);
        
        if (file.wasm.memory && file.wasm.memory.maximum) {
          report.push(`     - Memória máxima: ${file.wasm.memory.maximum}MB`);
        }
      }
      
      if (file.semantic) {
        report.push(`   🧠 Análise Semântica:`);
        report.push(`     - Complexidade: ${file.semantic.complexity}`);
        report.push(`     - Dependências: ${file.semantic.dependencies.length}`);
        report.push(`     - Padrões: Crypto(${file.semantic.patterns.crypto}), Memória(${file.semantic.patterns.memory}), Aritmética(${file.semantic.patterns.arithmetic})`);
      }
      
      if (file.mining) {
        report.push(`   ⛏️ Detecção de Mining:`);
        report.push(`     - Detectado: ${file.mining.detected ? 'SIM' : 'NÃO'}`);
        report.push(`     - Confiança: ${(file.mining.confidence * 100).toFixed(1)}%`);
        report.push(`     - Indicadores: ${file.mining.indicators.length}`);
        report.push(`     - Algoritmos: ${file.mining.algorithms.length}`);
        
        if (file.mining.evidence.length > 0) {
          report.push(`     - Evidências:`);
          file.mining.evidence.slice(0, 3).forEach(evidence => {
            report.push(`       • ${evidence}`);
          });
          if (file.mining.evidence.length > 3) {
            report.push(`       • ... e mais ${file.mining.evidence.length - 3} evidências`);
          }
        }
      }
      
      if (file.security) {
        report.push(`   🔒 Segurança:`);
        report.push(`     - Severidade: ${file.security.severity.toUpperCase()}`);
        report.push(`     - Score: ${(file.security.score * 100).toFixed(1)}%`);
        if (file.security.risks.length > 0) {
          report.push(`     - Riscos: ${file.security.risks.join(', ')}`);
        }
      }
      
      if (file.performance) {
        report.push(`   ⚡ Performance:`);
        report.push(`     - Score: ${(file.performance.score * 100).toFixed(1)}%`);
        if (file.performance.issues.length > 0) {
          report.push(`     - Problemas: ${file.performance.issues.join(', ')}`);
        }
        if (file.performance.recommendations.length > 0) {
          report.push(`     - Recomendações:`);
          file.performance.recommendations.forEach(rec => {
            report.push(`       • ${rec}`);
          });
        }
      }
    }
    
    return report.join('\n');
  }
}

module.exports = { EnhancedWasmAnalyzer };
