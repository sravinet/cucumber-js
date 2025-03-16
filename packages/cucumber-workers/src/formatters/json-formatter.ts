/**
 * JSON formatter for Cucumber test results in Workers
 * 
 * This formatter provides JSON output compatible with Cucumber.js
 * for integration with reporting tools and CI systems.
 */

import { TestStatus, type StepResult, type ScenarioResult } from './basic-formatter.js';

/**
 * JSON formatter options
 */
export interface JsonFormatterOptions {
  /**
   * Output file path (optional in Workers environment)
   */
  outputFile?: string;
  
  /**
   * Whether to include source in the output
   */
  includeSource?: boolean;
  
  /**
   * Whether to include attachments in the output
   */
  includeAttachments?: boolean;
}

/**
 * JSON representation of a step
 */
interface JsonStep {
  keyword: string;
  name: string;
  line: number;
  match?: {
    location: string;
  };
  result: {
    status: string;
    duration?: number;
    error_message?: string;
  };
  embeddings?: Array<{
    data: string;
    mime_type: string;
    name?: string;
  }>;
}

/**
 * JSON representation of a scenario
 */
interface JsonScenario {
  id: string;
  keyword: string;
  name: string;
  description: string;
  line: number;
  type: string;
  tags: Array<{
    name: string;
    line: number;
  }>;
  steps: JsonStep[];
}

/**
 * JSON representation of a feature
 */
interface JsonFeature {
  uri: string;
  id: string;
  keyword: string;
  name: string;
  description: string;
  line: number;
  tags: Array<{
    name: string;
    line: number;
  }>;
  elements: JsonScenario[];
}

/**
 * Default output function that logs to console
 */
const defaultOutput = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

/**
 * Default file writer function (no-op in Workers environment)
 */
const defaultFileWriter = (_path: string, _content: string): void => {
  // No-op in Workers environment
};

/**
 * JSON formatter for Workers environment
 */
export class JsonFormatter {
  private features: Map<string, JsonFeature> = new Map();
  private startTime: number = 0;
  private endTime: number = 0;
  
  /**
   * Create a new JSON formatter
   * 
   * @param options - Formatter options
   * @param output - Output function
   * @param fileWriter - File writer function
   */
  constructor(
    private options: JsonFormatterOptions = { includeSource: false, includeAttachments: true },
    private output: (message: string) => void = defaultOutput,
    private fileWriter: (path: string, content: string) => void = defaultFileWriter
  ) {}
  
  /**
   * Start the test run
   */
  start(): void {
    this.startTime = Date.now();
    this.features = new Map();
  }
  
  /**
   * Add a scenario result
   * 
   * @param scenario - Scenario result to add
   */
  addScenario(scenario: ScenarioResult): void {
    const featureUri = scenario.featurePath;
    
    // Create or get the feature
    if (!this.features.has(featureUri)) {
      this.features.set(featureUri, {
        uri: featureUri,
        id: this.generateId(featureUri),
        keyword: 'Feature',
        name: this.extractFeatureName(featureUri),
        description: '',
        line: 1, // Default line number
        tags: [],
        elements: []
      });
    }
    
    const feature = this.features.get(featureUri)!;
    
    // Create the JSON scenario
    const jsonScenario: JsonScenario = {
      id: this.generateId(`${featureUri}:${scenario.line}`),
      keyword: 'Scenario',
      name: scenario.name,
      description: '',
      line: scenario.line,
      type: 'scenario',
      tags: [], // Tags would be populated from the actual Gherkin document
      steps: this.convertSteps(scenario.steps)
    };
    
    // Add the scenario to the feature
    feature.elements.push(jsonScenario);
  }
  
  /**
   * End the test run
   */
  end(): void {
    this.endTime = Date.now();
    
    // Convert the features map to an array
    const jsonOutput = Array.from(this.features.values());
    
    // Output the JSON
    const jsonString = JSON.stringify(jsonOutput, null, 2);
    
    // Write to file if specified
    if (this.options.outputFile) {
      this.fileWriter(this.options.outputFile, jsonString);
    }
    
    // Output to console
    this.output(jsonString);
  }
  
  /**
   * Convert step results to JSON steps
   * 
   * @param steps - Step results to convert
   * @returns JSON steps
   */
  private convertSteps(steps: StepResult[]): JsonStep[] {
    return steps.map((step, index) => {
      const jsonStep: JsonStep = {
        keyword: this.guessKeyword(step.text, index),
        name: step.text.trim(),
        line: 0, // Line numbers would be populated from the actual Gherkin document
        result: {
          status: this.convertStatus(step.status),
          duration: step.duration ? step.duration * 1000000 // Convert to nanoseconds for compatibility
            : undefined
        }
      };
      
      // Add error message if present
      if (step.error) {
        jsonStep.result.error_message = step.error;
      }
      
      return jsonStep;
    });
  }
  
  /**
   * Convert TestStatus to Cucumber.js status string
   * 
   * @param status - Test status
   * @returns Cucumber.js status string
   */
  private convertStatus(status: TestStatus): string {
    return status.toLowerCase();
  }
  
  /**
   * Guess the step keyword based on position and text
   * 
   * @param text - Step text
   * @param index - Step index
   * @returns Step keyword
   */
  private guessKeyword(text: string, index: number): string {
    if (index === 0) {
      return 'Given ';
    } else if (text.startsWith('Given ')) {
      return 'Given ';
    } else if (text.startsWith('When ')) {
      return 'When ';
    } else if (text.startsWith('Then ')) {
      return 'Then ';
    } else if (text.startsWith('And ')) {
      return 'And ';
    } else if (text.startsWith('But ')) {
      return 'But ';
    } else {
      return index === 1 ? 'When ' : 'Then ';
    }
  }
  
  /**
   * Generate a unique ID
   * 
   * @param seed - Seed for the ID
   * @returns Unique ID
   */
  private generateId(seed: string): string {
    // Simple hash function for demo purposes
    // In a real implementation, we would use a proper UUID generator
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${Math.abs(hash)}`;
  }
  
  /**
   * Extract feature name from URI
   * 
   * @param uri - Feature URI
   * @returns Feature name
   */
  private extractFeatureName(uri: string): string {
    // Extract the filename without extension
    const parts = uri.split('/');
    const filename = parts[parts.length - 1];
    const nameWithoutExtension = filename.replace(/\.feature$/, '');
    
    // Convert kebab-case to Title Case
    return nameWithoutExtension
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 