/**
 * Pipeline Integrado Aprimorado
 * Conecta todos os componentes do sistema de detecção de mining
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Importar todos os componentes
const { crawl } = require('../crawler');
const { JSInstrumentation } = require('../instrumentation/js_instrumentation');
const { ModernWasmParser } = require('../analyzers/modern_wasm_parser');
const { HybridICFGBuilder } = require('../analyzers/hybrid_icfg_builder');
const { EvasionSimulator } = require('../robustness/evasion_simulator');
const { ObfuscationResistantNormalizer } = require('../normalization/obfuscation_resistant_normalizer');
const { LLMSemanticAnalyzer } = require('../analysis/llm_semantic_analyzer');
const { RuntimeMonitor } = require('../runtime/runtime_monitor');
const { RealTimeAlertSystem } = require('../alerting/real_time_alert_system');
const { PerformanceMetricsCollector } = require('../metrics/performance_metrics_collector');

class EnhancedIntegratedPipeline {
  constructor(options = {}) {
    this.options = {
      enableCrawling: true,
      enableInstrumentation: true,
      enableParsing: true,
      enableICFGBuilding: true,
      enableEvasionSimulation: true,
      enableNormalization: true,
      enableLLMAnalysis: true,
      enableRuntimeMonitoring: true,
      enableAlerting: true,
      enableMetrics: true,
      outputDir: './output',
      maxPages: 1,
      headless: true,
      ...options
    };
    
    this.components = {
      crawler: null,
      jsInstrumentation: null,
      wasmParser: null,
      icfgBuilder: null,
      evasionSimulator: null,
      normalizer: null,
      llmAnalyzer: null,
      runtimeMonitor: null,
      alertSystem: null,
      metricsCollector: null
    };
    
    this.pipelineState = {
      phase: 'idle',
      startTime: null,
      endTime: null,
      currentStep: 0,
      totalSteps: 10,
      results: {},
      errors: []
    };
  }

  /**
   * Executa pipeline completo
   */
  async executePipeline(startUrl, options = {}) {
    const pipelineStartTime = performance.now();
    
    try {
      console.log('[PIPELINE] Iniciando pipeline integrado aprimorado...');
      console.log(`[PIPELINE] URL alvo: ${startUrl}`);
      
      this.pipelineState.startTime = Date.now();
      this.pipelineState.phase = 'running';
      
      // Fase 1: Coleta e pré-processamento
      await this.executePhase1_Collection(startUrl, options);
      
      // Fase 2: Análise e construção
      await this.executePhase2_Analysis(options);
      
      // Fase 3: Robustez e transformações
      await this.executePhase3_Robustness(options);
      
      // Fase 4: Análise semântica
      await this.executePhase4_SemanticAnalysis(options);
      
      // Fase 5: Monitorização runtime
      await this.executePhase5_RuntimeMonitoring(options);
      
      // Fase 6: Alertas e ação
      await this.executePhase6_Alerting(options);
      
      // Fase 7: Métricas e validação
      await this.executePhase7_Metrics(options);
      
      const pipelineEndTime = performance.now();
      this.pipelineState.endTime = Date.now();
      this.pipelineState.phase = 'completed';
      
      console.log(`[PIPELINE] Pipeline concluído em ${(pipelineEndTime - pipelineStartTime).toFixed(2)}ms`);
      
      return this.generatePipelineReport();
      
    } catch (error) {
      console.error('[PIPELINE] Erro no pipeline:', error);
      this.pipelineState.phase = 'error';
      this.pipelineState.errors.push(error);
      throw error;
    }
  }

  /**
   * Fase 1: Coleta e pré-processamento
   */
  async executePhase1_Collection(startUrl, options) {
    console.log('[PIPELINE] Fase 1: Coleta e pré-processamento...');
    this.pipelineState.currentStep = 1;
    
    try {
      // 1.1: Crawling
      if (this.options.enableCrawling) {
        console.log('[PIPELINE] 1.1: Executando crawling...');
        const crawlResults = await crawl(startUrl, this.options.outputDir, {
          maxPages: this.options.maxPages,
          headless: this.options.headless
        });
        
        this.pipelineState.results.crawlResults = {
          startUrl,
          outputDir: this.options.outputDir,
          status: 'completed'
        };
      }
      
      // 1.2: Instrumentação JS
      if (this.options.enableInstrumentation) {
        console.log('[PIPELINE] 1.2: Configurando instrumentação JS...');
        this.components.jsInstrumentation = new JSInstrumentation();
        
        // Instrumentar arquivos JS coletados
        const jsFiles = this.findJSFiles(this.options.outputDir);
        let successfulInstrumentations = 0;
        
        for (const jsFile of jsFiles) {
          try {
            await this.components.jsInstrumentation.instrumentFile(
              jsFile,
              jsFile.replace('.js', '.instrumented.js')
            );
            successfulInstrumentations++;
          } catch (error) {
            console.warn(`[PIPELINE] Erro ao instrumentar ${jsFile}: ${error.message}`);
            // Continuar com os outros arquivos
          }
        }
        
        this.pipelineState.results.instrumentationResults = {
          jsFilesProcessed: jsFiles.length,
          successfulInstrumentations: successfulInstrumentations,
          status: successfulInstrumentations > 0 ? 'completed' : 'failed'
        };
      }
      
      // 1.3: Parsing WASM
      if (this.options.enableParsing) {
        console.log('[PIPELINE] 1.3: Configurando parser WASM...');
        this.components.wasmParser = new ModernWasmParser();
        
        // Parse arquivos WASM coletados
        const wasmFiles = this.findWasmFiles(this.options.outputDir);
        const wasmResults = [];
        
        for (const wasmFile of wasmFiles) {
          const parseResult = await this.components.wasmParser.parseWasmFile(wasmFile);
          wasmResults.push(parseResult);
        }
        
        this.pipelineState.results.wasmParseResults = {
          wasmFilesProcessed: wasmFiles.length,
          results: wasmResults,
          status: 'completed'
        };
      }
      
      console.log('[PIPELINE] Fase 1 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 1:', error);
      throw error;
    }
  }

  /**
   * Fase 2: Análise e construção
   */
  async executePhase2_Analysis(options) {
    console.log('[PIPELINE] Fase 2: Análise e construção...');
    this.pipelineState.currentStep = 2;
    
    try {
      // 2.1: Construção do ICFG híbrido
      if (this.options.enableICFGBuilding) {
        console.log('[PIPELINE] 2.1: Construindo ICFG híbrido...');
        this.components.icfgBuilder = new HybridICFGBuilder();
        
        const jsFiles = this.findInstrumentedJSFiles(this.options.outputDir);
        const wasmFiles = this.findWasmFiles(this.options.outputDir);
        
        const icfgResults = await this.components.icfgBuilder.buildHybridICFG(
          jsFiles,
          wasmFiles,
          options
        );
        
        this.pipelineState.results.icfgResults = icfgResults;
      }
      
      console.log('[PIPELINE] Fase 2 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 2:', error);
      throw error;
    }
  }

  /**
   * Fase 3: Robustez e transformações
   */
  async executePhase3_Robustness(options) {
    console.log('[PIPELINE] Fase 3: Robustez e transformações...');
    this.pipelineState.currentStep = 3;
    
    try {
      // 3.1: Simulação de evasões
      if (this.options.enableEvasionSimulation) {
        console.log('[PIPELINE] 3.1: Simulando evasões...');
        this.components.evasionSimulator = new EvasionSimulator();
        
        const jsFiles = this.findJSFiles(this.options.outputDir);
        const wasmFiles = this.findWasmFiles(this.options.outputDir);
        
        const evasionResults = {
          jsEvasions: [],
          wasmEvasions: []
        };
        
        for (const jsFile of jsFiles) {
          const result = await this.components.evasionSimulator.simulateJSEvasions(
            jsFile,
            jsFile.replace('.js', '.evaded.js')
          );
          evasionResults.jsEvasions.push(result);
        }
        
        for (const wasmFile of wasmFiles) {
          const result = await this.components.evasionSimulator.simulateWasmEvasions(
            wasmFile,
            wasmFile.replace('.wasm', '.evaded.wasm')
          );
          evasionResults.wasmEvasions.push(result);
        }
        
        this.pipelineState.results.evasionResults = evasionResults;
      }
      
      // 3.2: Normalização resistente a ofuscação
      if (this.options.enableNormalization) {
        console.log('[PIPELINE] 3.2: Normalizando ICFG...');
        this.components.normalizer = new ObfuscationResistantNormalizer();
        
        if (this.pipelineState.results.icfgResults) {
          const normalizedICFG = await this.components.normalizer.normalizeICFG(
            this.pipelineState.results.icfgResults.graph
          );
          
          this.pipelineState.results.normalizedICFG = normalizedICFG;
        }
      }
      
      console.log('[PIPELINE] Fase 3 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 3:', error);
      throw error;
    }
  }

  /**
   * Fase 4: Análise semântica
   */
  async executePhase4_SemanticAnalysis(options) {
    console.log('[PIPELINE] Fase 4: Análise semântica...');
    this.pipelineState.currentStep = 4;
    
    try {
      // 4.1: Análise semântica com LLM
      if (this.options.enableLLMAnalysis) {
        console.log('[PIPELINE] 4.1: Executando análise semântica...');
        this.components.llmAnalyzer = new LLMSemanticAnalyzer();
        
        const icfgToAnalyze = this.pipelineState.results.normalizedICFG || 
                             this.pipelineState.results.icfgResults;
        
        if (icfgToAnalyze) {
          const analysisResults = await this.components.llmAnalyzer.analyzeICFG(
            icfgToAnalyze.normalizedICFG || icfgToAnalyze.graph
          );
          
          this.pipelineState.results.llmAnalysisResults = analysisResults;
        }
      }
      
      console.log('[PIPELINE] Fase 4 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 4:', error);
      throw error;
    }
  }

  /**
   * Fase 5: Monitorização runtime
   */
  async executePhase5_RuntimeMonitoring(options) {
    console.log('[PIPELINE] Fase 5: Monitorização runtime...');
    this.pipelineState.currentStep = 5;
    
    try {
      // 5.1: Configurar monitorização runtime
      if (this.options.enableRuntimeMonitoring) {
        console.log('[PIPELINE] 5.1: Configurando monitorização runtime...');
        this.components.runtimeMonitor = new RuntimeMonitor();
        
        await this.components.runtimeMonitor.startMonitoring();
        
        // Simular monitorização por um período
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const monitoringData = this.components.runtimeMonitor.getMonitoringData();
        this.pipelineState.results.runtimeMonitoringResults = monitoringData;
        
        await this.components.runtimeMonitor.stopMonitoring();
      }
      
      console.log('[PIPELINE] Fase 5 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 5:', error);
      throw error;
    }
  }

  /**
   * Fase 6: Alertas e ação
   */
  async executePhase6_Alerting(options) {
    console.log('[PIPELINE] Fase 6: Alertas e ação...');
    this.pipelineState.currentStep = 6;
    
    try {
      // 6.1: Configurar sistema de alertas
      if (this.options.enableAlerting) {
        console.log('[PIPELINE] 6.1: Configurando sistema de alertas...');
        this.components.alertSystem = new RealTimeAlertSystem();
        
        await this.components.alertSystem.start();
        
        // Simular detecção de mining
        if (this.pipelineState.results.llmAnalysisResults) {
          const detectionData = {
            confidence: this.pipelineState.results.llmAnalysisResults.classification.confidence,
            source: 'llm_analysis',
            target: 'detected_mining_activity',
            description: this.pipelineState.results.llmAnalysisResults.classification.reasoning,
            indicators: this.pipelineState.results.llmAnalysisResults.threatIndicators,
            timestamp: Date.now()
          };
          
          const alert = await this.components.alertSystem.processDetectionAlert(detectionData);
          this.pipelineState.results.alertResults = alert;
        }
        
        await this.components.alertSystem.stop();
      }
      
      console.log('[PIPELINE] Fase 6 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 6:', error);
      throw error;
    }
  }

  /**
   * Fase 7: Métricas e validação
   */
  async executePhase7_Metrics(options) {
    console.log('[PIPELINE] Fase 7: Métricas e validação...');
    this.pipelineState.currentStep = 7;
    
    try {
      // 7.1: Coleta de métricas de desempenho
      if (this.options.enableMetrics) {
        console.log('[PIPELINE] 7.1: Coletando métricas de desempenho...');
        this.components.metricsCollector = new PerformanceMetricsCollector();
        
        await this.components.metricsCollector.startCollection();
        
        // Simular coleta de métricas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const metrics = this.components.metricsCollector.getMetrics();
        this.pipelineState.results.performanceMetrics = metrics;
        
        await this.components.metricsCollector.stopCollection();
      }
      
      console.log('[PIPELINE] Fase 7 concluída');
      
    } catch (error) {
      console.error('[PIPELINE] Erro na Fase 7:', error);
      throw error;
    }
  }

  /**
   * Métodos auxiliares para encontrar arquivos
   */
  findJSFiles(dir) {
    const files = [];
    this.findFiles(dir, '.js', files);
    return files.filter(file => !file.includes('.instrumented.') && !file.includes('.evaded.'));
  }

  findInstrumentedJSFiles(dir) {
    const files = [];
    this.findFiles(dir, '.instrumented.js', files);
    return files;
  }

  findWasmFiles(dir) {
    const files = [];
    this.findFiles(dir, '.wasm', files);
    return files.filter(file => !file.includes('.evaded.'));
  }

  findFiles(dir, extension, files) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findFiles(fullPath, extension, files);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Gera relatório do pipeline
   */
  generatePipelineReport() {
    const report = {
      pipeline: {
        status: this.pipelineState.phase,
        startTime: this.pipelineState.startTime,
        endTime: this.pipelineState.endTime,
        duration: this.pipelineState.endTime - this.pipelineState.startTime,
        stepsCompleted: this.pipelineState.currentStep,
        totalSteps: this.pipelineState.totalSteps,
        errors: this.pipelineState.errors
      },
      results: this.pipelineState.results,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };
    
    // Salvar relatório
    const reportPath = path.join(this.options.outputDir, 'pipeline_report.json');
    this.ensureDirectoryExists(path.dirname(reportPath));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Gera resumo do pipeline
   */
  generateSummary() {
    const summary = {
      filesProcessed: {
        js: this.findJSFiles(this.options.outputDir).length,
        wasm: this.findWasmFiles(this.options.outputDir).length,
        instrumented: this.findInstrumentedJSFiles(this.options.outputDir).length
      },
      analysisResults: {
        icfgBuilt: !!this.pipelineState.results.icfgResults,
        normalized: !!this.pipelineState.results.normalizedICFG,
        llmAnalyzed: !!this.pipelineState.results.llmAnalysisResults,
        alertsGenerated: !!this.pipelineState.results.alertResults,
        metricsCollected: !!this.pipelineState.results.performanceMetrics
      },
      performance: {
        totalTime: this.pipelineState.endTime - this.pipelineState.startTime,
        averageStepTime: (this.pipelineState.endTime - this.pipelineState.startTime) / this.pipelineState.currentStep
      }
    };
    
    // Adicionar resultados de classificação se disponíveis
    if (this.pipelineState.results.llmAnalysisResults) {
      summary.classification = this.pipelineState.results.llmAnalysisResults.classification;
    }
    
    return summary;
  }

  /**
   * Gera recomendações
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Recomendações baseadas nos resultados
    if (this.pipelineState.results.llmAnalysisResults) {
      const classification = this.pipelineState.results.llmAnalysisResults.classification;
      
      if (classification.label === 'malicious' && classification.confidence > 0.8) {
        recommendations.push({
          type: 'security',
          priority: 'high',
          message: 'Alta probabilidade de atividade de mining detectada. Recomenda-se bloqueio imediato.'
        });
      } else if (classification.label === 'malicious' && classification.confidence > 0.6) {
        recommendations.push({
          type: 'security',
          priority: 'medium',
          message: 'Atividade suspeita detectada. Recomenda-se monitorização contínua.'
        });
      }
    }
    
    // Recomendações baseadas em métricas de desempenho
    if (this.pipelineState.results.performanceMetrics) {
      const metrics = this.pipelineState.results.performanceMetrics;
      
      if (metrics.currentSystemCpu > 80) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          message: 'Uso de CPU elevado detectado. Considere otimizar algoritmos de detecção.'
        });
      }
      
      if (metrics.currentSystemMemory > 80) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          message: 'Uso de memória elevado detectado. Considere implementar otimizações de memória.'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Utilitários
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Métodos de consulta
   */
  getPipelineState() {
    return this.pipelineState;
  }

  getResults() {
    return this.pipelineState.results;
  }

  getErrors() {
    return this.pipelineState.errors;
  }

  /**
   * Limpar recursos
   */
  async cleanup() {
    console.log('[PIPELINE] Limpando recursos...');
    
    // Parar todos os componentes ativos
    if (this.components.runtimeMonitor && this.components.runtimeMonitor.isMonitoring) {
      await this.components.runtimeMonitor.stopMonitoring();
    }
    
    if (this.components.alertSystem && this.components.alertSystem.isActive) {
      await this.components.alertSystem.stop();
    }
    
    if (this.components.metricsCollector && this.components.metricsCollector.isCollecting) {
      await this.components.metricsCollector.stopCollection();
    }
    
    console.log('[PIPELINE] Recursos limpos');
  }
}

module.exports = { EnhancedIntegratedPipeline };
