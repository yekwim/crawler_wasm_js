/**
 * Coletor de Métricas de Desempenho
 * Coleta métricas de desempenho para validar detecção leve e precisa
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PerformanceMetricsCollector {
  constructor(options = {}) {
    this.options = {
      enableSystemMetrics: true,
      enableProcessMetrics: true,
      enableMemoryMetrics: true,
      enableNetworkMetrics: true,
      enableCustomMetrics: true,
      collectionInterval: 1000, // ms
      maxHistorySize: 10000,
      enableRealTimeAnalysis: true,
      enableTrendAnalysis: true,
      enableAnomalyDetection: true,
      enableReporting: true,
      ...options
    };
    
    this.metrics = {
      system: {
        cpu: {
          usage: [],
          loadAverage: [],
          cores: os.cpus().length
        },
        memory: {
          total: os.totalmem(),
          free: [],
          used: [],
          available: []
        },
        disk: {
          usage: [],
          io: []
        },
        network: {
          interfaces: [],
          traffic: []
        }
      },
      process: {
        pid: process.pid,
        uptime: [],
        memory: {
          rss: [],
          heapUsed: [],
          heapTotal: [],
          external: []
        },
        cpu: {
          usage: []
        }
      },
      application: {
        detectionTime: [],
        analysisTime: [],
        accuracy: [],
        precision: [],
        recall: [],
        f1Score: []
      },
      custom: new Map()
    };
    
    this.isCollecting = false;
    this.collectionInterval = null;
    this.startTime = null;
    this.history = [];
    this.analysisResults = {
      trends: {},
      anomalies: [],
      recommendations: []
    };
  }

  /**
   * Inicia coleta de métricas
   */
  async startCollection() {
    if (this.isCollecting) {
      console.warn('[METRICS-COLLECTOR] Coleta de métricas já está ativa');
      return;
    }
    
    try {
      console.log('[METRICS-COLLECTOR] Iniciando coleta de métricas de desempenho...');
      
      this.isCollecting = true;
      this.startTime = Date.now();
      
      // Coleta inicial
      await this.collectAllMetrics();
      
      // Configurar coleta periódica
      this.collectionInterval = setInterval(async () => {
        await this.collectAllMetrics();
      }, this.options.collectionInterval);
      
      // Configurar análise em tempo real
      if (this.options.enableRealTimeAnalysis) {
        this.setupRealTimeAnalysis();
      }
      
      console.log('[METRICS-COLLECTOR] Coleta de métricas iniciada');
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro ao iniciar coleta de métricas:', error);
      this.isCollecting = false;
      throw error;
    }
  }

  /**
   * Para coleta de métricas
   */
  async stopCollection() {
    if (!this.isCollecting) {
      console.warn('[METRICS-COLLECTOR] Coleta de métricas não está ativa');
      return;
    }
    
    try {
      console.log('[METRICS-COLLECTOR] Parando coleta de métricas...');
      
      this.isCollecting = false;
      
      // Parar coleta periódica
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
        this.collectionInterval = null;
      }
      
      // Coleta final
      await this.collectAllMetrics();
      
      console.log('[METRICS-COLLECTOR] Coleta de métricas parada');
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro ao parar coleta de métricas:', error);
      throw error;
    }
  }

  /**
   * Coleta todas as métricas
   */
  async collectAllMetrics() {
    const timestamp = Date.now();
    
    try {
      // Coletar métricas do sistema
      if (this.options.enableSystemMetrics) {
        await this.collectSystemMetrics(timestamp);
      }
      
      // Coletar métricas do processo
      if (this.options.enableProcessMetrics) {
        await this.collectProcessMetrics(timestamp);
      }
      
      // Coletar métricas de memória
      if (this.options.enableMemoryMetrics) {
        await this.collectMemoryMetrics(timestamp);
      }
      
      // Coletar métricas de rede
      if (this.options.enableNetworkMetrics) {
        await this.collectNetworkMetrics(timestamp);
      }
      
      // Coletar métricas customizadas
      if (this.options.enableCustomMetrics) {
        await this.collectCustomMetrics(timestamp);
      }
      
      // Adicionar ao histórico
      this.addToHistory(timestamp);
      
      // Análise em tempo real
      if (this.options.enableRealTimeAnalysis) {
        await this.performRealTimeAnalysis();
      }
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas:', error);
    }
  }

  /**
   * Coleta métricas do sistema
   */
  async collectSystemMetrics(timestamp) {
    try {
      // CPU
      const cpuUsage = await this.getCPUUsage();
      this.metrics.system.cpu.usage.push({
        timestamp,
        usage: cpuUsage,
        loadAverage: os.loadavg()
      });
      
      // Memória
      const memInfo = this.getMemoryInfo();
      this.metrics.system.memory.free.push({
        timestamp,
        free: memInfo.free
      });
      this.metrics.system.memory.used.push({
        timestamp,
        used: memInfo.used
      });
      this.metrics.system.memory.available.push({
        timestamp,
        available: memInfo.available
      });
      
      // Disco
      const diskInfo = await this.getDiskInfo();
      this.metrics.system.disk.usage.push({
        timestamp,
        usage: diskInfo
      });
      
      // Limitar histórico
      this.limitHistory(this.metrics.system.cpu.usage);
      this.limitHistory(this.metrics.system.memory.free);
      this.limitHistory(this.metrics.system.memory.used);
      this.limitHistory(this.metrics.system.memory.available);
      this.limitHistory(this.metrics.system.disk.usage);
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas do sistema:', error);
    }
  }

  /**
   * Coleta métricas do processo
   */
  async collectProcessMetrics(timestamp) {
    try {
      // Uptime
      this.metrics.process.uptime.push({
        timestamp,
        uptime: process.uptime()
      });
      
      // Memória do processo
      const memUsage = process.memoryUsage();
      this.metrics.process.memory.rss.push({
        timestamp,
        rss: memUsage.rss
      });
      this.metrics.process.memory.heapUsed.push({
        timestamp,
        heapUsed: memUsage.heapUsed
      });
      this.metrics.process.memory.heapTotal.push({
        timestamp,
        heapTotal: memUsage.heapTotal
      });
      this.metrics.process.memory.external.push({
        timestamp,
        external: memUsage.external
      });
      
      // CPU do processo
      const cpuUsage = await this.getProcessCPUUsage();
      this.metrics.process.cpu.usage.push({
        timestamp,
        usage: cpuUsage
      });
      
      // Limitar histórico
      this.limitHistory(this.metrics.process.uptime);
      this.limitHistory(this.metrics.process.memory.rss);
      this.limitHistory(this.metrics.process.memory.heapUsed);
      this.limitHistory(this.metrics.process.memory.heapTotal);
      this.limitHistory(this.metrics.process.memory.external);
      this.limitHistory(this.metrics.process.cpu.usage);
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas do processo:', error);
    }
  }

  /**
   * Coleta métricas de memória
   */
  async collectMemoryMetrics(timestamp) {
    try {
      // Métricas de memória específicas da aplicação
      if (global.gc) {
        global.gc();
      }
      
      const memUsage = process.memoryUsage();
      const memInfo = this.getMemoryInfo();
      
      // Adicionar métricas customizadas de memória
      this.addCustomMetric('memory_utilization', {
        timestamp,
        processMemory: memUsage.heapUsed,
        systemMemory: memInfo.used,
        utilization: (memUsage.heapUsed / memInfo.total) * 100
      });
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas de memória:', error);
    }
  }

  /**
   * Coleta métricas de rede
   */
  async collectNetworkMetrics(timestamp) {
    try {
      // Interfaces de rede
      const networkInterfaces = os.networkInterfaces();
      this.metrics.system.network.interfaces.push({
        timestamp,
        interfaces: networkInterfaces
      });
      
      // Tráfego de rede (simplificado)
      const networkTraffic = await this.getNetworkTraffic();
      this.metrics.system.network.traffic.push({
        timestamp,
        traffic: networkTraffic
      });
      
      // Limitar histórico
      this.limitHistory(this.metrics.system.network.interfaces);
      this.limitHistory(this.metrics.system.network.traffic);
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas de rede:', error);
    }
  }

  /**
   * Coleta métricas customizadas
   */
  async collectCustomMetrics(timestamp) {
    try {
      // Métricas customizadas podem ser adicionadas aqui
      // Exemplo: métricas de detecção, análise, etc.
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na coleta de métricas customizadas:', error);
    }
  }

  /**
   * Adiciona métrica customizada
   */
  addCustomMetric(name, data) {
    if (!this.metrics.custom.has(name)) {
      this.metrics.custom.set(name, []);
    }
    
    this.metrics.custom.get(name).push(data);
    this.limitHistory(this.metrics.custom.get(name));
  }

  /**
   * Adiciona métrica de detecção
   */
  addDetectionMetric(detectionData) {
    const timestamp = Date.now();
    
    // Tempo de detecção
    this.metrics.application.detectionTime.push({
      timestamp,
      detectionTime: detectionData.detectionTime || 0,
      confidence: detectionData.confidence || 0
    });
    
    // Tempo de análise
    this.metrics.application.analysisTime.push({
      timestamp,
      analysisTime: detectionData.analysisTime || 0
    });
    
    // Precisão
    if (detectionData.accuracy !== undefined) {
      this.metrics.application.accuracy.push({
        timestamp,
        accuracy: detectionData.accuracy
      });
    }
    
    // Limitar histórico
    this.limitHistory(this.metrics.application.detectionTime);
    this.limitHistory(this.metrics.application.analysisTime);
    this.limitHistory(this.metrics.application.accuracy);
  }

  /**
   * Análise em tempo real
   */
  async performRealTimeAnalysis() {
    try {
      // Análise de tendências
      if (this.options.enableTrendAnalysis) {
        await this.analyzeTrends();
      }
      
      // Detecção de anomalias
      if (this.options.enableAnomalyDetection) {
        await this.detectAnomalies();
      }
      
      // Geração de recomendações
      if (this.options.enableReporting) {
        await this.generateRecommendations();
      }
      
    } catch (error) {
      console.error('[METRICS-COLLECTOR] Erro na análise em tempo real:', error);
    }
  }

  /**
   * Análise de tendências
   */
  async analyzeTrends() {
    const trends = {};
    
    // Analisar tendência de CPU
    trends.cpu = this.analyzeTrend(this.metrics.system.cpu.usage, 'usage');
    
    // Analisar tendência de memória
    trends.memory = this.analyzeTrend(this.metrics.system.memory.used, 'used');
    
    // Analisar tendência de detecção
    trends.detection = this.analyzeTrend(this.metrics.application.detectionTime, 'detectionTime');
    
    this.analysisResults.trends = trends;
  }

  /**
   * Detecta anomalias
   */
  async detectAnomalies() {
    const anomalies = [];
    
    // Detectar anomalias de CPU
    const cpuAnomalies = this.detectAnomaliesInMetric(this.metrics.system.cpu.usage, 'usage');
    anomalies.push(...cpuAnomalies.map(a => ({ ...a, metric: 'cpu' })));
    
    // Detectar anomalias de memória
    const memoryAnomalies = this.detectAnomaliesInMetric(this.metrics.system.memory.used, 'used');
    anomalies.push(...memoryAnomalies.map(a => ({ ...a, metric: 'memory' })));
    
    // Detectar anomalias de detecção
    const detectionAnomalies = this.detectAnomaliesInMetric(this.metrics.application.detectionTime, 'detectionTime');
    anomalies.push(...detectionAnomalies.map(a => ({ ...a, metric: 'detection' })));
    
    this.analysisResults.anomalies = anomalies;
  }

  /**
   * Gera recomendações
   */
  async generateRecommendations() {
    const recommendations = [];
    
    // Analisar CPU
    const cpuUsage = this.getCurrentValue(this.metrics.system.cpu.usage, 'usage');
    if (cpuUsage > 80) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'CPU usage is high. Consider optimizing detection algorithms.',
        metric: 'cpu',
        value: cpuUsage
      });
    }
    
    // Analisar memória
    const memoryUsage = this.getCurrentValue(this.metrics.system.memory.used, 'used');
    const memoryUtilization = (memoryUsage / this.metrics.system.memory.total) * 100;
    if (memoryUtilization > 80) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Memory usage is high. Consider implementing memory optimization.',
        metric: 'memory',
        value: memoryUtilization
      });
    }
    
    // Analisar tempo de detecção
    const detectionTime = this.getCurrentValue(this.metrics.application.detectionTime, 'detectionTime');
    if (detectionTime > 1000) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Detection time is high. Consider optimizing detection pipeline.',
        metric: 'detection_time',
        value: detectionTime
      });
    }
    
    this.analysisResults.recommendations = recommendations;
  }

  /**
   * Métodos auxiliares para coleta de métricas
   */
  async getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const cpuUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
        resolve(cpuUsage);
      }, 100);
    });
  }

  async getProcessCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const cpuUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
        resolve(cpuUsage);
      }, 100);
    });
  }

  getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total,
      free,
      used,
      available: free
    };
  }

  async getDiskInfo() {
    // Implementação simplificada
    return {
      total: 1000000000, // 1GB
      free: 500000000,   // 500MB
      used: 500000000    // 500MB
    };
  }

  async getNetworkTraffic() {
    // Implementação simplificada
    return {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0
    };
  }

  /**
   * Métodos auxiliares para análise
   */
  analyzeTrend(metricArray, valueField) {
    if (metricArray.length < 2) {
      return { trend: 'insufficient_data', slope: 0 };
    }
    
    const values = metricArray.slice(-10).map(item => item[valueField]);
    const n = values.length;
    
    // Calcular slope usando regressão linear simples
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    let trend = 'stable';
    if (slope > 0.1) trend = 'increasing';
    else if (slope < -0.1) trend = 'decreasing';
    
    return { trend, slope };
  }

  detectAnomaliesInMetric(metricArray, valueField) {
    if (metricArray.length < 10) {
      return [];
    }
    
    const values = metricArray.slice(-20).map(item => item[valueField]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const anomalies = [];
    const threshold = 2 * stdDev; // 2 standard deviations
    
    values.forEach((value, index) => {
      if (Math.abs(value - mean) > threshold) {
        anomalies.push({
          timestamp: metricArray[metricArray.length - 20 + index].timestamp,
          value,
          mean,
          stdDev,
          deviation: Math.abs(value - mean)
        });
      }
    });
    
    return anomalies;
  }

  getCurrentValue(metricArray, valueField) {
    if (metricArray.length === 0) return 0;
    return metricArray[metricArray.length - 1][valueField];
  }

  limitHistory(metricArray) {
    if (metricArray.length > this.options.maxHistorySize) {
      metricArray.splice(0, metricArray.length - this.options.maxHistorySize);
    }
  }

  addToHistory(timestamp) {
    this.history.push({
      timestamp,
      systemCpu: this.getCurrentValue(this.metrics.system.cpu.usage, 'usage'),
      systemMemory: this.getCurrentValue(this.metrics.system.memory.used, 'used'),
      processMemory: this.getCurrentValue(this.metrics.process.memory.heapUsed, 'heapUsed'),
      detectionTime: this.getCurrentValue(this.metrics.application.detectionTime, 'detectionTime')
    });
    
    this.limitHistory(this.history);
  }

  setupRealTimeAnalysis() {
    // Configurar análise em tempo real
    console.log('[METRICS-COLLECTOR] Análise em tempo real configurada');
  }

  /**
   * Métodos de consulta
   */
  getMetrics() {
    return {
      ...this.metrics,
      isCollecting: this.isCollecting,
      uptime: this.isCollecting ? Date.now() - this.startTime : 0,
      history: this.history,
      analysisResults: this.analysisResults
    };
  }

  getSystemMetrics() {
    return this.metrics.system;
  }

  getProcessMetrics() {
    return this.metrics.process;
  }

  getApplicationMetrics() {
    return this.metrics.application;
  }

  getCustomMetrics() {
    return Object.fromEntries(this.metrics.custom);
  }

  getAnalysisResults() {
    return this.analysisResults;
  }

  getHistory(limit = 100) {
    return this.history.slice(-limit);
  }

  /**
   * Métodos de exportação
   */
  exportMetrics(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.getMetrics(), null, 2);
      
      case 'csv':
        return this.exportToCSV();
      
      case 'summary':
        return this.exportSummary();
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  exportToCSV() {
    let csv = 'timestamp,system_cpu,system_memory,process_memory,detection_time\n';
    
    for (const entry of this.history) {
      csv += `${entry.timestamp},${entry.systemCpu},${entry.systemMemory},${entry.processMemory},${entry.detectionTime}\n`;
    }
    
    return csv;
  }

  exportSummary() {
    const metrics = this.getMetrics();
    
    return {
      collectionStatus: this.isCollecting ? 'active' : 'inactive',
      uptime: metrics.uptime,
      totalDataPoints: this.history.length,
      currentSystemCpu: this.getCurrentValue(this.metrics.system.cpu.usage, 'usage'),
      currentSystemMemory: this.getCurrentValue(this.metrics.system.memory.used, 'used'),
      currentProcessMemory: this.getCurrentValue(this.metrics.process.memory.heapUsed, 'heapUsed'),
      currentDetectionTime: this.getCurrentValue(this.metrics.application.detectionTime, 'detectionTime'),
      trends: this.analysisResults.trends,
      anomalies: this.analysisResults.anomalies.length,
      recommendations: this.analysisResults.recommendations.length
    };
  }

  /**
   * Salvar métricas
   */
  saveMetrics(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const data = {
      metrics: this.getMetrics(),
      options: this.options,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  }

  /**
   * Limpar métricas
   */
  clearMetrics() {
    // Limpar todas as métricas
    this.metrics.system.cpu.usage = [];
    this.metrics.system.memory.free = [];
    this.metrics.system.memory.used = [];
    this.metrics.system.memory.available = [];
    this.metrics.system.disk.usage = [];
    this.metrics.system.network.interfaces = [];
    this.metrics.system.network.traffic = [];
    
    this.metrics.process.uptime = [];
    this.metrics.process.memory.rss = [];
    this.metrics.process.memory.heapUsed = [];
    this.metrics.process.memory.heapTotal = [];
    this.metrics.process.memory.external = [];
    this.metrics.process.cpu.usage = [];
    
    this.metrics.application.detectionTime = [];
    this.metrics.application.analysisTime = [];
    this.metrics.application.accuracy = [];
    this.metrics.application.precision = [];
    this.metrics.application.recall = [];
    this.metrics.application.f1Score = [];
    
    this.metrics.custom.clear();
    this.history = [];
    this.analysisResults = {
      trends: {},
      anomalies: [],
      recommendations: []
    };
    
    console.log('[METRICS-COLLECTOR] Métricas limpas');
  }
}

module.exports = { PerformanceMetricsCollector };
