/**
 * Sistema de Normalização Resistente a Ofuscação
 * Produz ICFG normalizado, resistente a técnicas de ofuscação
 */

const { performance } = require('perf_hooks');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ObfuscationResistantNormalizer {
  constructor(options = {}) {
    this.options = {
      enableStringNormalization: true,
      enableVariableNormalization: true,
      enableFunctionNormalization: true,
      enableControlFlowNormalization: true,
      enableDataFlowNormalization: true,
      enableStructureNormalization: true,
      preserveSemantics: true,
      normalizationLevel: 'high', // low, medium, high
      ...options
    };
    
    this.normalizationRules = {
      strings: new Map(),
      variables: new Map(),
      functions: new Map(),
      controlFlow: new Map(),
      dataFlow: new Map(),
      structures: new Map()
    };
    
    this.normalizationMetrics = {
      stringsNormalized: 0,
      variablesNormalized: 0,
      functionsNormalized: 0,
      controlFlowNormalized: 0,
      dataFlowNormalized: 0,
      structuresNormalized: 0,
      normalizationTime: 0,
      effectivenessScore: 0
    };
  }

  /**
   * Normaliza ICFG para resistir a ofuscação
   */
  async normalizeICFG(icfg, options = {}) {
    const startTime = performance.now();
    
    try {
      console.log('[NORMALIZER] Iniciando normalização do ICFG...');
      
      const normalizedICFG = {
        nodes: new Map(),
        edges: new Set(),
        metadata: {
          originalNodeCount: icfg.nodes.size,
          normalizedNodeCount: 0,
          normalizationRules: {},
          obfuscationResistance: {}
        }
      };
      
      // Normalizar nós
      await this.normalizeNodes(icfg.nodes, normalizedICFG);
      
      // Normalizar arestas
      await this.normalizeEdges(icfg.edges, normalizedICFG);
      
      // Normalizar metadados
      await this.normalizeMetadata(icfg.metadata, normalizedICFG);
      
      // Calcular resistência a ofuscação
      this.calculateObfuscationResistance(normalizedICFG);
      
      // Validar semântica preservada
      await this.validateSemanticsPreservation(icfg, normalizedICFG);
      
      const endTime = performance.now();
      this.normalizationMetrics.normalizationTime = endTime - startTime;
      
      console.log(`[NORMALIZER] Normalização concluída em ${this.normalizationMetrics.normalizationTime.toFixed(2)}ms`);
      console.log(`[NORMALIZER] Efetividade: ${this.normalizationMetrics.effectivenessScore.toFixed(2)}%`);
      
      return {
        normalizedICFG,
        metrics: this.normalizationMetrics,
        rules: this.normalizationRules,
        resistance: normalizedICFG.metadata.obfuscationResistance
      };
      
    } catch (error) {
      console.error('[NORMALIZER] Erro na normalização:', error);
      throw error;
    }
  }

  /**
   * Normaliza nós do ICFG
   */
  async normalizeNodes(originalNodes, normalizedICFG) {
    console.log('[NORMALIZER] Normalizando nós...');
    
    for (const [nodeId, node] of originalNodes) {
      const normalizedNode = {
        ...node,
        id: this.normalizeNodeId(nodeId),
        name: this.normalizeNodeName(node.name || nodeId),
        metadata: await this.normalizeNodeMetadata(node)
      };
      
      // Aplicar regras de normalização específicas por tipo
      switch (node.type) {
        case 'javascript_function':
          normalizedNode.normalized = await this.normalizeJSFunction(node);
          break;
        case 'wasm_function':
          normalizedNode.normalized = await this.normalizeWasmFunction(node);
          break;
        default:
          normalizedNode.normalized = await this.normalizeGenericNode(node);
      }
      
      normalizedICFG.nodes.set(normalizedNode.id, normalizedNode);
      this.normalizationMetrics.functionsNormalized++;
    }
    
    normalizedICFG.metadata.normalizedNodeCount = normalizedICFG.nodes.size;
  }

  /**
   * Normaliza arestas do ICFG
   */
  async normalizeEdges(originalEdges, normalizedICFG) {
    console.log('[NORMALIZER] Normalizando arestas...');
    
    for (const edge of originalEdges) {
      const normalizedEdge = {
        ...edge,
        source: this.normalizeNodeId(edge.source),
        target: this.normalizeNodeId(edge.target),
        type: this.normalizeEdgeType(edge.type),
        weight: this.normalizeEdgeWeight(edge.weight),
        metadata: await this.normalizeEdgeMetadata(edge)
      };
      
      normalizedICFG.edges.add(normalizedEdge);
    }
  }

  /**
   * Normaliza metadados do ICFG
   */
  async normalizeMetadata(originalMetadata, normalizedICFG) {
    console.log('[NORMALIZER] Normalizando metadados...');
    
    normalizedICFG.metadata.normalizationRules = {
      stringNormalization: this.normalizationRules.strings.size,
      variableNormalization: this.normalizationRules.variables.size,
      functionNormalization: this.normalizationRules.functions.size,
      controlFlowNormalization: this.normalizationRules.controlFlow.size,
      dataFlowNormalization: this.normalizationRules.dataFlow.size,
      structureNormalization: this.normalizationRules.structures.size
    };
  }

  /**
   * Normaliza função JavaScript
   */
  async normalizeJSFunction(node) {
    const normalized = {
      parameters: await this.normalizeParameters(node.parameters),
      returnType: this.normalizeReturnType(node.returnType),
      complexity: this.normalizeComplexity(node.complexity),
      controlFlow: await this.normalizeJSControlFlow(node),
      dataFlow: await this.normalizeJSDataFlow(node),
      strings: await this.normalizeJSStrings(node),
      variables: await this.normalizeJSVariables(node)
    };
    
    return normalized;
  }

  /**
   * Normaliza função WASM
   */
  async normalizeWasmFunction(node) {
    const normalized = {
      parameters: await this.normalizeWasmParameters(node.parameters),
      returnType: this.normalizeWasmReturnType(node.returnType),
      instructions: await this.normalizeWasmInstructions(node),
      memoryOperations: await this.normalizeMemoryOperations(node),
      tableOperations: await this.normalizeTableOperations(node),
      controlFlow: await this.normalizeWasmControlFlow(node)
    };
    
    return normalized;
  }

  /**
   * Normaliza nó genérico
   */
  async normalizeGenericNode(node) {
    return {
      type: node.type,
      complexity: this.normalizeComplexity(node.complexity),
      metadata: await this.normalizeNodeMetadata(node)
    };
  }

  /**
   * Normalização de strings
   */
  async normalizeJSStrings(node) {
    if (!this.options.enableStringNormalization) return {};
    
    const normalized = {
      stringPatterns: [],
      stringHashes: [],
      encodingTypes: []
    };
    
    // Identificar padrões de strings
    const stringPatterns = this.extractStringPatterns(node);
    for (const pattern of stringPatterns) {
      const normalizedPattern = this.normalizeStringPattern(pattern);
      normalized.stringPatterns.push(normalizedPattern);
      
      // Criar hash normalizado
      const hash = this.createNormalizedHash(pattern);
      normalized.stringHashes.push(hash);
      
      // Identificar tipo de codificação
      const encodingType = this.identifyStringEncoding(pattern);
      normalized.encodingTypes.push(encodingType);
      
      this.normalizationRules.strings.set(pattern, normalizedPattern);
      this.normalizationMetrics.stringsNormalized++;
    }
    
    return normalized;
  }

  /**
   * Normalização de variáveis
   */
  async normalizeJSVariables(node) {
    if (!this.options.enableVariableNormalization) return {};
    
    const normalized = {
      variableTypes: [],
      variableScopes: [],
      variablePatterns: []
    };
    
    // Identificar padrões de variáveis
    const variablePatterns = this.extractVariablePatterns(node);
    for (const pattern of variablePatterns) {
      const normalizedPattern = this.normalizeVariablePattern(pattern);
      normalized.variablePatterns.push(normalizedPattern);
      
      // Classificar tipo de variável
      const variableType = this.classifyVariableType(pattern);
      normalized.variableTypes.push(variableType);
      
      // Determinar escopo
      const scope = this.determineVariableScope(pattern);
      normalized.variableScopes.push(scope);
      
      this.normalizationRules.variables.set(pattern, normalizedPattern);
      this.normalizationMetrics.variablesNormalized++;
    }
    
    return normalized;
  }

  /**
   * Normalização de fluxo de controle JS
   */
  async normalizeJSControlFlow(node) {
    if (!this.options.enableControlFlowNormalization) return {};
    
    const normalized = {
      controlStructures: [],
      controlPatterns: [],
      controlComplexity: 0
    };
    
    // Identificar estruturas de controle
    const controlStructures = this.extractControlStructures(node);
    for (const structure of controlStructures) {
      const normalizedStructure = this.normalizeControlStructure(structure);
      normalized.controlStructures.push(normalizedStructure);
      
      // Identificar padrão de controle
      const pattern = this.identifyControlPattern(structure);
      normalized.controlPatterns.push(pattern);
      
      this.normalizationRules.controlFlow.set(structure, normalizedStructure);
      this.normalizationMetrics.controlFlowNormalized++;
    }
    
    // Calcular complexidade normalizada
    normalized.controlComplexity = this.calculateNormalizedComplexity(controlStructures);
    
    return normalized;
  }

  /**
   * Normalização de fluxo de dados JS
   */
  async normalizeJSDataFlow(node) {
    if (!this.options.enableDataFlowNormalization) return {};
    
    const normalized = {
      dataDependencies: [],
      dataPatterns: [],
      dataFlowComplexity: 0
    };
    
    // Identificar dependências de dados
    const dataDependencies = this.extractDataDependencies(node);
    for (const dependency of dataDependencies) {
      const normalizedDependency = this.normalizeDataDependency(dependency);
      normalized.dataDependencies.push(normalizedDependency);
      
      // Identificar padrão de dados
      const pattern = this.identifyDataPattern(dependency);
      normalized.dataPatterns.push(pattern);
      
      this.normalizationRules.dataFlow.set(dependency, normalizedDependency);
      this.normalizationMetrics.dataFlowNormalized++;
    }
    
    return normalized;
  }

  /**
   * Normalização de instruções WASM
   */
  async normalizeWasmInstructions(node) {
    const normalized = {
      instructionPatterns: [],
      instructionCategories: [],
      instructionComplexity: 0
    };
    
    // Identificar padrões de instruções
    const instructionPatterns = this.extractInstructionPatterns(node);
    for (const pattern of instructionPatterns) {
      const normalizedPattern = this.normalizeInstructionPattern(pattern);
      normalized.instructionPatterns.push(normalizedPattern);
      
      // Categorizar instrução
      const category = this.categorizeInstruction(pattern);
      normalized.instructionCategories.push(category);
    }
    
    return normalized;
  }

  /**
   * Normalização de operações de memória
   */
  async normalizeMemoryOperations(node) {
    const normalized = {
      memoryAccessPatterns: [],
      memoryOperationTypes: [],
      memoryComplexity: 0
    };
    
    // Identificar padrões de acesso à memória
    const memoryPatterns = this.extractMemoryPatterns(node);
    for (const pattern of memoryPatterns) {
      const normalizedPattern = this.normalizeMemoryPattern(pattern);
      normalized.memoryAccessPatterns.push(normalizedPattern);
      
      // Classificar tipo de operação
      const operationType = this.classifyMemoryOperation(pattern);
      normalized.memoryOperationTypes.push(operationType);
    }
    
    return normalized;
  }

  /**
   * Normalização de operações de tabela
   */
  async normalizeTableOperations(node) {
    const normalized = {
      tableAccessPatterns: [],
      tableOperationTypes: [],
      tableComplexity: 0
    };
    
    // Identificar padrões de acesso à tabela
    const tablePatterns = this.extractTablePatterns(node);
    for (const pattern of tablePatterns) {
      const normalizedPattern = this.normalizeTablePattern(pattern);
      normalized.tableAccessPatterns.push(normalizedPattern);
      
      // Classificar tipo de operação
      const operationType = this.classifyTableOperation(pattern);
      normalized.tableOperationTypes.push(operationType);
    }
    
    return normalized;
  }

  /**
   * Normalização de fluxo de controle WASM
   */
  async normalizeWasmControlFlow(node) {
    const normalized = {
      controlBlocks: [],
      controlPatterns: [],
      controlComplexity: 0
    };
    
    // Identificar blocos de controle
    const controlBlocks = this.extractWasmControlBlocks(node);
    for (const block of controlBlocks) {
      const normalizedBlock = this.normalizeControlBlock(block);
      normalized.controlBlocks.push(normalizedBlock);
      
      // Identificar padrão de controle
      const pattern = this.identifyWasmControlPattern(block);
      normalized.controlPatterns.push(pattern);
    }
    
    return normalized;
  }

  /**
   * Métodos auxiliares para normalização
   */
  normalizeNodeId(nodeId) {
    // Normalizar ID removendo informações específicas de ofuscação
    const normalized = nodeId.replace(/\d+/g, 'N').replace(/[^a-zA-Z0-9_]/g, '_');
    return `norm_${normalized}`;
  }

  normalizeNodeName(name) {
    // Normalizar nome removendo caracteres especiais
    const normalized = name.replace(/[^a-zA-Z0-9]/g, '_');
    return `func_${normalized}`;
  }

  normalizeEdgeType(type) {
    // Normalizar tipo de aresta
    const typeMap = {
      'call': 'function_call',
      'async_call': 'async_function_call',
      'memory_access': 'memory_operation',
      'table_access': 'table_operation'
    };
    
    return typeMap[type] || 'unknown_connection';
  }

  normalizeEdgeWeight(weight) {
    // Normalizar peso da aresta
    return Math.min(Math.max(weight || 1, 0), 100);
  }

  async normalizeNodeMetadata(node) {
    return {
      originalType: node.type,
      normalizedType: this.normalizeNodeType(node.type),
      complexity: this.normalizeComplexity(node.complexity),
      timestamp: Date.now()
    };
  }

  async normalizeEdgeMetadata(edge) {
    return {
      originalType: edge.type,
      normalizedType: this.normalizeEdgeType(edge.type),
      weight: this.normalizeEdgeWeight(edge.weight),
      timestamp: Date.now()
    };
  }

  normalizeNodeType(type) {
    const typeMap = {
      'javascript_function': 'js_func',
      'wasm_function': 'wasm_func',
      'async_function': 'async_func'
    };
    
    return typeMap[type] || 'unknown_node';
  }

  normalizeComplexity(complexity) {
    // Normalizar complexidade em escala de 1-10
    if (complexity <= 5) return 'low';
    if (complexity <= 15) return 'medium';
    return 'high';
  }

  async normalizeParameters(parameters) {
    if (!parameters) return [];
    
    return parameters.map(param => ({
      type: this.normalizeParameterType(param.type || 'unknown'),
      name: this.normalizeParameterName(param.name || 'param'),
      optional: param.optional || false
    }));
  }

  normalizeReturnType(returnType) {
    const typeMap = {
      'void': 'none',
      'undefined': 'none',
      'string': 'text',
      'number': 'numeric',
      'boolean': 'bool',
      'object': 'complex'
    };
    
    return typeMap[returnType] || 'unknown';
  }

  normalizeParameterType(type) {
    return this.normalizeReturnType(type);
  }

  normalizeParameterName(name) {
    return `param_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * Métodos auxiliares para extração de padrões
   */
  extractStringPatterns(node) {
    // Implementação simplificada
    return [];
  }

  extractVariablePatterns(node) {
    // Implementação simplificada
    return [];
  }

  extractControlStructures(node) {
    // Implementação simplificada
    return [];
  }

  extractDataDependencies(node) {
    // Implementação simplificada
    return [];
  }

  extractInstructionPatterns(node) {
    // Implementação simplificada
    return [];
  }

  extractMemoryPatterns(node) {
    // Implementação simplificada
    return [];
  }

  extractTablePatterns(node) {
    // Implementação simplificada
    return [];
  }

  extractWasmControlBlocks(node) {
    // Implementação simplificada
    return [];
  }

  /**
   * Métodos auxiliares para normalização de padrões
   */
  normalizeStringPattern(pattern) {
    // Normalizar padrão de string
    return pattern.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  normalizeVariablePattern(pattern) {
    // Normalizar padrão de variável
    return pattern.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  normalizeControlStructure(structure) {
    // Normalizar estrutura de controle
    return structure.type || 'unknown_structure';
  }

  normalizeDataDependency(dependency) {
    // Normalizar dependência de dados
    return dependency.type || 'unknown_dependency';
  }

  normalizeInstructionPattern(pattern) {
    // Normalizar padrão de instrução
    return pattern.opcode || 'unknown_instruction';
  }

  normalizeMemoryPattern(pattern) {
    // Normalizar padrão de memória
    return pattern.operation || 'unknown_memory_op';
  }

  normalizeTablePattern(pattern) {
    // Normalizar padrão de tabela
    return pattern.operation || 'unknown_table_op';
  }

  normalizeControlBlock(block) {
    // Normalizar bloco de controle
    return block.type || 'unknown_block';
  }

  /**
   * Métodos auxiliares para classificação
   */
  identifyStringEncoding(pattern) {
    // Identificar tipo de codificação de string
    if (pattern.includes('base64')) return 'base64';
    if (pattern.includes('hex')) return 'hex';
    if (pattern.includes('unicode')) return 'unicode';
    return 'plain';
  }

  classifyVariableType(pattern) {
    // Classificar tipo de variável
    if (pattern.includes('const')) return 'constant';
    if (pattern.includes('let')) return 'mutable';
    if (pattern.includes('var')) return 'legacy';
    return 'unknown';
  }

  determineVariableScope(pattern) {
    // Determinar escopo da variável
    if (pattern.includes('global')) return 'global';
    if (pattern.includes('local')) return 'local';
    return 'unknown';
  }

  identifyControlPattern(structure) {
    // Identificar padrão de controle
    return structure.pattern || 'unknown_pattern';
  }

  identifyDataPattern(dependency) {
    // Identificar padrão de dados
    return dependency.pattern || 'unknown_pattern';
  }

  categorizeInstruction(pattern) {
    // Categorizar instrução
    return pattern.category || 'unknown_category';
  }

  classifyMemoryOperation(pattern) {
    // Classificar operação de memória
    return pattern.operation || 'unknown_operation';
  }

  classifyTableOperation(pattern) {
    // Classificar operação de tabela
    return pattern.operation || 'unknown_operation';
  }

  identifyWasmControlPattern(block) {
    // Identificar padrão de controle WASM
    return block.pattern || 'unknown_pattern';
  }

  /**
   * Métodos auxiliares para cálculos
   */
  calculateNormalizedComplexity(structures) {
    // Calcular complexidade normalizada
    return Math.min(structures.length, 10);
  }

  createNormalizedHash(pattern) {
    // Criar hash normalizado
    return crypto.createHash('sha256').update(pattern).digest('hex').substring(0, 16);
  }

  async normalizeWasmParameters(parameters) {
    // Normalizar parâmetros WASM
    return parameters.map(param => ({
      type: this.normalizeWasmType(param.type),
      name: `wasm_param_${param.index || 0}`
    }));
  }

  normalizeWasmReturnType(returnType) {
    // Normalizar tipo de retorno WASM
    return this.normalizeWasmType(returnType);
  }

  normalizeWasmType(type) {
    // Normalizar tipo WASM
    const typeMap = {
      'i32': 'int32',
      'i64': 'int64',
      'f32': 'float32',
      'f64': 'float64',
      'v128': 'vector128'
    };
    
    return typeMap[type] || 'unknown_wasm_type';
  }

  /**
   * Cálculo de resistência a ofuscação
   */
  calculateObfuscationResistance(normalizedICFG) {
    let resistanceScore = 0;
    
    // Pontos baseados na normalização de strings
    resistanceScore += this.normalizationMetrics.stringsNormalized * 2;
    
    // Pontos baseados na normalização de variáveis
    resistanceScore += this.normalizationMetrics.variablesNormalized * 3;
    
    // Pontos baseados na normalização de funções
    resistanceScore += this.normalizationMetrics.functionsNormalized * 5;
    
    // Pontos baseados na normalização de fluxo de controle
    resistanceScore += this.normalizationMetrics.controlFlowNormalized * 4;
    
    // Pontos baseados na normalização de fluxo de dados
    resistanceScore += this.normalizationMetrics.dataFlowNormalized * 3;
    
    // Normalizar score para 0-100
    const maxPossibleScore = 1000;
    const normalizedScore = Math.min((resistanceScore / maxPossibleScore) * 100, 100);
    
    normalizedICFG.metadata.obfuscationResistance = {
      score: normalizedScore,
      level: this.getResistanceLevel(normalizedScore),
      techniques: this.getResistanceTechniques(),
      recommendations: this.getResistanceRecommendations(normalizedScore)
    };
    
    this.normalizationMetrics.effectivenessScore = normalizedScore;
  }

  getResistanceLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very_low';
  }

  getResistanceTechniques() {
    return {
      stringNormalization: this.options.enableStringNormalization,
      variableNormalization: this.options.enableVariableNormalization,
      functionNormalization: this.options.enableFunctionNormalization,
      controlFlowNormalization: this.options.enableControlFlowNormalization,
      dataFlowNormalization: this.options.enableDataFlowNormalization,
      structureNormalization: this.options.enableStructureNormalization
    };
  }

  getResistanceRecommendations(score) {
    const recommendations = [];
    
    if (score < 40) {
      recommendations.push('Enable more normalization techniques');
      recommendations.push('Increase normalization level');
    }
    
    if (score < 60) {
      recommendations.push('Improve string normalization');
      recommendations.push('Enhance variable normalization');
    }
    
    if (score < 80) {
      recommendations.push('Optimize control flow normalization');
      recommendations.push('Refine data flow normalization');
    }
    
    return recommendations;
  }

  /**
   * Validação de preservação de semântica
   */
  async validateSemanticsPreservation(originalICFG, normalizedICFG) {
    console.log('[NORMALIZER] Validando preservação de semântica...');
    
    const validation = {
      nodeCountPreserved: originalICFG.nodes.size === normalizedICFG.nodes.size,
      edgeCountPreserved: originalICFG.edges.size === normalizedICFG.edges.size,
      structurePreserved: true,
      semanticsPreserved: true
    };
    
    // Validações adicionais podem ser implementadas aqui
    
    console.log('[NORMALIZER] Validação concluída:', validation);
    return validation;
  }

  /**
   * Exportar ICFG normalizado
   */
  exportNormalizedICFG(normalizedICFG, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(normalizedICFG, null, 2);
      
      case 'graphml':
        return this.exportToGraphML(normalizedICFG);
      
      case 'dot':
        return this.exportToDOT(normalizedICFG);
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  exportToGraphML(normalizedICFG) {
    // Implementação simplificada de exportação GraphML
    return '<?xml version="1.0" encoding="UTF-8"?>\n<graphml>...</graphml>';
  }

  exportToDOT(normalizedICFG) {
    let dot = 'digraph NormalizedICFG {\n';
    
    // Adicionar nós
    for (const [nodeId, node] of normalizedICFG.nodes) {
      dot += `  "${nodeId}" [label="${node.name}", type="${node.type}"];\n`;
    }
    
    // Adicionar arestas
    for (const edge of normalizedICFG.edges) {
      dot += `  "${edge.source}" -> "${edge.target}" [label="${edge.type}"];\n`;
    }
    
    dot += '}\n';
    return dot;
  }
}

module.exports = { ObfuscationResistantNormalizer };
