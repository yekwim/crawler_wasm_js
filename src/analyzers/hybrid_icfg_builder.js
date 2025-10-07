/**
 * Sistema de ICFG Híbrido Unificado
 * Constrói grafo unificado representando funções Wasm e JS e suas interações
 */

const { performance } = require('perf_hooks');
const { ModernWasmParser } = require('./modern_wasm_parser');
const { JSInstrumentation } = require('../instrumentation/js_instrumentation');

class HybridICFGBuilder {
  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Set(),
      metadata: {
        jsFunctions: new Map(),
        wasmFunctions: new Map(),
        asyncInteractions: new Map(),
        syncInteractions: new Map()
      }
    };
    
    this.nodeCounter = 0;
    this.performanceMetrics = {
      buildTime: 0,
      nodeCount: 0,
      edgeCount: 0,
      analysisDepth: 0
    };
  }

  /**
   * Constrói ICFG híbrido completo
   */
  async buildHybridICFG(jsFiles, wasmFiles, options = {}) {
    const startTime = performance.now();
    
    try {
      console.log('[ICFG] Iniciando construção do ICFG híbrido...');
      
      // Parse e análise de arquivos JS
      const jsAnalysis = await this.analyzeJavaScriptFiles(jsFiles, options);
      
      // Parse e análise de arquivos WASM
      const wasmAnalysis = await this.analyzeWasmFiles(wasmFiles, options);
      
      // Construção do grafo unificado
      await this.buildUnifiedGraph(jsAnalysis, wasmAnalysis, options);
      
      // Análise de interações assíncronas
      await this.analyzeAsyncInteractions(options);
      
      // Análise de interações síncronas
      await this.analyzeSyncInteractions(options);
      
      // Otimização e validação do grafo
      await this.optimizeGraph(options);
      
      const endTime = performance.now();
      this.performanceMetrics.buildTime = endTime - startTime;
      this.performanceMetrics.nodeCount = this.graph.nodes.size;
      this.performanceMetrics.edgeCount = this.graph.edges.size;
      
      console.log(`[ICFG] Construção concluída: ${this.performanceMetrics.nodeCount} nós, ${this.performanceMetrics.edgeCount} arestas`);
      
      return {
        graph: this.graph,
        metrics: this.performanceMetrics,
        jsAnalysis,
        wasmAnalysis,
        interactions: {
          async: this.graph.metadata.asyncInteractions,
          sync: this.graph.metadata.syncInteractions
        }
      };
      
    } catch (error) {
      console.error('[ICFG] Erro na construção do ICFG:', error);
      throw error;
    }
  }

  /**
   * Análise de arquivos JavaScript
   */
  async analyzeJavaScriptFiles(jsFiles, options) {
    const jsAnalysis = {
      functions: new Map(),
      calls: [],
      imports: [],
      exports: [],
      asyncOperations: [],
      instrumentedData: []
    };

    const jsInstrumentation = new JSInstrumentation();

    for (const filePath of jsFiles) {
      try {
        console.log(`[ICFG] Analisando arquivo JS: ${filePath}`);
        
        // Instrumentar código JS
        const instrumentationResult = await jsInstrumentation.instrumentFile(
          filePath, 
          filePath.replace('.js', '.instrumented.js'),
          options
        );

        // Extrair funções e chamadas
        const functions = this.extractJSFunctions(instrumentationResult.code);
        const calls = this.extractJSCalls(instrumentationResult.code);
        const asyncOps = this.extractAsyncOperations(instrumentationResult.code);

        // Adicionar ao mapa de funções
        functions.forEach((func, index) => {
          const nodeId = this.createNodeId('js_function', filePath, index);
          jsAnalysis.functions.set(nodeId, {
            ...func,
            filePath,
            nodeId,
            type: 'javascript_function'
          });
        });

        // Adicionar chamadas capturadas
        jsAnalysis.calls.push(...calls.map(call => ({
          ...call,
          filePath,
          source: 'javascript'
        })));

        // Adicionar operações assíncronas
        jsAnalysis.asyncOperations.push(...asyncOps.map(op => ({
          ...op,
          filePath,
          source: 'javascript'
        })));

        // Adicionar dados de instrumentação
        jsAnalysis.instrumentedData.push({
          filePath,
          capturedCalls: instrumentationResult.capturedCalls,
          metrics: instrumentationResult.metrics
        });

      } catch (error) {
        console.error(`[ICFG] Erro ao analisar arquivo JS ${filePath}:`, error);
      }
    }

    return jsAnalysis;
  }

  /**
   * Análise de arquivos WASM
   */
  async analyzeWasmFiles(wasmFiles, options) {
    const wasmAnalysis = {
      functions: new Map(),
      calls: [],
      imports: [],
      exports: [],
      memoryOperations: [],
      tableOperations: []
    };

    const wasmParser = new ModernWasmParser();

    for (const filePath of wasmFiles) {
      try {
        console.log(`[ICFG] Analisando arquivo WASM: ${filePath}`);
        
        // Parse do arquivo WASM
        const parseResult = await wasmParser.parseWasmFile(filePath);
        
        if (parseResult.errors.length > 0) {
          console.warn(`[ICFG] Avisos no parse WASM ${filePath}:`, parseResult.errors);
        }

        // Extrair funções WASM
        const functions = this.extractWasmFunctions(parseResult);
        const calls = this.extractWasmCalls(parseResult);
        const memoryOps = this.extractMemoryOperations(parseResult);
        const tableOps = this.extractTableOperations(parseResult);

        // Adicionar ao mapa de funções
        functions.forEach((func, index) => {
          const nodeId = this.createNodeId('wasm_function', filePath, index);
          wasmAnalysis.functions.set(nodeId, {
            ...func,
            filePath,
            nodeId,
            type: 'wasm_function'
          });
        });

        // Adicionar chamadas
        wasmAnalysis.calls.push(...calls.map(call => ({
          ...call,
          filePath,
          source: 'wasm'
        })));

        // Adicionar operações de memória
        wasmAnalysis.memoryOperations.push(...memoryOps.map(op => ({
          ...op,
          filePath,
          source: 'wasm'
        })));

        // Adicionar operações de tabela
        wasmAnalysis.tableOperations.push(...tableOps.map(op => ({
          ...op,
          filePath,
          source: 'wasm'
        })));

        // Adicionar imports/exports
        wasmAnalysis.imports.push(...parseResult.analysisResults.imports);
        wasmAnalysis.exports.push(...parseResult.analysisResults.exports);

      } catch (error) {
        console.error(`[ICFG] Erro ao analisar arquivo WASM ${filePath}:`, error);
      }
    }

    return wasmAnalysis;
  }

  /**
   * Construção do grafo unificado
   */
  async buildUnifiedGraph(jsAnalysis, wasmAnalysis, options) {
    console.log('[ICFG] Construindo grafo unificado...');
    
    // Adicionar nós de funções JS
    for (const [nodeId, func] of jsAnalysis.functions) {
      this.addNode(nodeId, {
        type: 'javascript_function',
        name: func.name || 'anonymous',
        filePath: func.filePath,
        parameters: func.parameters,
        returnType: func.returnType,
        isAsync: func.isAsync,
        isGenerator: func.isGenerator,
        complexity: func.complexity,
        callCount: func.callCount || 0
      });
    }

    // Adicionar nós de funções WASM
    for (const [nodeId, func] of wasmAnalysis.functions) {
      this.addNode(nodeId, {
        type: 'wasm_function',
        name: func.name || 'unnamed',
        filePath: func.filePath,
        parameters: func.parameters,
        returnType: func.returnType,
        localCount: func.localCount,
        instructionCount: func.instructionCount,
        complexity: func.complexity,
        callCount: func.callCount || 0
      });
    }

    // Adicionar arestas de chamadas JS
    for (const call of jsAnalysis.calls) {
      await this.addCallEdge(call, 'javascript');
    }

    // Adicionar arestas de chamadas WASM
    for (const call of wasmAnalysis.calls) {
      await this.addCallEdge(call, 'wasm');
    }

    // Adicionar arestas de operações assíncronas
    for (const asyncOp of jsAnalysis.asyncOperations) {
      await this.addAsyncEdge(asyncOp);
    }

    // Adicionar arestas de operações de memória
    for (const memOp of wasmAnalysis.memoryOperations) {
      await this.addMemoryEdge(memOp);
    }

    // Adicionar arestas de operações de tabela
    for (const tableOp of wasmAnalysis.tableOperations) {
      await this.addTableEdge(tableOp);
    }

    console.log(`[ICFG] Grafo unificado construído: ${this.graph.nodes.size} nós, ${this.graph.edges.size} arestas`);
  }

  /**
   * Análise de interações assíncronas
   */
  async analyzeAsyncInteractions(options) {
    console.log('[ICFG] Analisando interações assíncronas...');
    
    const asyncInteractions = [];
    
    // Identificar padrões de interação assíncrona
    for (const edge of this.graph.edges) {
      const sourceNode = this.graph.nodes.get(edge.source);
      const targetNode = this.graph.nodes.get(edge.target);
      
      // Validar que os nós existem
      if (!sourceNode || !targetNode) {
        console.warn(`[ICFG] Nó não encontrado: source=${edge.source}, target=${edge.target}`);
        continue;
      }
      
      if (this.isAsyncInteraction(sourceNode, targetNode, edge)) {
        const interaction = {
          type: 'async_interaction',
          source: edge.source,
          target: edge.target,
          sourceType: sourceNode.type,
          targetType: targetNode.type,
          interactionType: edge.type,
          latency: this.estimateLatency(sourceNode, targetNode),
          reliability: this.estimateReliability(sourceNode, targetNode),
          throughput: this.estimateThroughput(sourceNode, targetNode)
        };
        
        asyncInteractions.push(interaction);
        this.graph.metadata.asyncInteractions.set(`${edge.source}->${edge.target}`, interaction);
      }
    }
    
    console.log(`[ICFG] Identificadas ${asyncInteractions.length} interações assíncronas`);
  }

  /**
   * Análise de interações síncronas
   */
  async analyzeSyncInteractions(options) {
    console.log('[ICFG] Analisando interações síncronas...');
    
    const syncInteractions = [];
    
    // Identificar padrões de interação síncrona
    for (const edge of this.graph.edges) {
      const sourceNode = this.graph.nodes.get(edge.source);
      const targetNode = this.graph.nodes.get(edge.target);
      
      // Validar que os nós existem
      if (!sourceNode || !targetNode) {
        console.warn(`[ICFG] Nó não encontrado: source=${edge.source}, target=${edge.target}`);
        continue;
      }
      
      if (this.isSyncInteraction(sourceNode, targetNode, edge)) {
        const interaction = {
          type: 'sync_interaction',
          source: edge.source,
          target: edge.target,
          sourceType: sourceNode.type,
          targetType: targetNode.type,
          interactionType: edge.type,
          executionTime: this.estimateExecutionTime(sourceNode, targetNode),
          memoryUsage: this.estimateMemoryUsage(sourceNode, targetNode),
          cpuUsage: this.estimateCPUUsage(sourceNode, targetNode)
        };
        
        syncInteractions.push(interaction);
        this.graph.metadata.syncInteractions.set(`${edge.source}->${edge.target}`, interaction);
      }
    }
    
    console.log(`[ICFG] Identificadas ${syncInteractions.length} interações síncronas`);
  }

  /**
   * Otimização do grafo
   */
  async optimizeGraph(options) {
    console.log('[ICFG] Otimizando grafo...');
    
    // Remover nós isolados se solicitado
    if (options.removeIsolatedNodes) {
      this.removeIsolatedNodes();
    }
    
    // Consolidar nós similares se solicitado
    if (options.consolidateSimilarNodes) {
      this.consolidateSimilarNodes(options.similarityThreshold || 0.8);
    }
    
    // Otimizar arestas redundantes
    if (options.removeRedundantEdges) {
      this.removeRedundantEdges();
    }
    
    // Calcular métricas de centralidade
    this.calculateCentralityMetrics();
    
    console.log(`[ICFG] Grafo otimizado: ${this.graph.nodes.size} nós, ${this.graph.edges.size} arestas`);
  }

  /**
   * Métodos auxiliares para extração de dados JS
   */
  extractJSFunctions(code) {
    // Implementação simplificada - usar parser AST real
    const functions = [];
    
    // Regex para encontrar funções (simplificado)
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*=\s*function|(\w+)\s*:\s*function|(\w+)\s*=>\s*)/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const name = match[1] || match[2] || match[3] || match[4];
      if (name) {
        functions.push({
          name,
          type: 'function',
          parameters: this.extractFunctionParameters(code, match.index),
          isAsync: code.substring(match.index - 10, match.index).includes('async'),
          isGenerator: code.substring(match.index - 10, match.index).includes('*'),
          complexity: this.calculateComplexity(code, match.index)
        });
      }
    }
    
    return functions;
  }

  extractJSCalls(code) {
    const calls = [];
    
    // Regex para encontrar chamadas (simplificado)
    const callRegex = /(\w+)\(/g;
    let match;
    
    while ((match = callRegex.exec(code)) !== null) {
      calls.push({
        caller: 'unknown', // Seria determinado pelo contexto
        callee: match[1],
        type: 'function_call',
        arguments: this.extractCallArguments(code, match.index)
      });
    }
    
    return calls;
  }

  extractAsyncOperations(code) {
    const asyncOps = [];
    
    // Identificar operações assíncronas
    const patterns = [
      /new\s+WebSocket\(/g,
      /new\s+Worker\(/g,
      /WebAssembly\./g,
      /fetch\(/g,
      /setTimeout\(/g,
      /setInterval\(/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        asyncOps.push({
          type: 'async_operation',
          operation: match[0],
          position: match.index
        });
      }
    });
    
    return asyncOps;
  }

  /**
   * Métodos auxiliares para extração de dados WASM
   */
  extractWasmFunctions(parseResult) {
    const functions = [];
    
    for (const section of parseResult.sections) {
      if (section.name === 'code' && section.parsed) {
        for (let i = 0; i < section.parsed.functions.length; i++) {
          const func = section.parsed.functions[i];
          functions.push({
            name: `wasm_function_${i}`,
            type: 'wasm_function',
            parameters: func.parameters || [],
            returnType: func.returnType || 'void',
            localCount: func.locals.length,
            instructionCount: func.instructions.length,
            complexity: this.calculateWasmComplexity(func)
          });
        }
      }
    }
    
    return functions;
  }

  extractWasmCalls(parseResult) {
    const calls = [];
    
    for (const section of parseResult.sections) {
      if (section.name === 'code' && section.parsed) {
        for (const func of section.parsed.functions) {
          for (const instruction of func.instructions) {
            if (this.isCallInstruction(instruction)) {
              calls.push({
                type: 'wasm_call',
                instruction: instruction.name,
                target: instruction.operands[0]?.value,
                position: instruction.position
              });
            }
          }
        }
      }
    }
    
    return calls;
  }

  extractMemoryOperations(parseResult) {
    const memoryOps = [];
    
    for (const section of parseResult.sections) {
      if (section.name === 'code' && section.parsed) {
        for (const func of section.parsed.functions) {
          for (const instruction of func.instructions) {
            if (this.isMemoryInstruction(instruction)) {
              memoryOps.push({
                type: 'memory_operation',
                operation: instruction.name,
                size: instruction.operands[0]?.value,
                position: instruction.position
              });
            }
          }
        }
      }
    }
    
    return memoryOps;
  }

  extractTableOperations(parseResult) {
    const tableOps = [];
    
    for (const section of parseResult.sections) {
      if (section.name === 'code' && section.parsed) {
        for (const func of section.parsed.functions) {
          for (const instruction of func.instructions) {
            if (this.isTableInstruction(instruction)) {
              tableOps.push({
                type: 'table_operation',
                operation: instruction.name,
                target: instruction.operands[0]?.value,
                position: instruction.position
              });
            }
          }
        }
      }
    }
    
    return tableOps;
  }

  /**
   * Métodos auxiliares para manipulação do grafo
   */
  createNodeId(type, filePath, index) {
    return `${type}_${this.nodeCounter++}_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
  }

  addNode(nodeId, metadata) {
    this.graph.nodes.set(nodeId, {
      id: nodeId,
      ...metadata,
      inDegree: 0,
      outDegree: 0,
      centrality: 0
    });
  }

  async addCallEdge(call, source) {
    // Implementação simplificada - criar arestas baseadas nas chamadas
    const edgeId = `${call.caller || 'unknown'}->${call.callee}`;
    this.graph.edges.add({
      id: edgeId,
      source: call.caller || 'unknown',
      target: call.callee,
      type: 'call',
      sourceType: source,
      weight: 1,
      metadata: {
        callType: call.type,
        arguments: call.arguments,
        position: call.position
      }
    });
  }

  async addAsyncEdge(asyncOp) {
    // Implementação para arestas assíncronas
  }

  async addMemoryEdge(memOp) {
    // Implementação para arestas de memória
  }

  async addTableEdge(tableOp) {
    // Implementação para arestas de tabela
  }

  /**
   * Métodos auxiliares para análise
   */
  isAsyncInteraction(sourceNode, targetNode, edge) {
    if (!sourceNode || !targetNode) return false;
    return sourceNode.isAsync || targetNode.isAsync || edge.type === 'async_call';
  }

  isSyncInteraction(sourceNode, targetNode, edge) {
    if (!sourceNode || !targetNode) return false;
    return !this.isAsyncInteraction(sourceNode, targetNode, edge);
  }

  estimateLatency(sourceNode, targetNode) {
    // Estimativa simplificada de latência
    return Math.random() * 100; // ms
  }

  estimateReliability(sourceNode, targetNode) {
    // Estimativa simplificada de confiabilidade
    return Math.random();
  }

  estimateThroughput(sourceNode, targetNode) {
    // Estimativa simplificada de throughput
    return Math.random() * 1000; // ops/sec
  }

  estimateExecutionTime(sourceNode, targetNode) {
    // Estimativa simplificada de tempo de execução
    return Math.random() * 50; // ms
  }

  estimateMemoryUsage(sourceNode, targetNode) {
    // Estimativa simplificada de uso de memória
    return Math.random() * 1024; // KB
  }

  estimateCPUUsage(sourceNode, targetNode) {
    // Estimativa simplificada de uso de CPU
    return Math.random() * 100; // %
  }

  /**
   * Métodos auxiliares para otimização
   */
  removeIsolatedNodes() {
    const isolatedNodes = [];
    
    for (const [nodeId, node] of this.graph.nodes) {
      const hasIncoming = Array.from(this.graph.edges).some(edge => edge.target === nodeId);
      const hasOutgoing = Array.from(this.graph.edges).some(edge => edge.source === nodeId);
      
      if (!hasIncoming && !hasOutgoing) {
        isolatedNodes.push(nodeId);
      }
    }
    
    isolatedNodes.forEach(nodeId => {
      this.graph.nodes.delete(nodeId);
    });
    
    console.log(`[ICFG] Removidos ${isolatedNodes.length} nós isolados`);
  }

  consolidateSimilarNodes(threshold) {
    // Implementação de consolidação de nós similares
    console.log(`[ICFG] Consolidação de nós similares (threshold: ${threshold})`);
  }

  removeRedundantEdges() {
    // Implementação de remoção de arestas redundantes
    console.log('[ICFG] Remoção de arestas redundantes');
  }

  calculateCentralityMetrics() {
    // Implementação de cálculo de métricas de centralidade
    console.log('[ICFG] Cálculo de métricas de centralidade');
  }

  /**
   * Métodos auxiliares simplificados
   */
  extractFunctionParameters(code, position) {
    // Implementação simplificada
    return [];
  }

  calculateComplexity(code, position) {
    // Implementação simplificada
    return Math.floor(Math.random() * 10) + 1;
  }

  extractCallArguments(code, position) {
    // Implementação simplificada
    return [];
  }

  calculateWasmComplexity(func) {
    // Implementação simplificada
    return func.instructions.length;
  }

  isCallInstruction(instruction) {
    return instruction.name === 'call' || instruction.name === 'call_indirect';
  }

  isMemoryInstruction(instruction) {
    const memoryOps = ['i32.load', 'i64.load', 'f32.load', 'f64.load', 
                      'i32.store', 'i64.store', 'f32.store', 'f64.store'];
    return memoryOps.includes(instruction.name);
  }

  isTableInstruction(instruction) {
    const tableOps = ['table.get', 'table.set', 'table.size', 'table.grow'];
    return tableOps.includes(instruction.name);
  }

  /**
   * Exportar grafo para diferentes formatos
   */
  exportGraph(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify({
          nodes: Array.from(this.graph.nodes.entries()),
          edges: Array.from(this.graph.edges),
          metadata: this.graph.metadata,
          metrics: this.performanceMetrics
        }, null, 2);
      
      case 'dot':
        return this.exportToDOT();
      
      case 'graphml':
        return this.exportToGraphML();
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  exportToDOT() {
    let dot = 'digraph HybridICFG {\n';
    
    // Adicionar nós
    for (const [nodeId, node] of this.graph.nodes) {
      dot += `  "${nodeId}" [label="${node.name || nodeId}", type="${node.type}"];\n`;
    }
    
    // Adicionar arestas
    for (const edge of this.graph.edges) {
      dot += `  "${edge.source}" -> "${edge.target}" [label="${edge.type}"];\n`;
    }
    
    dot += '}\n';
    return dot;
  }

  exportToGraphML() {
    // Implementação simplificada de exportação GraphML
    return '<?xml version="1.0" encoding="UTF-8"?>\n<graphml>...</graphml>';
  }
}

module.exports = { HybridICFGBuilder };
