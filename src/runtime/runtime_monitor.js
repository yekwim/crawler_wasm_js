/**
 * Monitorização Runtime
 * Observa eventos críticos de execução JS + Wasm, reforçando a detecção
 */

const { performance } = require('perf_hooks');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class RuntimeMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableJSMonitoring: true,
      enableWasmMonitoring: true,
      enablePerformanceMonitoring: true,
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      enableWorkerMonitoring: true,
      enableWebSocketMonitoring: true,
      monitoringInterval: 1000, // ms
      maxEventHistory: 10000,
      alertThresholds: {
        cpuUsage: 80, // %
        memoryUsage: 80, // %
        networkRequests: 100, // per minute
        wasmCalls: 1000, // per minute
        suspiciousPatterns: 5 // count
      },
      ...options
    };
    
    this.monitoringData = {
      events: [],
      metrics: {
        jsCalls: 0,
        wasmCalls: 0,
        networkRequests: 0,
        workerCalls: 0,
        websocketConnections: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        performance: {}
      },
      alerts: [],
      suspiciousActivities: []
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.eventHandlers = new Map();
    this.performanceObserver = null;
  }

  /**
   * Inicia monitorização runtime
   */
  async startMonitoring(options = {}) {
    if (this.isMonitoring) {
      console.warn('[RUNTIME-MONITOR] Monitorização já está ativa');
      return;
    }
    
    try {
      console.log('[RUNTIME-MONITOR] Iniciando monitorização runtime...');
      
      this.isMonitoring = true;
      
      // Configurar instrumentação JS
      if (this.options.enableJSMonitoring) {
        await this.setupJSMonitoring();
      }
      
      // Configurar instrumentação WASM
      if (this.options.enableWasmMonitoring) {
        await this.setupWasmMonitoring();
      }
      
      // Configurar monitorização de performance
      if (this.options.enablePerformanceMonitoring) {
        await this.setupPerformanceMonitoring();
      }
      
      // Configurar monitorização de memória
      if (this.options.enableMemoryMonitoring) {
        await this.setupMemoryMonitoring();
      }
      
      // Configurar monitorização de rede
      if (this.options.enableNetworkMonitoring) {
        await this.setupNetworkMonitoring();
      }
      
      // Configurar monitorização de workers
      if (this.options.enableWorkerMonitoring) {
        await this.setupWorkerMonitoring();
      }
      
      // Configurar monitorização de WebSockets
      if (this.options.enableWebSocketMonitoring) {
        await this.setupWebSocketMonitoring();
      }
      
      // Iniciar loop de monitorização
      this.startMonitoringLoop();
      
      console.log('[RUNTIME-MONITOR] Monitorização runtime iniciada');
      
      this.emit('monitoringStarted', {
        timestamp: Date.now(),
        options: this.options
      });
      
    } catch (error) {
      console.error('[RUNTIME-MONITOR] Erro ao iniciar monitorização:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Para monitorização runtime
   */
  async stopMonitoring() {
    if (!this.isMonitoring) {
      console.warn('[RUNTIME-MONITOR] Monitorização não está ativa');
      return;
    }
    
    try {
      console.log('[RUNTIME-MONITOR] Parando monitorização runtime...');
      
      this.isMonitoring = false;
      
      // Parar loop de monitorização
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      // Remover event handlers
      this.removeEventHandlers();
      
      // Parar performance observer
      if (this.performanceObserver) {
        this.performanceObserver.disconnect();
        this.performanceObserver = null;
      }
      
      console.log('[RUNTIME-MONITOR] Monitorização runtime parada');
      
      this.emit('monitoringStopped', {
        timestamp: Date.now(),
        finalMetrics: this.monitoringData.metrics
      });
      
    } catch (error) {
      console.error('[RUNTIME-MONITOR] Erro ao parar monitorização:', error);
      throw error;
    }
  }

  /**
   * Configura monitorização JavaScript
   */
  async setupJSMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização JS...');
    
    // Instrumentar funções críticas
    this.instrumentJSFunctions();
    
    // Monitorar eventos de página
    this.monitorPageEvents();
    
    // Monitorar chamadas de função
    this.monitorFunctionCalls();
  }

  /**
   * Configura monitorização WASM
   */
  async setupWasmMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização WASM...');
    
    // Instrumentar WebAssembly
    this.instrumentWebAssembly();
    
    // Monitorar operações de memória
    this.monitorMemoryOperations();
    
    // Monitorar operações de tabela
    this.monitorTableOperations();
  }

  /**
   * Configura monitorização de performance
   */
  async setupPerformanceMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização de performance...');
    
    // Configurar Performance Observer
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
    
    // Monitorar métricas de performance
    this.monitorPerformanceMetrics();
  }

  /**
   * Configura monitorização de memória
   */
  async setupMemoryMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização de memória...');
    
    // Monitorar uso de memória
    this.monitorMemoryUsage();
    
    // Monitorar vazamentos de memória
    this.monitorMemoryLeaks();
  }

  /**
   * Configura monitorização de rede
   */
  async setupNetworkMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização de rede...');
    
    // Instrumentar fetch
    this.instrumentFetch();
    
    // Instrumentar XMLHttpRequest
    this.instrumentXMLHttpRequest();
    
    // Monitorar requests de rede
    this.monitorNetworkRequests();
  }

  /**
   * Configura monitorização de workers
   */
  async setupWorkerMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização de workers...');
    
    // Instrumentar Web Workers
    this.instrumentWebWorkers();
    
    // Monitorar comunicação com workers
    this.monitorWorkerCommunication();
  }

  /**
   * Configura monitorização de WebSockets
   */
  async setupWebSocketMonitoring() {
    console.log('[RUNTIME-MONITOR] Configurando monitorização de WebSockets...');
    
    // Instrumentar WebSocket
    this.instrumentWebSocket();
    
    // Monitorar conexões WebSocket
    this.monitorWebSocketConnections();
  }

  /**
   * Inicia loop de monitorização
   */
  startMonitoringLoop() {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeSuspiciousActivities();
      this.checkAlertThresholds();
    }, this.options.monitoringInterval);
  }

  /**
   * Coleta métricas de monitorização
   */
  collectMetrics() {
    const timestamp = Date.now();
    
    // Coletar métricas de performance
    if (this.options.enablePerformanceMonitoring) {
      this.collectPerformanceMetrics(timestamp);
    }
    
    // Coletar métricas de memória
    if (this.options.enableMemoryMonitoring) {
      this.collectMemoryMetrics(timestamp);
    }
    
    // Coletar métricas de rede
    if (this.options.enableNetworkMonitoring) {
      this.collectNetworkMetrics(timestamp);
    }
    
    // Emitir evento de métricas coletadas
    this.emit('metricsCollected', {
      timestamp,
      metrics: this.monitoringData.metrics
    });
  }

  /**
   * Analisa atividades suspeitas
   */
  analyzeSuspiciousActivities() {
    const suspiciousActivities = [];
    
    // Analisar padrões de CPU
    if (this.monitoringData.metrics.cpuUsage > this.options.alertThresholds.cpuUsage) {
      suspiciousActivities.push({
        type: 'high_cpu_usage',
        severity: 'high',
        value: this.monitoringData.metrics.cpuUsage,
        threshold: this.options.alertThresholds.cpuUsage,
        timestamp: Date.now()
      });
    }
    
    // Analisar padrões de memória
    if (this.monitoringData.metrics.memoryUsage > this.options.alertThresholds.memoryUsage) {
      suspiciousActivities.push({
        type: 'high_memory_usage',
        severity: 'high',
        value: this.monitoringData.metrics.memoryUsage,
        threshold: this.options.alertThresholds.memoryUsage,
        timestamp: Date.now()
      });
    }
    
    // Analisar padrões de rede
    if (this.monitoringData.metrics.networkRequests > this.options.alertThresholds.networkRequests) {
      suspiciousActivities.push({
        type: 'excessive_network_requests',
        severity: 'medium',
        value: this.monitoringData.metrics.networkRequests,
        threshold: this.options.alertThresholds.networkRequests,
        timestamp: Date.now()
      });
    }
    
    // Analisar padrões WASM
    if (this.monitoringData.metrics.wasmCalls > this.options.alertThresholds.wasmCalls) {
      suspiciousActivities.push({
        type: 'excessive_wasm_calls',
        severity: 'medium',
        value: this.monitoringData.metrics.wasmCalls,
        threshold: this.options.alertThresholds.wasmCalls,
        timestamp: Date.now()
      });
    }
    
    // Adicionar atividades suspeitas
    this.monitoringData.suspiciousActivities.push(...suspiciousActivities);
    
    // Limitar histórico
    if (this.monitoringData.suspiciousActivities.length > this.options.maxEventHistory) {
      this.monitoringData.suspiciousActivities = this.monitoringData.suspiciousActivities.slice(-this.options.maxEventHistory);
    }
    
    // Emitir eventos para atividades suspeitas
    for (const activity of suspiciousActivities) {
      this.emit('suspiciousActivity', activity);
    }
  }

  /**
   * Verifica limites de alerta
   */
  checkAlertThresholds() {
    const alerts = [];
    
    // Verificar limites de CPU
    if (this.monitoringData.metrics.cpuUsage > this.options.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'cpu_threshold_exceeded',
        message: `CPU usage ${this.monitoringData.metrics.cpuUsage}% exceeds threshold ${this.options.alertThresholds.cpuUsage}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }
    
    // Verificar limites de memória
    if (this.monitoringData.metrics.memoryUsage > this.options.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory_threshold_exceeded',
        message: `Memory usage ${this.monitoringData.metrics.memoryUsage}% exceeds threshold ${this.options.alertThresholds.memoryUsage}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }
    
    // Verificar limites de rede
    if (this.monitoringData.metrics.networkRequests > this.options.alertThresholds.networkRequests) {
      alerts.push({
        type: 'network_threshold_exceeded',
        message: `Network requests ${this.monitoringData.metrics.networkRequests} exceed threshold ${this.options.alertThresholds.networkRequests}`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }
    
    // Adicionar alertas
    this.monitoringData.alerts.push(...alerts);
    
    // Limitar histórico de alertas
    if (this.monitoringData.alerts.length > this.options.maxEventHistory) {
      this.monitoringData.alerts = this.monitoringData.alerts.slice(-this.options.maxEventHistory);
    }
    
    // Emitir eventos de alerta
    for (const alert of alerts) {
      this.emit('alert', alert);
    }
  }

  /**
   * Métodos de instrumentação JavaScript
   */
  instrumentJSFunctions() {
    // Instrumentar console.log para detectar debug
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      this.recordEvent('js_console_log', {
        arguments: args,
        timestamp: Date.now(),
        stack: new Error().stack
      });
      return originalConsoleLog.apply(console, args);
    };
    
    // Instrumentar eval para detectar execução dinâmica
    const originalEval = eval;
    window.eval = (code) => {
      this.recordEvent('js_eval', {
        code: code.substring(0, 1000), // Limitar tamanho
        timestamp: Date.now(),
        stack: new Error().stack
      });
      return originalEval(code);
    };
  }

  instrumentWebAssembly() {
    // Instrumentar WebAssembly.instantiate
    const originalInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async (module, importObject) => {
      this.recordEvent('wasm_instantiate', {
        moduleSize: module instanceof ArrayBuffer ? module.byteLength : 'unknown',
        timestamp: Date.now(),
        stack: new Error().stack
      });
      
      this.monitoringData.metrics.wasmCalls++;
      return originalInstantiate(module, importObject);
    };
    
    // Instrumentar WebAssembly.compile
    const originalCompile = WebAssembly.compile;
    WebAssembly.compile = async (module) => {
      this.recordEvent('wasm_compile', {
        moduleSize: module instanceof ArrayBuffer ? module.byteLength : 'unknown',
        timestamp: Date.now(),
        stack: new Error().stack
      });
      
      this.monitoringData.metrics.wasmCalls++;
      return originalCompile(module);
    };
  }

  instrumentFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      this.recordEvent('network_fetch', {
        url: url,
        method: options?.method || 'GET',
        timestamp: Date.now()
      });
      
      this.monitoringData.metrics.networkRequests++;
      return originalFetch(url, options);
    };
  }

  instrumentXMLHttpRequest() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._monitoredUrl = url;
      this._monitoredMethod = method;
      return originalOpen.call(this, method, url, async, user, password);
    };
    
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data) {
      this.recordEvent('network_xhr', {
        url: this._monitoredUrl,
        method: this._monitoredMethod,
        timestamp: Date.now()
      });
      
      this.monitoringData.metrics.networkRequests++;
      return originalSend.call(this, data);
    };
  }

  instrumentWebWorkers() {
    const originalWorker = window.Worker;
    window.Worker = function(scriptURL, options) {
      this.recordEvent('worker_created', {
        scriptURL: scriptURL,
        timestamp: Date.now()
      });
      
      this.monitoringData.metrics.workerCalls++;
      return new originalWorker(scriptURL, options);
    };
  }

  instrumentWebSocket() {
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      this.recordEvent('websocket_created', {
        url: url,
        protocols: protocols,
        timestamp: Date.now()
      });
      
      this.monitoringData.metrics.websocketConnections++;
      return new originalWebSocket(url, protocols);
    };
  }

  /**
   * Métodos de monitorização
   */
  monitorPageEvents() {
    // Monitorar eventos de página
    document.addEventListener('DOMContentLoaded', () => {
      this.recordEvent('page_dom_loaded', {
        timestamp: Date.now(),
        url: window.location.href
      });
    });
    
    window.addEventListener('load', () => {
      this.recordEvent('page_loaded', {
        timestamp: Date.now(),
        url: window.location.href
      });
    });
    
    window.addEventListener('beforeunload', () => {
      this.recordEvent('page_unloading', {
        timestamp: Date.now(),
        url: window.location.href
      });
    });
  }

  monitorFunctionCalls() {
    // Monitorar chamadas de função críticas
    const criticalFunctions = ['setTimeout', 'setInterval', 'requestAnimationFrame'];
    
    for (const funcName of criticalFunctions) {
      if (window[funcName]) {
        const originalFunc = window[funcName];
        window[funcName] = (...args) => {
          this.recordEvent('js_function_call', {
            function: funcName,
            arguments: args.length,
            timestamp: Date.now()
          });
          
          this.monitoringData.metrics.jsCalls++;
          return originalFunc.apply(window, args);
        };
      }
    }
  }

  monitorMemoryOperations() {
    // Monitorar operações de memória WASM
    // Implementação simplificada
  }

  monitorTableOperations() {
    // Monitorar operações de tabela WASM
    // Implementação simplificada
  }

  monitorPerformanceMetrics() {
    // Monitorar métricas de performance
    setInterval(() => {
      if (performance.memory) {
        this.monitoringData.metrics.memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
      }
    }, 1000);
  }

  monitorMemoryUsage() {
    // Monitorar uso de memória
    setInterval(() => {
      if (performance.memory) {
        const memoryInfo = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.recordEvent('memory_usage', memoryInfo);
      }
    }, 5000);
  }

  monitorMemoryLeaks() {
    // Monitorar vazamentos de memória
    // Implementação simplificada
  }

  monitorNetworkRequests() {
    // Monitorar requests de rede
    // Implementação simplificada
  }

  monitorWorkerCommunication() {
    // Monitorar comunicação com workers
    // Implementação simplificada
  }

  monitorWebSocketConnections() {
    // Monitorar conexões WebSocket
    // Implementação simplificada
  }

  /**
   * Métodos de coleta de métricas
   */
  collectPerformanceMetrics(timestamp) {
    const performanceMetrics = {
      timestamp,
      navigation: performance.getEntriesByType('navigation')[0],
      resources: performance.getEntriesByType('resource'),
      measures: performance.getEntriesByType('measure')
    };
    
    this.monitoringData.metrics.performance = performanceMetrics;
  }

  collectMemoryMetrics(timestamp) {
    if (performance.memory) {
      this.monitoringData.metrics.memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
    }
  }

  collectNetworkMetrics(timestamp) {
    // Coletar métricas de rede
    // Implementação simplificada
  }

  /**
   * Métodos auxiliares
   */
  recordEvent(type, data) {
    const event = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.monitoringData.events.push(event);
    
    // Limitar histórico de eventos
    if (this.monitoringData.events.length > this.options.maxEventHistory) {
      this.monitoringData.events = this.monitoringData.events.slice(-this.options.maxEventHistory);
    }
    
    this.emit('event', event);
  }

  handlePerformanceEntry(entry) {
    this.recordEvent('performance_entry', {
      name: entry.name,
      entryType: entry.entryType,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    });
  }

  removeEventHandlers() {
    // Remover event handlers
    for (const [event, handler] of this.eventHandlers) {
      document.removeEventListener(event, handler);
      window.removeEventListener(event, handler);
    }
    this.eventHandlers.clear();
  }

  /**
   * Métodos de consulta
   */
  getMonitoringData() {
    return {
      ...this.monitoringData,
      isMonitoring: this.isMonitoring,
      uptime: this.isMonitoring ? Date.now() - this.startTime : 0
    };
  }

  getMetrics() {
    return this.monitoringData.metrics;
  }

  getAlerts() {
    return this.monitoringData.alerts;
  }

  getSuspiciousActivities() {
    return this.monitoringData.suspiciousActivities;
  }

  getEvents(eventType = null) {
    if (eventType) {
      return this.monitoringData.events.filter(event => event.type === eventType);
    }
    return this.monitoringData.events;
  }

  /**
   * Salvar dados de monitorização
   */
  saveMonitoringData(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const data = {
      monitoringData: this.monitoringData,
      options: this.options,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  }

  /**
   * Exportar relatório de monitorização
   */
  exportMonitoringReport(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.monitoringData, null, 2);
      
      case 'csv':
        return this.exportToCSV();
      
      case 'summary':
        return this.exportSummary();
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  exportToCSV() {
    let csv = 'timestamp,type,severity,message\n';
    
    for (const alert of this.monitoringData.alerts) {
      csv += `${alert.timestamp},${alert.type},${alert.severity},"${alert.message}"\n`;
    }
    
    return csv;
  }

  exportSummary() {
    return {
      totalEvents: this.monitoringData.events.length,
      totalAlerts: this.monitoringData.alerts.length,
      totalSuspiciousActivities: this.monitoringData.suspiciousActivities.length,
      currentMetrics: this.monitoringData.metrics,
      monitoringUptime: this.isMonitoring ? Date.now() - this.startTime : 0
    };
  }
}

module.exports = { RuntimeMonitor };
