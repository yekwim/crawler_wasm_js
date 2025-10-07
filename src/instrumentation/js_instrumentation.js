/**
 * Sistema de Instrumentação JavaScript
 * Captura chamadas a WebAssembly, WebWorkers e WebSockets
 */

const { Parser } = require('acorn');
const { generate } = require('escodegen');
const walk = require('acorn-walk');
const fs = require('fs');
const path = require('path');

class JSInstrumentation {
  constructor() {
    this.capturedCalls = [];
    this.performanceMetrics = new Map();
    this.startTime = performance.now();
  }

  /**
   * Instrumenta código JavaScript para capturar chamadas críticas
   */
  instrumentCode(jsCode, options = {}) {
    try {
      const ast = Parser.parse(jsCode, {
        ecmaVersion: 2022,
        sourceType: 'module',
        allowHashBang: true,
        locations: true
      });

      const instrumentedAst = this.transformAST(ast, options);
      const instrumentedCode = generate(instrumentedAst, {
        format: {
          compact: false,
          preserveBlankLines: true
        }
      });

      return {
        code: instrumentedCode,
        capturedCalls: this.capturedCalls,
        metrics: this.getMetrics()
      };
    } catch (error) {
      console.error('Erro na instrumentação JS:', error);
      return {
        code: jsCode,
        capturedCalls: [],
        metrics: this.getMetrics(),
        error: error.message
      };
    }
  }

