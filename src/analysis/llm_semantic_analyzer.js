/**
 * Analisador Semântico com LLM
 * Converte ICFG em texto padronizado e classifica como malicioso ou benigno
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LLMSemanticAnalyzer {
  constructor(options = {}) {
    this.options = {
      llmProvider: 'openai', // openai, anthropic, local
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 4000,
      enableExplanation: true,
      enablePathAnalysis: true,
      enableThreatDetection: true,
      enableBehaviorAnalysis: true,
      confidenceThreshold: 0.7,
      ...options
    };
    
    this.analysisResults = {
      classification: null,
      confidence: 0,
      explanation: '',
      criticalPaths: [],
      threatIndicators: [],
      behaviorAnalysis: {},
      performance: {}
    };
    
    this.llmPrompts = {
      classification: this.getClassificationPrompt(),
      explanation: this.getExplanationPrompt(),
      pathAnalysis: this.getPathAnalysisPrompt(),
      threatDetection: this.getThreatDetectionPrompt()
    };
  }

  /**
   * Análise semântica completa do ICFG
   */
  async analyzeICFG(icfg, options = {}) {
    const startTime = performance.now();
    
    try {
      console.log('[LLM-ANALYZER] Iniciando análise semântica...');
      
      // Converter ICFG para texto padronizado
      const standardizedText = await this.convertICFGToText(icfg);
      
      // Classificar como malicioso ou benigno
      const classification = await this.classifyICFG(standardizedText, options);
      
      // Gerar explicação
      const explanation = await this.generateExplanation(standardizedText, classification, options);
      
      // Analisar caminhos críticos
      const pathAnalysis = await this.analyzeCriticalPaths(icfg, standardizedText, options);
      
      // Detectar ameaças
      const threatDetection = await this.detectThreats(icfg, standardizedText, options);
      
      // Análise comportamental
      const behaviorAnalysis = await this.analyzeBehavior(icfg, standardizedText, options);
      
      const endTime = performance.now();
      
      this.analysisResults = {
        classification,
        explanation,
        criticalPaths: pathAnalysis,
        threatIndicators: threatDetection,
        behaviorAnalysis,
        performance: {
          analysisTime: endTime - startTime,
          standardizedTextLength: standardizedText.length,
          confidence: classification.confidence
        }
      };
      
      console.log(`[LLM-ANALYZER] Análise concluída em ${this.analysisResults.performance.analysisTime.toFixed(2)}ms`);
      console.log(`[LLM-ANALYZER] Classificação: ${classification.label} (${(classification.confidence * 100).toFixed(1)}%)`);
      
      return this.analysisResults;
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na análise semântica:', error);
      throw error;
      }
  }

  /**
   * Converte ICFG para texto padronizado
   */
  async convertICFGToText(icfg) {
    console.log('[LLM-ANALYZER] Convertendo ICFG para texto padronizado...');
    
    let text = '=== INTER-CONTROL FLOW GRAPH ANALYSIS ===\n\n';
    
    // Informações gerais
    text += `Graph Statistics:\n`;
    text += `- Total Nodes: ${icfg.nodes.size}\n`;
    text += `- Total Edges: ${icfg.edges.size}\n`;
    text += `- Node Types: ${this.getNodeTypes(icfg.nodes)}\n\n`;
    
    // Análise de nós
    text += `=== NODE ANALYSIS ===\n`;
    for (const [nodeId, node] of icfg.nodes) {
      text += this.formatNodeForLLM(node);
    }
    
    // Análise de arestas
    text += `\n=== EDGE ANALYSIS ===\n`;
    for (const edge of icfg.edges) {
      text += this.formatEdgeForLLM(edge);
    }
    
    // Análise de interações
    text += `\n=== INTERACTION ANALYSIS ===\n`;
    text += this.formatInteractionsForLLM(icfg.metadata);
    
    // Análise de padrões
    text += `\n=== PATTERN ANALYSIS ===\n`;
    text += this.formatPatternsForLLM(icfg);
    
    return text;
  }

  /**
   * Classifica ICFG usando LLM
   */
  async classifyICFG(standardizedText, options = {}) {
    console.log('[LLM-ANALYZER] Classificando ICFG...');
    
    const prompt = this.buildClassificationPrompt(standardizedText);
    
    try {
      // Simular chamada para LLM (implementar integração real conforme necessário)
      const response = await this.callLLM(prompt, {
        model: this.options.model,
        temperature: this.options.temperature,
        maxTokens: this.options.maxTokens
      });
      
      const classification = this.parseClassificationResponse(response);
      
      // Validar confiança
      if (classification.confidence < this.options.confidenceThreshold) {
        console.warn(`[LLM-ANALYZER] Baixa confiança na classificação: ${classification.confidence}`);
      }
      
      return classification;
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na classificação:', error);
      
      // Fallback: classificação baseada em heurísticas
      return this.fallbackClassification(standardizedText);
    }
  }

  /**
   * Gera explicação da classificação
   */
  async generateExplanation(standardizedText, classification, options = {}) {
    if (!this.options.enableExplanation) return '';
    
    console.log('[LLM-ANALYZER] Gerando explicação...');
    
    const prompt = this.buildExplanationPrompt(standardizedText, classification);
    
    try {
      const response = await this.callLLM(prompt, {
        model: this.options.model,
        temperature: 0.3,
        maxTokens: 2000
      });
      
      return this.parseExplanationResponse(response);
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na geração de explicação:', error);
      return this.generateFallbackExplanation(classification);
    }
  }

  /**
   * Analisa caminhos críticos
   */
  async analyzeCriticalPaths(icfg, standardizedText, options = {}) {
    if (!this.options.enablePathAnalysis) return [];
    
    console.log('[LLM-ANALYZER] Analisando caminhos críticos...');
    
    const prompt = this.buildPathAnalysisPrompt(standardizedText);
    
    try {
      const response = await this.callLLM(prompt, {
        model: this.options.model,
        temperature: 0.2,
        maxTokens: 3000
      });
      
      return this.parsePathAnalysisResponse(response);
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na análise de caminhos:', error);
      return this.fallbackPathAnalysis(icfg);
    }
  }

  /**
   * Detecta ameaças
   */
  async detectThreats(icfg, standardizedText, options = {}) {
    if (!this.options.enableThreatDetection) return [];
    
    console.log('[LLM-ANALYZER] Detectando ameaças...');
    
    const prompt = this.buildThreatDetectionPrompt(standardizedText);
    
    try {
      const response = await this.callLLM(prompt, {
        model: this.options.model,
        temperature: 0.1,
        maxTokens: 2500
      });
      
      return this.parseThreatDetectionResponse(response);
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na detecção de ameaças:', error);
      return this.fallbackThreatDetection(icfg);
    }
  }

  /**
   * Análise comportamental
   */
  async analyzeBehavior(icfg, standardizedText, options = {}) {
    if (!this.options.enableBehaviorAnalysis) return {};
    
    console.log('[LLM-ANALYZER] Analisando comportamento...');
    
    const prompt = this.buildBehaviorAnalysisPrompt(standardizedText);
    
    try {
      const response = await this.callLLM(prompt, {
        model: this.options.model,
        temperature: 0.2,
        maxTokens: 2000
      });
      
      return this.parseBehaviorAnalysisResponse(response);
      
    } catch (error) {
      console.error('[LLM-ANALYZER] Erro na análise comportamental:', error);
      return this.fallbackBehaviorAnalysis(icfg);
    }
  }

  /**
   * Métodos auxiliares para formatação
   */
  formatNodeForLLM(node) {
    let text = `Node: ${node.id}\n`;
    text += `  Type: ${node.type}\n`;
    text += `  Name: ${node.name || 'unnamed'}\n`;
    
    if (node.parameters) {
      text += `  Parameters: ${node.parameters.map(p => p.type || 'unknown').join(', ')}\n`;
    }
    
    if (node.returnType) {
      text += `  Return Type: ${node.returnType}\n`;
    }
    
    if (node.complexity) {
      text += `  Complexity: ${node.complexity}\n`;
    }
    
    if (node.metadata) {
      text += `  Metadata: ${JSON.stringify(node.metadata)}\n`;
    }
    
    text += `\n`;
    return text;
  }

  formatEdgeForLLM(edge) {
    let text = `Edge: ${edge.source} -> ${edge.target}\n`;
    text += `  Type: ${edge.type}\n`;
    text += `  Weight: ${edge.weight || 1}\n`;
    
    if (edge.metadata) {
      text += `  Metadata: ${JSON.stringify(edge.metadata)}\n`;
    }
    
    text += `\n`;
    return text;
  }

  formatInteractionsForLLM(metadata) {
    let text = '';
    
    if (metadata.asyncInteractions) {
      text += `Async Interactions: ${metadata.asyncInteractions.size}\n`;
    }
    
    if (metadata.syncInteractions) {
      text += `Sync Interactions: ${metadata.syncInteractions.size}\n`;
    }
    
    return text;
  }

  formatPatternsForLLM(icfg) {
    let text = '';
    
    // Identificar padrões comuns
    const patterns = this.identifyCommonPatterns(icfg);
    
    for (const pattern of patterns) {
      text += `Pattern: ${pattern.type}\n`;
      text += `  Description: ${pattern.description}\n`;
      text += `  Occurrences: ${pattern.occurrences}\n`;
      text += `  Risk Level: ${pattern.riskLevel}\n\n`;
    }
    
    return text;
  }

  /**
   * Métodos auxiliares para LLM
   */
  async callLLM(prompt, options = {}) {
    // Implementação simulada - integrar com provedor real
    console.log('[LLM-ANALYZER] Chamando LLM...');
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar resposta simulada baseada no prompt
    return this.generateMockResponse(prompt, options);
  }

  generateMockResponse(prompt, options) {
    // Gerar resposta simulada baseada no tipo de prompt
    if (prompt.includes('classification')) {
      return this.generateMockClassificationResponse();
    } else if (prompt.includes('explanation')) {
      return this.generateMockExplanationResponse();
    } else if (prompt.includes('path')) {
      return this.generateMockPathAnalysisResponse();
    } else if (prompt.includes('threat')) {
      return this.generateMockThreatDetectionResponse();
    } else {
      return this.generateMockBehaviorAnalysisResponse();
    }
  }

  generateMockClassificationResponse() {
    const isMalicious = Math.random() > 0.5;
    const confidence = 0.6 + Math.random() * 0.3; // 0.6-0.9
    
    return {
      label: isMalicious ? 'malicious' : 'benign',
      confidence: confidence,
      reasoning: isMalicious ? 
        'Detected suspicious patterns including obfuscated code and unusual control flow' :
        'Code appears to follow standard patterns with no malicious indicators'
    };
  }

  generateMockExplanationResponse() {
    return `The analysis identified several key factors that led to this classification:

1. Control Flow Patterns: The code exhibits complex control flow structures that may indicate obfuscation techniques.

2. Function Interactions: Multiple functions interact in ways that suggest potential malicious behavior.

3. Data Flow: Unusual data flow patterns detected that deviate from standard application behavior.

4. String Operations: Encrypted or obfuscated strings found that may hide malicious payloads.

5. WebAssembly Usage: Heavy use of WebAssembly modules that could be used to hide malicious functionality.

These factors combined suggest a high probability of malicious intent.`;
  }

  generateMockPathAnalysisResponse() {
    return [
      {
        path: 'entry -> function1 -> function2 -> wasm_call',
        risk: 'high',
        description: 'Direct path to WebAssembly execution',
        indicators: ['wasm_instantiate', 'memory_access', 'table_operations']
      },
      {
        path: 'event_listener -> async_function -> network_call',
        risk: 'medium',
        description: 'Asynchronous network communication',
        indicators: ['websocket', 'fetch', 'xmlhttprequest']
      }
    ];
  }

  generateMockThreatDetectionResponse() {
    return [
      {
        type: 'cryptocurrency_mining',
        confidence: 0.85,
        indicators: ['hash_calculation', 'worker_threads', 'cpu_intensive'],
        description: 'Patterns consistent with cryptocurrency mining operations'
      },
      {
        type: 'data_exfiltration',
        confidence: 0.72,
        indicators: ['network_requests', 'data_encoding', 'stealth_communication'],
        description: 'Potential data exfiltration through encoded network requests'
      }
    ];
  }

  generateMockBehaviorAnalysisResponse() {
    return {
      resourceUsage: {
        cpuIntensive: true,
        memoryIntensive: false,
        networkIntensive: true
      },
      behaviorPatterns: {
        stealthy: true,
        persistent: false,
        evasive: true
      },
      riskFactors: [
        'High CPU utilization patterns',
        'Stealthy execution methods',
        'Potential evasion techniques'
      ]
    };
  }

  /**
   * Parsers de resposta
   */
  parseClassificationResponse(response) {
    return {
      label: response.label || 'unknown',
      confidence: response.confidence || 0,
      reasoning: response.reasoning || 'No reasoning provided'
    };
  }

  parseExplanationResponse(response) {
    return response || 'No explanation available';
  }

  parsePathAnalysisResponse(response) {
    return Array.isArray(response) ? response : [];
  }

  parseThreatDetectionResponse(response) {
    return Array.isArray(response) ? response : [];
  }

  parseBehaviorAnalysisResponse(response) {
    return response || {};
  }

  /**
   * Métodos de fallback
   */
  fallbackClassification(standardizedText) {
    // Classificação baseada em heurísticas simples
    const suspiciousPatterns = [
      'wasm', 'worker', 'websocket', 'crypto', 'hash',
      'obfuscated', 'encoded', 'encrypted'
    ];
    
    let suspiciousCount = 0;
    for (const pattern of suspiciousPatterns) {
      if (standardizedText.toLowerCase().includes(pattern)) {
        suspiciousCount++;
      }
    }
    
    const confidence = Math.min(suspiciousCount / suspiciousPatterns.length, 1);
    const isMalicious = suspiciousCount > suspiciousPatterns.length / 2;
    
    return {
      label: isMalicious ? 'malicious' : 'benign',
      confidence: confidence,
      reasoning: `Heuristic analysis found ${suspiciousCount} suspicious patterns`
    };
  }

  generateFallbackExplanation(classification) {
    return `Fallback analysis based on heuristic patterns. Classification: ${classification.label} with ${(classification.confidence * 100).toFixed(1)}% confidence.`;
  }

  fallbackPathAnalysis(icfg) {
    // Análise de caminhos baseada em heurísticas
    const paths = [];
    
    // Encontrar caminhos que terminam em operações suspeitas
    for (const edge of icfg.edges) {
      if (edge.type.includes('wasm') || edge.type.includes('network')) {
        paths.push({
          path: `${edge.source} -> ${edge.target}`,
          risk: 'medium',
          description: `Path involving ${edge.type}`,
          indicators: [edge.type]
        });
      }
    }
    
    return paths;
  }

  fallbackThreatDetection(icfg) {
    // Detecção de ameaças baseada em heurísticas
    const threats = [];
    
    // Verificar padrões suspeitos
    for (const [nodeId, node] of icfg.nodes) {
      if (node.type.includes('wasm') && node.complexity > 5) {
        threats.push({
          type: 'suspicious_wasm',
          confidence: 0.6,
          indicators: ['wasm_function', 'high_complexity'],
          description: 'Complex WebAssembly function detected'
        });
      }
    }
    
    return threats;
  }

  fallbackBehaviorAnalysis(icfg) {
    // Análise comportamental baseada em heurísticas
    return {
      resourceUsage: {
        cpuIntensive: false,
        memoryIntensive: false,
        networkIntensive: false
      },
      behaviorPatterns: {
        stealthy: false,
        persistent: false,
        evasive: false
      },
      riskFactors: []
    };
  }

  /**
   * Métodos auxiliares
   */
  getNodeTypes(nodes) {
    const types = new Set();
    for (const [nodeId, node] of nodes) {
      types.add(node.type);
    }
    return Array.from(types).join(', ');
  }

  identifyCommonPatterns(icfg) {
    const patterns = [];
    
    // Padrão: WebAssembly + Worker
    let wasmWorkerCount = 0;
    for (const edge of icfg.edges) {
      if (edge.type.includes('wasm') && edge.type.includes('worker')) {
        wasmWorkerCount++;
      }
    }
    
    if (wasmWorkerCount > 0) {
      patterns.push({
        type: 'wasm_worker_pattern',
        description: 'WebAssembly functions executed in Web Workers',
        occurrences: wasmWorkerCount,
        riskLevel: 'high'
      });
    }
    
    // Padrão: Async + Network
    let asyncNetworkCount = 0;
    for (const edge of icfg.edges) {
      if (edge.type.includes('async') && edge.type.includes('network')) {
        asyncNetworkCount++;
      }
    }
    
    if (asyncNetworkCount > 0) {
      patterns.push({
        type: 'async_network_pattern',
        description: 'Asynchronous network operations',
        occurrences: asyncNetworkCount,
        riskLevel: 'medium'
      });
    }
    
    return patterns;
  }

  /**
   * Prompts para LLM
   */
  getClassificationPrompt() {
    return `Analyze the following Inter-Control Flow Graph (ICFG) and classify it as either 'malicious' or 'benign'. 

Consider the following factors:
1. Control flow patterns and complexity
2. Function interactions and dependencies
3. Data flow and variable usage
4. WebAssembly and Web Worker usage
5. Network communication patterns
6. String encoding and obfuscation
7. Resource usage patterns

Provide your classification with a confidence score (0-1) and brief reasoning.`;
  }

  getExplanationPrompt() {
    return `Based on the ICFG analysis and classification, provide a detailed explanation of:
1. Key factors that led to the classification
2. Specific patterns or behaviors identified
3. Risk indicators and their significance
4. Recommendations for further investigation

Focus on actionable insights that would help security analysts understand the threat.`;
  }

  getPathAnalysisPrompt() {
    return `Analyze the ICFG to identify critical execution paths that could lead to malicious behavior:

1. Identify high-risk paths from entry points to sensitive operations
2. Highlight paths involving WebAssembly, Web Workers, or network operations
3. Assess the risk level of each path
4. Identify key indicators along each path

Provide a list of critical paths with risk assessments.`;
  }

  getThreatDetectionPrompt() {
    return `Analyze the ICFG for specific threat indicators:

1. Cryptocurrency mining patterns
2. Data exfiltration techniques
3. Command and control communication
4. Stealth and evasion techniques
5. Resource abuse patterns

For each threat type detected, provide:
- Threat type and confidence level
- Specific indicators found
- Description of the threat behavior`;
  }

  buildClassificationPrompt(standardizedText) {
    return `${this.getClassificationPrompt()}

ICFG Analysis:
${standardizedText}

Classification:`;
  }

  buildExplanationPrompt(standardizedText, classification) {
    return `${this.getExplanationPrompt()}

ICFG Analysis:
${standardizedText}

Classification: ${classification.label} (${(classification.confidence * 100).toFixed(1)}%)

Explanation:`;
  }

  buildPathAnalysisPrompt(standardizedText) {
    return `${this.getPathAnalysisPrompt()}

ICFG Analysis:
${standardizedText}

Critical Paths:`;
  }

  buildThreatDetectionPrompt(standardizedText) {
    return `${this.getThreatDetectionPrompt()}

ICFG Analysis:
${standardizedText}

Threat Indicators:`;
  }

  buildBehaviorAnalysisPrompt(standardizedText) {
    return `Analyze the behavioral patterns in the ICFG:

1. Resource usage patterns (CPU, memory, network)
2. Execution behavior (stealthy, persistent, evasive)
3. Risk factors and concerning patterns

ICFG Analysis:
${standardizedText}

Behavioral Analysis:`;
  }

  /**
   * Salvar resultados da análise
   */
  saveAnalysisResults(results, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  }

  /**
   * Exportar relatório de análise
   */
  exportAnalysisReport(results, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'markdown':
        return this.exportToMarkdown(results);
      
      case 'html':
        return this.exportToHTML(results);
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  exportToMarkdown(results) {
    let markdown = '# LLM Semantic Analysis Report\n\n';
    
    markdown += `## Classification\n`;
    markdown += `- **Label**: ${results.classification.label}\n`;
    markdown += `- **Confidence**: ${(results.classification.confidence * 100).toFixed(1)}%\n`;
    markdown += `- **Reasoning**: ${results.classification.reasoning}\n\n`;
    
    markdown += `## Explanation\n`;
    markdown += `${results.explanation}\n\n`;
    
    markdown += `## Critical Paths\n`;
    for (const path of results.criticalPaths) {
      markdown += `- **Path**: ${path.path}\n`;
      markdown += `  - Risk: ${path.risk}\n`;
      markdown += `  - Description: ${path.description}\n\n`;
    }
    
    markdown += `## Threat Indicators\n`;
    for (const threat of results.threatIndicators) {
      markdown += `- **Type**: ${threat.type}\n`;
      markdown += `  - Confidence: ${(threat.confidence * 100).toFixed(1)}%\n`;
      markdown += `  - Description: ${threat.description}\n\n`;
    }
    
    return markdown;
  }

  exportToHTML(results) {
    // Implementação simplificada de exportação HTML
    return `<!DOCTYPE html>
<html>
<head>
    <title>LLM Analysis Report</title>
</head>
<body>
    <h1>LLM Semantic Analysis Report</h1>
    <p>Classification: ${results.classification.label}</p>
    <p>Confidence: ${(results.classification.confidence * 100).toFixed(1)}%</p>
</body>
</html>`;
  }
}

module.exports = { LLMSemanticAnalyzer };
