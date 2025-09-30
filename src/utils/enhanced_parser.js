const fs = require('fs');
const path = require('path');

class EnhancedCodeAnalyzer {
  constructor() {
    this.obfuscationPatterns = {
      // Padrões existentes melhorados
      minified: {
        name: 'Minified Code',
        patterns: [
          /[a-zA-Z_$][a-zA-Z0-9_$]{0,1}\s*[=\(]/g, // Variáveis de 1-2 caracteres
          /function\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*\(/g, // Funções com nomes curtos
          /var\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações var com nomes curtos
          /let\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações let com nomes curtos
          /const\s+[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=/g, // Declarações const com nomes curtos
        ],
        threshold: 0.3
      },
      
      packed: {
        name: 'Packed Code',
        patterns: [
          /eval\s*\(/g, // Uso de eval
          /Function\s*\(/g, // Uso de Function constructor
          /atob\s*\(/g, // Decodificação base64
          /btoa\s*\(/g, // Codificação base64
          /String\.fromCharCode\s*\(/g, // Conversão de códigos de caractere
          /unescape\s*\(/g, // Unescape
          /decodeURIComponent\s*\(/g, // Decodificação URI
        ],
        threshold: 0.1
      },
      
      encoded: {
        name: 'Encoded Strings',
        patterns: [
          /\\x[0-9a-fA-F]{2}/g, // Hex encoding
          /\\u[0-9a-fA-F]{4}/g, // Unicode encoding
          /\\[0-7]{1,3}/g, // Octal encoding
          /String\.fromCharCode\s*\([^)]+\)/g, // CharCode encoding
        ],
        threshold: 0.2
      },
      
      controlFlow: {
        name: 'Control Flow Obfuscation',
        patterns: [
          /while\s*\(\s*true\s*\)/g, // Loops infinitos
          /for\s*\(\s*;\s*;\s*\)/g, // Loops infinitos
          /switch\s*\([^)]+\)\s*\{[^}]*default[^}]*\}/g, // Switch statements complexos
          /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/g, // Try-catch aninhados
        ],
        threshold: 0.05
      },
      
      stringArray: {
        name: 'String Array Obfuscation',
        patterns: [
          /var\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\[[^\]]*\]/g, // Arrays de strings
          /\[[^\]]*\]\s*\[[^\]]*\]/g, // Acesso a arrays
          /split\s*\([^)]*\)/g, // Split operations
          /join\s*\([^)]*\)/g, // Join operations
        ],
        threshold: 0.15
      },

      // NOVOS PADRÕES ADICIONADOS:

      // 1. Dead Code Injection
      deadCode: {
        name: 'Dead Code Injection',
        patterns: [
          /if\s*\(\s*false\s*\)\s*\{[^}]*\}/g, // Blocos if(false)
          /if\s*\(\s*0\s*\)\s*\{[^}]*\}/g, // Blocos if(0)
          /if\s*\(\s*!1\s*\)\s*\{[^}]*\}/g, // Blocos if(!1)
          /if\s*\(\s*!true\s*\)\s*\{[^}]*\}/g, // Blocos if(!true)
          /while\s*\(\s*false\s*\)\s*\{[^}]*\}/g, // Loops while(false)
          /for\s*\(\s*[^;]*;\s*false\s*;\s*[^)]*\)\s*\{[^}]*\}/g, // Loops for com condição false
        ],
        threshold: 0.02
      },

      // 2. Variable Name Mangling
      nameMangling: {
        name: 'Variable Name Mangling',
        patterns: [
          /[a-zA-Z_$][a-zA-Z0-9_$]*_[0-9]+/g, // Nomes com sufixos numéricos
          /[a-zA-Z_$][a-zA-Z0-9_$]*\$\d+/g, // Nomes com $ e números
          /[a-zA-Z_$][a-zA-Z0-9_$]*__[a-zA-Z0-9_$]+/g, // Nomes com duplo underscore
          /[a-zA-Z_$][a-zA-Z0-9_$]*\$\$[a-zA-Z0-9_$]+/g, // Nomes com $$ duplo
          /[a-zA-Z_$][a-zA-Z0-9_$]*_[a-zA-Z0-9_$]*_[a-zA-Z0-9_$]*/g, // Nomes com múltiplos underscores
        ],
        threshold: 0.2
      },

      // 3. Expression Obfuscation
      expressionObfuscation: {
        name: 'Expression Obfuscation',
        patterns: [
          /\+[+\s]*\+/g, // ++ operadores
          /-[-\s]*-/g, // -- operadores
          /!\s*![^=]/g, // !! operadores
          /~\s*~/g, // ~~ operadores
          /void\s*0/g, // void 0
          /void\s*\([^)]*\)/g, // void expressions
          /typeof\s+typeof/g, // typeof typeof
          /\([^)]*\)\s*\(\s*\)/g, // IIFE patterns
        ],
        threshold: 0.1
      },

      // 4. String Concatenation Obfuscation
      stringConcatObfuscation: {
        name: 'String Concatenation Obfuscation',
        patterns: [
          /"[^"]*"\s*\+\s*"[^"]*"/g, // String + String
          /'[^']*'\s*\+\s*'[^']*'/g, // String + String (single quotes)
          /"[^"]*"\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, // String + Variable
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*\+\s*"[^"]*"/g, // Variable + String
          /String\s*\(\s*[^)]+\s*\)\s*\+\s*String\s*\(\s*[^)]+\s*\)/g, // String() + String()
        ],
        threshold: 0.15
      },

      // 5. Number Obfuscation
      numberObfuscation: {
        name: 'Number Obfuscation',
        patterns: [
          /0x[0-9a-fA-F]+/g, // Hexadecimal numbers
          /0o[0-7]+/g, // Octal numbers
          /0b[01]+/g, // Binary numbers
          /Math\.floor\s*\(\s*Math\.random\s*\(\s*\)\s*\*\s*\d+\s*\)/g, // Random number generation
          /parseInt\s*\(\s*[^,)]+\s*,\s*\d+\s*\)/g, // parseInt with radix
          /Number\s*\(\s*[^)]+\s*\)/g, // Number() constructor
        ],
        threshold: 0.1
      },

      // 6. Function Wrapping
      functionWrapping: {
        name: 'Function Wrapping',
        patterns: [
          /\(function\s*\(\s*[^)]*\s*\)\s*\{[^}]*\}\s*\(\s*[^)]*\s*\)\)/g, // IIFE
          /\(function\s*\(\s*[^)]*\s*\)\s*\{[^}]*\}\s*\(\s*[^)]*\s*\)\s*\)/g, // IIFE with parentheses
          /\(\s*function\s*\(\s*[^)]*\s*\)\s*\{[^}]*\}\s*\(\s*[^)]*\s*\)\s*\)/g, // IIFE with spaces
          /\([^)]*\)\s*=>\s*\{[^}]*\}/g, // Arrow functions
          /\([^)]*\)\s*=>\s*[^{][^;]*;?/g, // Arrow functions (single expression)
        ],
        threshold: 0.2
      },

      // 7. Object Property Obfuscation
      objectPropertyObfuscation: {
        name: 'Object Property Obfuscation',
        patterns: [
          /\[[^[\]]*\]\s*:/g, // Computed property names
          /\["[^"]*"\]/g, // String property access
          /\['[^']*'\]/g, // String property access (single quotes)
          /\[[a-zA-Z_$][a-zA-Z0-9_$]*\]/g, // Variable property access
          /Object\.keys\s*\([^)]+\)/g, // Object.keys()
          /Object\.values\s*\([^)]+\)/g, // Object.values()
          /Object\.entries\s*\([^)]+\)/g, // Object.entries()
        ],
        threshold: 0.1
      },

      // 8. Array Obfuscation
      arrayObfuscation: {
        name: 'Array Obfuscation',
        patterns: [
          /Array\s*\(\s*\d+\s*\)/g, // Array constructor
          /new\s+Array\s*\([^)]*\)/g, // New Array constructor
          /\[[^\]]*\]\s*\.\s*map\s*\(/g, // Array.map()
          /\[[^\]]*\]\s*\.\s*filter\s*\(/g, // Array.filter()
          /\[[^\]]*\]\s*\.\s*reduce\s*\(/g, // Array.reduce()
          /\[[^\]]*\]\s*\.\s*forEach\s*\(/g, // Array.forEach()
          /\[[^\]]*\]\s*\.\s*splice\s*\(/g, // Array.splice()
        ],
        threshold: 0.1
      },

      // 9. Regular Expression Obfuscation
      regexObfuscation: {
        name: 'Regular Expression Obfuscation',
        patterns: [
          /new\s+RegExp\s*\([^)]+\)/g, // RegExp constructor
          /RegExp\s*\([^)]+\)/g, // RegExp function
          /\/[^\/\n]+\/[gimuy]*/g, // Regex literals
          /test\s*\([^)]+\)/g, // .test() method
          /exec\s*\([^)]+\)/g, // .exec() method
          /match\s*\([^)]+\)/g, // .match() method
          /replace\s*\([^)]+\)/g, // .replace() method
        ],
        threshold: 0.05
      },

      // 10. Date/Time Obfuscation
      dateTimeObfuscation: {
        name: 'Date/Time Obfuscation',
        patterns: [
          /new\s+Date\s*\([^)]*\)/g, // Date constructor
          /Date\.now\s*\(\s*\)/g, // Date.now()
          /getTime\s*\(\s*\)/g, // .getTime()
          /setTimeout\s*\([^)]+\)/g, // setTimeout
          /setInterval\s*\([^)]+\)/g, // setInterval
          /clearTimeout\s*\([^)]+\)/g, // clearTimeout
          /clearInterval\s*\([^)]+\)/g, // clearInterval
        ],
        threshold: 0.05
      },

      // 11. Math Obfuscation
      mathObfuscation: {
        name: 'Math Obfuscation',
        patterns: [
          /Math\.floor\s*\([^)]+\)/g, // Math.floor()
          /Math\.ceil\s*\([^)]+\)/g, // Math.ceil()
          /Math\.round\s*\([^)]+\)/g, // Math.round()
          /Math\.random\s*\(\s*\)/g, // Math.random()
          /Math\.abs\s*\([^)]+\)/g, // Math.abs()
          /Math\.max\s*\([^)]+\)/g, // Math.max()
          /Math\.min\s*\([^)]+\)/g, // Math.min()
          /Math\.pow\s*\([^)]+\)/g, // Math.pow()
        ],
        threshold: 0.1
      },

      // 12. JSON Obfuscation
      jsonObfuscation: {
        name: 'JSON Obfuscation',
        patterns: [
          /JSON\.parse\s*\([^)]+\)/g, // JSON.parse()
          /JSON\.stringify\s*\([^)]+\)/g, // JSON.stringify()
          /JSON\.stringify\s*\([^,)]+,\s*[^,)]+,\s*[^)]+\)/g, // JSON.stringify with replacer and space
        ],
        threshold: 0.05
      },

      // 13. Promise/Async Obfuscation
      promiseObfuscation: {
        name: 'Promise/Async Obfuscation',
        patterns: [
          /new\s+Promise\s*\([^)]+\)/g, // Promise constructor
          /Promise\.resolve\s*\([^)]+\)/g, // Promise.resolve()
          /Promise\.reject\s*\([^)]+\)/g, // Promise.reject()
          /Promise\.all\s*\([^)]+\)/g, // Promise.all()
          /Promise\.race\s*\([^)]+\)/g, // Promise.race()
          /async\s+function/g, // async function
          /await\s+[a-zA-Z_$]/g, // await expression
        ],
        threshold: 0.05
      },

      // 14. Module/Import Obfuscation
      moduleObfuscation: {
        name: 'Module/Import Obfuscation',
        patterns: [
          /import\s+[^;]+;?/g, // ES6 imports
          /export\s+[^;]+;?/g, // ES6 exports
          /require\s*\([^)]+\)/g, // CommonJS require
          /module\.exports\s*=/g, // CommonJS exports
          /exports\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/g, // CommonJS exports
          /define\s*\([^)]+\)/g, // AMD define
        ],
        threshold: 0.05
      },

      // 15. DOM Manipulation Obfuscation
      domObfuscation: {
        name: 'DOM Manipulation Obfuscation',
        patterns: [
          /document\.getElementById\s*\([^)]+\)/g, // getElementById
          /document\.querySelector\s*\([^)]+\)/g, // querySelector
          /document\.querySelectorAll\s*\([^)]+\)/g, // querySelectorAll
          /document\.createElement\s*\([^)]+\)/g, // createElement
          /addEventListener\s*\([^)]+\)/g, // addEventListener
          /removeEventListener\s*\([^)]+\)/g, // removeEventListener
          /setAttribute\s*\([^)]+\)/g, // setAttribute
          /getAttribute\s*\([^)]+\)/g, // getAttribute
        ],
        threshold: 0.05
      },

      // 16. Network/Fetch Obfuscation
      networkObfuscation: {
        name: 'Network/Fetch Obfuscation',
        patterns: [
          /fetch\s*\([^)]+\)/g, // fetch API
          /XMLHttpRequest\s*\(\s*\)/g, // XMLHttpRequest
          /new\s+XMLHttpRequest\s*\(\s*\)/g, // new XMLHttpRequest
          /open\s*\([^)]+\)/g, // .open() method
          /send\s*\([^)]*\)/g, // .send() method
          /onreadystatechange\s*=/g, // onreadystatechange
          /responseText/g, // responseText
          /responseJSON/g, // responseJSON
        ],
        threshold: 0.05
      },

      // 17. Error Handling Obfuscation
      errorHandlingObfuscation: {
        name: 'Error Handling Obfuscation',
        patterns: [
          /throw\s+new\s+Error\s*\([^)]+\)/g, // throw new Error()
          /throw\s+[a-zA-Z_$][a-zA-Z0-9_$]*/g, // throw variable
          /catch\s*\(\s*[^)]+\s*\)\s*\{[^}]*\}/g, // catch blocks
          /finally\s*\{[^}]*\}/g, // finally blocks
          /Error\s*\(\s*[^)]+\s*\)/g, // Error constructor
          /TypeError\s*\(\s*[^)]+\s*\)/g, // TypeError constructor
          /ReferenceError\s*\(\s*[^)]+\s*\)/g, // ReferenceError constructor
        ],
        threshold: 0.05
      },

      // 18. Bitwise Operations Obfuscation
      bitwiseObfuscation: {
        name: 'Bitwise Operations Obfuscation',
        patterns: [
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*&\s*[a-zA-Z_$0-9]+/g, // Bitwise AND
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*\|\s*[a-zA-Z_$0-9]+/g, // Bitwise OR
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*\^\s*[a-zA-Z_$0-9]+/g, // Bitwise XOR
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*<<\s*[a-zA-Z_$0-9]+/g, // Left shift
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*>>\s*[a-zA-Z_$0-9]+/g, // Right shift
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*>>>\s*[a-zA-Z_$0-9]+/g, // Unsigned right shift
          /~\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, // Bitwise NOT
        ],
        threshold: 0.1
      },

      // 19. Logical Operations Obfuscation
      logicalObfuscation: {
        name: 'Logical Operations Obfuscation',
        patterns: [
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*&&\s*[a-zA-Z_$0-9]+/g, // Logical AND
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*\|\|\s*[a-zA-Z_$0-9]+/g, // Logical OR
          /[a-zA-Z_$][a-zA-Z0-9_$]*\s*\?\s*[^:]*\s*:/g, // Ternary operator
          /!\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, // Logical NOT
          /!!\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, // Double logical NOT
        ],
        threshold: 0.15
      },

      // 20. Advanced String Manipulation
      advancedStringManipulation: {
        name: 'Advanced String Manipulation',
        patterns: [
          /substring\s*\([^)]+\)/g, // substring()
          /substr\s*\([^)]+\)/g, // substr()
          /slice\s*\([^)]+\)/g, // slice()
          /indexOf\s*\([^)]+\)/g, // indexOf()
          /lastIndexOf\s*\([^)]+\)/g, // lastIndexOf()
          /charAt\s*\([^)]+\)/g, // charAt()
          /charCodeAt\s*\([^)]+\)/g, // charCodeAt()
          /toLowerCase\s*\(\s*\)/g, // toLowerCase()
          /toUpperCase\s*\(\s*\)/g, // toUpperCase()
        ],
        threshold: 0.1
      }
    };
  }

  // Métodos de análise (mantendo os existentes e adicionando novos)
  analyzeJavaScript(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = {
        filePath,
        size: content.length,
        lines: content.split('\n').length,
        obfuscation: this.detectObfuscation(content),
        metrics: this.calculateMetrics(content),
        suggestions: []
      };

      analysis.suggestions = this.generateSuggestions(analysis.obfuscation, analysis.metrics);
      return analysis;
    } catch (error) {
      return {
        filePath,
        error: error.message,
        obfuscation: {},
        metrics: {},
        suggestions: []
      };
    }
  }

  detectObfuscation(content) {
    const results = {};
    
    for (const [type, config] of Object.entries(this.obfuscationPatterns)) {
      let totalMatches = 0;
      let patternCounts = {};
      
      for (const pattern of config.patterns) {
        const matches = content.match(pattern) || [];
        patternCounts[pattern.toString()] = matches.length;
        totalMatches += matches.length;
      }
      
      const totalTokens = this.countTokens(content);
      const obfuscationScore = totalTokens > 0 ? totalMatches / totalTokens : 0;
      
      results[type] = {
        detected: obfuscationScore >= config.threshold,
        score: obfuscationScore,
        threshold: config.threshold,
        matches: totalMatches,
        patternCounts,
        confidence: Math.min(obfuscationScore / config.threshold, 1.0)
      };
    }
    
    return results;
  }

  calculateMetrics(content) {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      totalCharacters: content.length,
      averageLineLength: content.length / lines.length,
      commentRatio: this.calculateCommentRatio(content),
      complexity: this.calculateComplexity(content),
      variableNaming: this.analyzeVariableNaming(content),
      functionNaming: this.analyzeFunctionNaming(content)
    };
  }

  calculateCommentRatio(content) {
    const commentPatterns = [
      /\/\/.*$/gm,
      /\/\*[\s\S]*?\*\//g
    ];
    
    let commentChars = 0;
    for (const pattern of commentPatterns) {
      const matches = content.match(pattern) || [];
      commentChars += matches.join('').length;
    }
    
    return content.length > 0 ? commentChars / content.length : 0;
  }

  calculateComplexity(content) {
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /try\s*\{/g,
      /function\s+/g,
      /=>\s*/g
    ];
    
    let complexity = 0;
    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    }
    
    return complexity;
  }

  analyzeVariableNaming(content) {
    const varPatterns = [
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];
    
    const variables = [];
    for (const pattern of varPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        variables.push(match[1]);
      }
    }
    
    const shortNames = variables.filter(name => name.length <= 2);
    const camelCase = variables.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name));
    const snakeCase = variables.filter(name => /^[a-z][a-z0-9_]*$/.test(name));
    
    return {
      total: variables.length,
      shortNames: shortNames.length,
      camelCase: camelCase.length,
      snakeCase: snakeCase.length,
      shortNameRatio: variables.length > 0 ? shortNames.length / variables.length : 0
    };
  }

  analyzeFunctionNaming(content) {
    const funcPatterns = [
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g
    ];
    
    const functions = [];
    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push(match[1]);
      }
    }
    
    const shortNames = functions.filter(name => name.length <= 2);
    const camelCase = functions.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name));
    
    return {
      total: functions.length,
      shortNames: shortNames.length,
      camelCase: camelCase.length,
      shortNameRatio: functions.length > 0 ? shortNames.length / functions.length : 0
    };
  }

  countTokens(content) {
    const tokens = content.match(/\b\w+\b|[^\w\s]/g) || [];
    return tokens.length;
  }

  generateSuggestions(obfuscation, metrics) {
    const suggestions = [];
    
    for (const [type, result] of Object.entries(obfuscation)) {
      if (result.detected) {
        switch (type) {
          case 'deadCode':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'high',
              message: 'Código morto detectado. Pode ser usado para confundir análise estática.',
              action: 'remove_dead_code'
            });
            break;
          case 'nameMangling':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Nomes de variáveis ofuscados detectados. Considere renomear para melhor legibilidade.',
              action: 'rename_mangled_variables'
            });
            break;
          case 'expressionObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Expressões ofuscadas detectadas. Considere simplificar operações complexas.',
              action: 'simplify_expressions'
            });
            break;
          case 'stringConcatObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Concatenação de strings complexa detectada. Considere simplificar.',
              action: 'simplify_string_concat'
            });
            break;
          case 'numberObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Números ofuscados detectados. Considere converter para formato decimal.',
              action: 'normalize_numbers'
            });
            break;
          case 'functionWrapping':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Funções empacotadas detectadas. Considere desempacotar IIFEs.',
              action: 'unwrap_functions'
            });
            break;
          case 'objectPropertyObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Propriedades de objeto ofuscadas detectadas. Considere simplificar acesso.',
              action: 'simplify_object_access'
            });
            break;
          case 'arrayObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Manipulação de arrays complexa detectada. Considere simplificar operações.',
              action: 'simplify_array_operations'
            });
            break;
          case 'regexObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Expressões regulares complexas detectadas. Considere documentar padrões.',
              action: 'document_regex_patterns'
            });
            break;
          case 'dateTimeObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Manipulação de data/hora detectada. Pode ser usado para timing attacks.',
              action: 'analyze_timing_operations'
            });
            break;
          case 'mathObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Operações matemáticas complexas detectadas. Considere simplificar cálculos.',
              action: 'simplify_math_operations'
            });
            break;
          case 'jsonObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Manipulação de JSON detectada. Considere validar dados.',
              action: 'validate_json_operations'
            });
            break;
          case 'promiseObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Operações assíncronas complexas detectadas. Considere simplificar promises.',
              action: 'simplify_promises'
            });
            break;
          case 'moduleObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Importações/exportações complexas detectadas. Considere simplificar módulos.',
              action: 'simplify_modules'
            });
            break;
          case 'domObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Manipulação de DOM complexa detectada. Considere simplificar seletores.',
              action: 'simplify_dom_operations'
            });
            break;
          case 'networkObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'high',
              message: 'Operações de rede detectadas. Pode ser usado para comunicação maliciosa.',
              action: 'analyze_network_operations'
            });
            break;
          case 'errorHandlingObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Tratamento de erro complexo detectado. Considere simplificar error handling.',
              action: 'simplify_error_handling'
            });
            break;
          case 'bitwiseObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'medium',
              message: 'Operações bitwise detectadas. Pode ser usado para ofuscação avançada.',
              action: 'analyze_bitwise_operations'
            });
            break;
          case 'logicalObfuscation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Operações lógicas complexas detectadas. Considere simplificar condições.',
              action: 'simplify_logical_operations'
            });
            break;
          case 'advancedStringManipulation':
            suggestions.push({
              type: 'deobfuscation',
              priority: 'low',
              message: 'Manipulação de strings avançada detectada. Considere simplificar operações.',
              action: 'simplify_string_operations'
            });
            break;
        }
      }
    }
    
    return suggestions;
  }

  // Métodos para análise de diretório e geração de relatórios (mantendo os existentes)
  analyzeDirectory(dirPath) {
    const results = {
      javascript: [],
      wasm: [],
      summary: {
        totalFiles: 0,
        obfuscatedFiles: 0,
        totalSize: 0,
        averageComplexity: 0
      }
    };

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          const subResults = this.analyzeDirectory(filePath);
          results.javascript.push(...subResults.javascript);
          results.wasm.push(...subResults.wasm);
        } else if (file.isFile()) {
          const ext = path.extname(file.name).toLowerCase();
          
          if (ext === '.js') {
            const analysis = this.analyzeJavaScript(filePath);
            results.javascript.push(analysis);
            
            results.summary.totalFiles++;
            results.summary.totalSize += analysis.size || 0;
            
            if (this.hasObfuscation(analysis.obfuscation)) {
              results.summary.obfuscatedFiles++;
            }
          }
        }
      }
      
      if (results.javascript.length > 0) {
        const totalComplexity = results.javascript.reduce((sum, file) => 
          sum + (file.metrics?.complexity || 0), 0);
        results.summary.averageComplexity = totalComplexity / results.javascript.length;
      }
      
    } catch (error) {
      console.error(`Erro ao analisar diretório ${dirPath}:`, error.message);
    }
    
    return results;
  }

  hasObfuscation(obfuscation) {
    return Object.values(obfuscation).some(result => result.detected);
  }

  generateReport(analysis) {
    const report = [];
    
    report.push('='.repeat(80));
    report.push('RELATÓRIO DE ANÁLISE DE CÓDIGO AVANÇADO');
    report.push('='.repeat(80));
    report.push('');
    
    // Resumo geral
    report.push('RESUMO GERAL:');
    report.push(`- Total de arquivos: ${analysis.summary.totalFiles}`);
    report.push(`- Arquivos ofuscados: ${analysis.summary.obfuscatedFiles}`);
    report.push(`- Tamanho total: ${(analysis.summary.totalSize / 1024).toFixed(2)} KB`);
    report.push(`- Complexidade média: ${analysis.summary.averageComplexity.toFixed(2)}`);
    report.push('');
    
    // Análise de arquivos JavaScript
    if (analysis.javascript.length > 0) {
      report.push('ARQUIVOS JAVASCRIPT:');
      report.push('-'.repeat(40));
      
      for (const file of analysis.javascript) {
        report.push(`\nArquivo: ${file.filePath}`);
        report.push(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
        report.push(`Linhas: ${file.lines}`);
        
        if (file.error) {
          report.push(`ERRO: ${file.error}`);
          continue;
        }
        
        // Mostrar ofuscação detectada
        const obfuscationTypes = Object.entries(file.obfuscation)
          .filter(([_, result]) => result.detected)
          .map(([type, result]) => `${type} (${(result.confidence * 100).toFixed(1)}%)`);
        
        if (obfuscationTypes.length > 0) {
          report.push(`Ofuscação detectada: ${obfuscationTypes.join(', ')}`);
        } else {
          report.push('Nenhuma ofuscação detectada');
        }
        
        // Mostrar métricas importantes
        if (file.metrics) {
          report.push(`Complexidade: ${file.metrics.complexity}`);
          report.push(`Proporção de comentários: ${(file.metrics.commentRatio * 100).toFixed(1)}%`);
          report.push(`Variáveis com nomes curtos: ${(file.metrics.variableNaming.shortNameRatio * 100).toFixed(1)}%`);
        }
        
        // Mostrar sugestões
        if (file.suggestions.length > 0) {
          report.push('Sugestões:');
          for (const suggestion of file.suggestions) {
            report.push(`  - [${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
          }
        }
      }
    }
    
    return report.join('\n');
  }
}

module.exports = { EnhancedCodeAnalyzer };