  /**
   * Transforma AST para adicionar instrumentação
   */
  transformAST(ast, options) {
    const instrumentedNodes = [];
    
    walk.simple(ast, {
      CallExpression: (node) => {
        if (this.isWebAssemblyCall(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebAssembly', node));
        } else if (this.isWebWorkerCall(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebWorker', node));
        } else if (this.isWebSocketCall(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebSocket', node));
        }
      },
      
      NewExpression: (node) => {
        if (this.isWebWorkerConstructor(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebWorker', node));
        } else if (this.isWebSocketConstructor(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebSocket', node));
        }
      },

      MemberExpression: (node) => {
        if (this.isWebAssemblyAccess(node)) {
          instrumentedNodes.push(this.createInstrumentationCall('WebAssembly', node));
        }
      }
    });

    return this.insertInstrumentationNodes(ast, instrumentedNodes);
  }

  /**
   * Verifica se é uma chamada WebAssembly
   */
  isWebAssemblyCall(node) {
    const callee = node.callee;
    
    // WebAssembly.instantiate, WebAssembly.compile, etc.
    if (callee.type === 'MemberExpression') {
      const object = callee.object;
      const property = callee.property;
      
      if (object.type === 'Identifier' && object.name === 'WebAssembly') {
        return ['instantiate', 'compile', 'instantiateStreaming', 'compileStreaming', 'validate']
          .includes(property.name);
      }
    }
    
    // Chamadas diretas a módulos WASM
    if (callee.type === 'Identifier') {
      return this.isWasmModuleIdentifier(callee.name);
    }
    
    return false;
  }

  /**
   * Verifica se é uma chamada WebWorker
   */
  isWebWorkerCall(node) {
    const callee = node.callee;
    
    if (callee.type === 'MemberExpression') {
      const property = callee.property;
      return property.name === 'postMessage' || property.name === 'terminate';
    }
    
    return false;
  }

  /**
   * Verifica se é uma chamada WebSocket
   */
  isWebSocketCall(node) {
    const callee = node.callee;
    
    if (callee.type === 'MemberExpression') {
      const property = callee.property;
      return ['send', 'close', 'addEventListener', 'removeEventListener']
        .includes(property.name);
    }
    
    return false;
  }

  /**
   * Verifica se é construtor WebWorker
   */
  isWebWorkerConstructor(node) {
    return node.callee.type === 'Identifier' && node.callee.name === 'Worker';
  }

  /**
   * Verifica se é construtor WebSocket
   */
  isWebSocketConstructor(node) {
    return node.callee.type === 'Identifier' && node.callee.name === 'WebSocket';
  }

  /**
   * Verifica se é acesso a WebAssembly
   */
  isWebAssemblyAccess(node) {
    if (node.object.type === 'Identifier' && node.object.name === 'WebAssembly') {
      return true;
    }
    
    // Verificar acesso a propriedades de instâncias WASM
    if (node.object.type === 'MemberExpression') {
      return this.isWasmInstanceProperty(node.object);
    }
    
    return false;
  }

  /**
   * Verifica se é propriedade de instância WASM
   */
  isWasmInstanceProperty(node) {
    // Padrões comuns de propriedades WASM
    const wasmProperties = ['exports', 'imports', 'instance'];
    return wasmProperties.some(prop => {
      if (node.property.type === 'Identifier') {
        return node.property.name === prop;
      }
      return false;
    });
  }

  /**
   * Verifica se identificador é módulo WASM
   */
  isWasmModuleIdentifier(name) {
    const wasmPatterns = [
      /wasm/i, /webassembly/i, /\.wasm/i,
      /module/i, /instance/i, /memory/i
    ];
    
    return wasmPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Cria chamada de instrumentação
   */
  createInstrumentationCall(type, originalNode) {
    const callId = this.generateCallId();
    const timestamp = Date.now();
    const performanceTime = performance.now() - this.startTime;
    
    const capturedCall = {
      id: callId,
      type: type,
      timestamp: timestamp,
      performanceTime: performanceTime,
      location: this.getNodeLocation(originalNode),
      arguments: this.extractArguments(originalNode),
      stackTrace: this.getStackTrace()
    };
    
    this.capturedCalls.push(capturedCall);
    
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: '__instrumentation__' },
          property: { type: 'Identifier', name: 'capture' }
        },
        arguments: [
          { type: 'Literal', value: type },
          { type: 'Literal', value: callId },
          { type: 'Literal', value: timestamp }
        ]
      }
    };
  }

  /**
   * Gera ID único para chamada
   */
  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extrai localização do nó
   */
  getNodeLocation(node) {
    if (node.loc) {
      return {
        start: { line: node.loc.start.line, column: node.loc.start.column },
        end: { line: node.loc.end.line, column: node.loc.end.column }
      };
    }
    return null;
  }

  /**
   * Extrai argumentos da chamada
   */
  extractArguments(node) {
    if (node.arguments) {
      return node.arguments.map(arg => {
        if (arg.type === 'Literal') {
          return { type: 'literal', value: arg.value };
        } else if (arg.type === 'Identifier') {
          return { type: 'identifier', name: arg.name };
        } else if (arg.type === 'MemberExpression') {
          return { type: 'member', object: arg.object.name, property: arg.property.name };
        }
        return { type: 'complex', raw: generate(arg) };
      });
    }
    return [];
  }

  /**
   * Obtém stack trace
   */
  getStackTrace() {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2, 8) : [];
  }

  /**
   * Insere nós de instrumentação no AST
   */
  insertInstrumentationNodes(ast, instrumentedNodes) {
    // Implementação simplificada - inserir no início do programa
    if (ast.type === 'Program') {
      const instrumentationCode = this.generateInstrumentationSetup();
      const setupAST = Parser.parse(instrumentationCode);
      
      return {
        ...ast,
        body: [...setupAST.body, ...ast.body, ...instrumentedNodes]
      };
    }
    
    return ast;
  }

  /**
   * Gera código de configuração da instrumentação
   */
  generateInstrumentationSetup() {
    return `
      // Instrumentação automática
      window.__instrumentation__ = {
        capturedCalls: [],
        performanceMetrics: new Map(),
        
        capture: function(type, callId, timestamp) {
          this.capturedCalls.push({
            type: type,
            id: callId,
            timestamp: timestamp,
            performanceTime: performance.now()
          });
          
          // Métricas de performance
          if (!this.performanceMetrics.has(type)) {
            this.performanceMetrics.set(type, []);
          }
          this.performanceMetrics.get(type).push(performance.now());
          
          console.log(\`[INSTRUMENTATION] \${type} call captured: \${callId}\`);
        },
        
        getMetrics: function() {
          const metrics = {};
          for (const [type, times] of this.performanceMetrics) {
            metrics[type] = {
              count: times.length,
              avgTime: times.reduce((a, b) => a + b, 0) / times.length,
              minTime: Math.min(...times),
              maxTime: Math.max(...times)
            };
          }
          return metrics;
        },
        
        getCapturedCalls: function() {
          return this.capturedCalls;
        }
      };
    `;
  }

  /**
   * Obtém métricas de performance
   */
  getMetrics() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    const metrics = {
      totalTime: totalTime,
      capturedCalls: this.capturedCalls.length,
      callsByType: {}
    };
    
    // Agrupar chamadas por tipo
    this.capturedCalls.forEach(call => {
      if (!metrics.callsByType[call.type]) {
        metrics.callsByType[call.type] = 0;
      }
      metrics.callsByType[call.type]++;
    });
    
    return metrics;
  }

  /**
   * Salva dados de instrumentação
   */
  saveInstrumentationData(outputPath, data) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  }

  /**
   * Instrumenta arquivo JavaScript
   */
  async instrumentFile(inputPath, outputPath, options = {}) {
    try {
      const jsCode = fs.readFileSync(inputPath, 'utf8');
      const result = this.instrumentCode(jsCode, options);
      
      // Salvar código instrumentado
      fs.writeFileSync(outputPath, result.code);
      
      // Salvar dados de instrumentação
      const instrumentationPath = outputPath.replace(/\.js$/, '.instrumentation.json');
      this.saveInstrumentationData(instrumentationPath, {
        capturedCalls: result.capturedCalls,
        metrics: result.metrics,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error(`Erro ao instrumentar arquivo ${inputPath}:`, error);
      throw error;
    }
  }
}

module.exports = { JSInstrumentation };
