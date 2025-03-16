/**
 * Basic formatter for Cucumber test results in Workers
 * 
 * This formatter provides a simple output format for test results
 * that works in the Workers environment.
 */

/**
 * Test result status
 */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending',
  UNDEFINED = 'undefined',
  AMBIGUOUS = 'ambiguous'
}

/**
 * Step result
 */
export interface StepResult {
  /**
   * Text of the step
   */
  text: string;
  
  /**
   * Status of the step
   */
  status: TestStatus;
  
  /**
   * Error message if the step failed
   */
  error?: string;
  
  /**
   * Duration of the step in milliseconds
   */
  duration?: number;
}

/**
 * Scenario result
 */
export interface ScenarioResult {
  /**
   * Name of the scenario
   */
  name: string;
  
  /**
   * Feature file path
   */
  featurePath: string;
  
  /**
   * Line number in the feature file
   */
  line: number;
  
  /**
   * Status of the scenario
   */
  status: TestStatus;
  
  /**
   * Steps in the scenario
   */
  steps: StepResult[];
}

/**
 * Test run summary
 */
export interface TestSummary {
  /**
   * Total number of scenarios
   */
  total: number;
  
  /**
   * Number of passed scenarios
   */
  passed: number;
  
  /**
   * Number of failed scenarios
   */
  failed: number;
  
  /**
   * Number of skipped scenarios
   */
  skipped: number;
  
  /**
   * Number of pending scenarios
   */
  pending: number;
  
  /**
   * Duration of the test run in milliseconds
   */
  duration: number;
}

/**
 * Formatter options
 */
export interface FormatterOptions {
  /**
   * Whether to include colors in the output
   */
  colors?: boolean;
  
  /**
   * Whether to include step details in the output
   */
  showSteps?: boolean;
}

/**
 * Default output function that logs to console
 */
const defaultOutput = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

/**
 * Basic formatter for Workers environment
 */
export class BasicFormatter {
  private scenarios: ScenarioResult[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  
  /**
   * Create a new basic formatter
   * 
   * @param options - Formatter options
   * @param output - Output function
   */
  constructor(
    private options: FormatterOptions = { colors: true, showSteps: true },
    private output: (message: string) => void = defaultOutput
  ) {}
  
  /**
   * Start the test run
   */
  start(): void {
    this.startTime = Date.now();
    this.scenarios = [];
    this.output('Starting test run...\n');
  }
  
  /**
   * Add a scenario result
   * 
   * @param scenario - Scenario result to add
   */
  addScenario(scenario: ScenarioResult): void {
    this.scenarios.push(scenario);
    
    // Output scenario result
    const statusColor = this.getStatusColor(scenario.status);
    const statusText = this.getStatusText(scenario.status);
    
    this.output(`Scenario: ${scenario.name} - ${statusColor}${statusText}${this.resetColor()}`);
    this.output(`  at ${scenario.featurePath}:${scenario.line}`);
    
    // Output step results if enabled
    if (this.options.showSteps) {
      for (const step of scenario.steps) {
        const stepStatusColor = this.getStatusColor(step.status);
        const stepStatusText = this.getStatusText(step.status);
        
        this.output(`  ${step.text} - ${stepStatusColor}${stepStatusText}${this.resetColor()}`);
        
        if (step.status === TestStatus.FAILED && step.error) {
          this.output(`    ${step.error}`);
        }
      }
    }
    
    this.output('');
  }
  
  /**
   * End the test run
   */
  end(): void {
    this.endTime = Date.now();
    const summary = this.getSummary();
    
    this.output('\nTest run completed:');
    this.output(`  Total: ${summary.total}`);
    this.output(`  Passed: ${this.getStatusColor(TestStatus.PASSED)}${summary.passed}${this.resetColor()}`);
    this.output(`  Failed: ${this.getStatusColor(TestStatus.FAILED)}${summary.failed}${this.resetColor()}`);
    this.output(`  Skipped: ${this.getStatusColor(TestStatus.SKIPPED)}${summary.skipped}${this.resetColor()}`);
    this.output(`  Pending: ${this.getStatusColor(TestStatus.PENDING)}${summary.pending}${this.resetColor()}`);
    this.output(`  Duration: ${summary.duration}ms`);
    
    if (summary.failed > 0) {
      this.output(`\n${this.getStatusColor(TestStatus.FAILED)}Test run failed!${this.resetColor()}`);
    } else {
      this.output(`\n${this.getStatusColor(TestStatus.PASSED)}Test run passed!${this.resetColor()}`);
    }
  }
  
  /**
   * Get the test run summary
   * 
   * @returns Test run summary
   */
  getSummary(): TestSummary {
    const passed = this.scenarios.filter(s => s.status === TestStatus.PASSED).length;
    const failed = this.scenarios.filter(s => s.status === TestStatus.FAILED).length;
    const skipped = this.scenarios.filter(s => s.status === TestStatus.SKIPPED).length;
    const pending = this.scenarios.filter(s => s.status === TestStatus.PENDING).length;
    
    return {
      total: this.scenarios.length,
      passed,
      failed,
      skipped,
      pending,
      duration: this.endTime - this.startTime
    };
  }
  
  /**
   * Get the color code for a status
   * 
   * @param status - Test status
   * @returns ANSI color code
   */
  private getStatusColor(status: TestStatus): string {
    if (!this.options.colors) {
      return '';
    }
    
    switch (status) {
      case TestStatus.PASSED:
        return '\x1b[32m'; // Green
      case TestStatus.FAILED:
        return '\x1b[31m'; // Red
      case TestStatus.SKIPPED:
        return '\x1b[36m'; // Cyan
      case TestStatus.PENDING:
        return '\x1b[33m'; // Yellow
      case TestStatus.UNDEFINED:
        return '\x1b[35m'; // Magenta
      case TestStatus.AMBIGUOUS:
        return '\x1b[35m'; // Magenta
      default:
        return '';
    }
  }
  
  /**
   * Get the text representation of a status
   * 
   * @param status - Test status
   * @returns Status text
   */
  private getStatusText(status: TestStatus): string {
    return status.toUpperCase();
  }
  
  /**
   * Reset the color
   * 
   * @returns ANSI reset code
   */
  private resetColor(): string {
    return this.options.colors ? '\x1b[0m' : '';
  }
} 