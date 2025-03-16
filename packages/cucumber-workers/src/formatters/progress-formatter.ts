/**
 * Progress formatter for Cucumber test results in Workers
 * 
 * This formatter provides a minimal output showing test execution progress
 * with one character per step, similar to the original Cucumber.js progress formatter.
 */

import { TestStatus, type StepResult, type ScenarioResult } from './basic-formatter.js';

/**
 * Progress formatter options
 */
export interface ProgressFormatterOptions {
  /**
   * Whether to include colors in the output
   */
  colors?: boolean;
}

/**
 * Default output function that logs to console
 */
const defaultOutput = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

/**
 * Character mapping for test statuses
 */
const STATUS_CHARACTER_MAPPING: Record<TestStatus, string> = {
  [TestStatus.PASSED]: '.',
  [TestStatus.FAILED]: 'F',
  [TestStatus.SKIPPED]: '-',
  [TestStatus.PENDING]: 'P',
  [TestStatus.UNDEFINED]: 'U',
  [TestStatus.AMBIGUOUS]: 'A'
};

/**
 * Progress formatter for Workers environment
 */
export class ProgressFormatter {
  private scenarios: ScenarioResult[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  private stepCount: number = 0;
  
  /**
   * Create a new progress formatter
   * 
   * @param options - Formatter options
   * @param output - Output function
   */
  constructor(
    private options: ProgressFormatterOptions = { colors: true },
    private output: (message: string) => void = defaultOutput
  ) {}
  
  /**
   * Start the test run
   */
  start(): void {
    this.startTime = Date.now();
    this.scenarios = [];
    this.stepCount = 0;
  }
  
  /**
   * Add a scenario result
   * 
   * @param scenario - Scenario result to add
   */
  addScenario(scenario: ScenarioResult): void {
    this.scenarios.push(scenario);
    
    // Output progress for each step
    for (const step of scenario.steps) {
      this.logStepProgress(step);
    }
  }
  
  /**
   * Log progress for a step
   * 
   * @param step - Step result
   */
  private logStepProgress(step: StepResult): void {
    const character = STATUS_CHARACTER_MAPPING[step.status] || '?';
    const coloredCharacter = this.getStatusColor(step.status) + character + this.resetColor();
    
    this.output(coloredCharacter);
    this.stepCount++;
    
    // Add a newline every 80 characters for readability
    if (this.stepCount % 80 === 0) {
      this.output('\n');
    }
  }
  
  /**
   * End the test run
   */
  end(): void {
    this.endTime = Date.now();
    
    // Add a newline if we didn't just add one
    if (this.stepCount % 80 !== 0) {
      this.output('\n');
    }
    
    // Add another newline for separation
    this.output('\n');
    
    // Output failures
    const failures = this.scenarios.filter(s => s.status === TestStatus.FAILED);
    if (failures.length > 0) {
      this.output('Failures:\n');
      
      failures.forEach((scenario, index) => {
        this.output(`${index + 1}) Scenario: ${scenario.name}`);
        this.output(`   at ${scenario.featurePath}:${scenario.line}`);
        
        const failedSteps = scenario.steps.filter(s => s.status === TestStatus.FAILED);
        for (const step of failedSteps) {
          this.output(`   ✗ ${step.text}`);
          if (step.error) {
            this.output(`       ${step.error}`);
          }
        }
        
        this.output('');
      });
      
      this.output('');
    }
    
    // Output undefined steps
    const undefinedScenarios = this.scenarios.filter(s => 
      s.steps.some(step => step.status === TestStatus.UNDEFINED)
    );
    
    if (undefinedScenarios.length > 0) {
      this.output('Undefined steps:\n');
      
      undefinedScenarios.forEach((scenario, index) => {
        this.output(`${index + 1}) Scenario: ${scenario.name}`);
        this.output(`   at ${scenario.featurePath}:${scenario.line}`);
        
        const undefinedSteps = scenario.steps.filter(s => s.status === TestStatus.UNDEFINED);
        for (const step of undefinedSteps) {
          this.output(`   ? ${step.text}`);
          this.output('       Undefined. Implement this step in your code.');
        }
        
        this.output('');
      });
      
      this.output('');
    }
    
    // Output pending steps
    const pendingScenarios = this.scenarios.filter(s => 
      s.status === TestStatus.PENDING || 
      s.steps.some(step => step.status === TestStatus.PENDING)
    );
    
    if (pendingScenarios.length > 0) {
      this.output('Pending:\n');
      
      pendingScenarios.forEach((scenario, index) => {
        this.output(`${index + 1}) Scenario: ${scenario.name}`);
        this.output(`   at ${scenario.featurePath}:${scenario.line}`);
        
        const pendingSteps = scenario.steps.filter(s => s.status === TestStatus.PENDING);
        for (const step of pendingSteps) {
          this.output(`   ? ${step.text}`);
          this.output('       Pending');
        }
        
        this.output('');
      });
      
      this.output('');
    }
    
    // Output summary
    const summary = this.getSummary();
    
    this.output(`${summary.total} scenarios (${this.formatSummaryStats(summary)})`);
    this.output(`${this.getTotalSteps()} steps (${this.formatStepStats()})`);
    this.output(`Duration: ${summary.duration}ms\n`);
    
    if (summary.failed > 0) {
      this.output(`${this.getStatusColor(TestStatus.FAILED)}Test run failed!${this.resetColor()}`);
    } else {
      this.output(`${this.getStatusColor(TestStatus.PASSED)}Test run passed!${this.resetColor()}`);
    }
  }
  
  /**
   * Get the test run summary
   * 
   * @returns Test run summary
   */
  getSummary() {
    const passed = this.scenarios.filter(s => s.status === TestStatus.PASSED).length;
    const failed = this.scenarios.filter(s => s.status === TestStatus.FAILED).length;
    const skipped = this.scenarios.filter(s => s.status === TestStatus.SKIPPED).length;
    const pending = this.scenarios.filter(s => s.status === TestStatus.PENDING).length;
    const undefinedCount = this.scenarios.filter(s => 
      s.steps.some(step => step.status === TestStatus.UNDEFINED)
    ).length;
    const ambiguous = this.scenarios.filter(s => 
      s.steps.some(step => step.status === TestStatus.AMBIGUOUS)
    ).length;
    
    return {
      total: this.scenarios.length,
      passed,
      failed,
      skipped,
      pending,
      undefined: undefinedCount,
      ambiguous,
      duration: this.endTime - this.startTime
    };
  }
  
  /**
   * Get the total number of steps
   * 
   * @returns Total number of steps
   */
  private getTotalSteps(): number {
    return this.scenarios.reduce((total, scenario) => total + scenario.steps.length, 0);
  }
  
  /**
   * Format the summary statistics
   * 
   * @param summary - Test run summary
   * @returns Formatted summary statistics
   */
  private formatSummaryStats(summary: ReturnType<ProgressFormatter['getSummary']>): string {
    const stats = [];
    
    if (summary.failed > 0) {
      stats.push(`${summary.failed} failed`);
    }
    
    if (summary.ambiguous > 0) {
      stats.push(`${summary.ambiguous} ambiguous`);
    }
    
    if (summary.undefined > 0) {
      stats.push(`${summary.undefined} undefined`);
    }
    
    if (summary.pending > 0) {
      stats.push(`${summary.pending} pending`);
    }
    
    if (summary.skipped > 0) {
      stats.push(`${summary.skipped} skipped`);
    }
    
    if (summary.passed > 0) {
      stats.push(`${summary.passed} passed`);
    }
    
    return stats.join(', ');
  }
  
  /**
   * Format the step statistics
   * 
   * @returns Formatted step statistics
   */
  private formatStepStats(): string {
    const stats = [];
    const steps = this.scenarios.flatMap(s => s.steps);
    
    const failed = steps.filter(s => s.status === TestStatus.FAILED).length;
    if (failed > 0) {
      stats.push(`${failed} failed`);
    }
    
    const ambiguous = steps.filter(s => s.status === TestStatus.AMBIGUOUS).length;
    if (ambiguous > 0) {
      stats.push(`${ambiguous} ambiguous`);
    }
    
    const undefinedCount = steps.filter(s => s.status === TestStatus.UNDEFINED).length;
    if (undefinedCount > 0) {
      stats.push(`${undefinedCount} undefined`);
    }
    
    const pending = steps.filter(s => s.status === TestStatus.PENDING).length;
    if (pending > 0) {
      stats.push(`${pending} pending`);
    }
    
    const skipped = steps.filter(s => s.status === TestStatus.SKIPPED).length;
    if (skipped > 0) {
      stats.push(`${skipped} skipped`);
    }
    
    const passed = steps.filter(s => s.status === TestStatus.PASSED).length;
    if (passed > 0) {
      stats.push(`${passed} passed`);
    }
    
    return stats.join(', ');
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
        return '\x1b[33m'; // Yellow
      case TestStatus.AMBIGUOUS:
        return '\x1b[35m'; // Magenta
      default:
        return '';
    }
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