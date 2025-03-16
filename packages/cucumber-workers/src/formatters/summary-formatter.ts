/**
 * Summary formatter for Cucumber test results in Workers
 * 
 * This formatter provides a detailed summary of test results
 * without showing progress during execution.
 */

import { TestStatus, type ScenarioResult } from './basic-formatter.js';

/**
 * Summary formatter options
 */
export interface SummaryFormatterOptions {
  /**
   * Whether to include colors in the output
   */
  colors?: boolean;
  
  /**
   * Whether to show detailed step information for failed scenarios
   */
  showFailedSteps?: boolean;
  
  /**
   * Whether to show undefined steps
   */
  showUndefinedSteps?: boolean;
  
  /**
   * Whether to show pending steps
   */
  showPendingSteps?: boolean;
}

/**
 * Default output function that logs to console
 */
const defaultOutput = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

/**
 * Summary formatter for Workers environment
 */
export class SummaryFormatter {
  private scenarios: ScenarioResult[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  
  /**
   * Create a new summary formatter
   * 
   * @param options - Formatter options
   * @param output - Output function
   */
  constructor(
    private options: SummaryFormatterOptions = { 
      colors: true, 
      showFailedSteps: true,
      showUndefinedSteps: true,
      showPendingSteps: true
    },
    private output: (message: string) => void = defaultOutput
  ) {}
  
  /**
   * Start the test run
   */
  start(): void {
    this.startTime = Date.now();
    this.scenarios = [];
  }
  
  /**
   * Add a scenario result
   * 
   * @param scenario - Scenario result to add
   */
  addScenario(scenario: ScenarioResult): void {
    this.scenarios.push(scenario);
  }
  
  /**
   * End the test run
   */
  end(): void {
    this.endTime = Date.now();
    
    // Output summary header
    this.output('\nCucumber Workers Summary:');
    this.output('=======================\n');
    
    // Output failures
    const failures = this.scenarios.filter(s => s.status === TestStatus.FAILED);
    if (failures.length > 0) {
      this.output(`${this.getStatusColor(TestStatus.FAILED)}Failures:${this.resetColor()}`);
      
      failures.forEach((scenario, index) => {
        this.output(`${index + 1}) Scenario: ${scenario.name}`);
        this.output(`   at ${scenario.featurePath}:${scenario.line}`);
        
        // Always show failed steps regardless of options
        const failedSteps = scenario.steps.filter(s => s.status === TestStatus.FAILED);
        for (const step of failedSteps) {
          this.output(`   ✗ ${step.text}`);
          if (step.error) {
            this.output(`       ${step.error}`);
          }
        }
        
        this.output('');
      });
    }
    
    // Output undefined steps
    const undefinedScenarios = this.scenarios.filter(s => 
      s.status === TestStatus.UNDEFINED || 
      s.steps.some(step => step.status === TestStatus.UNDEFINED)
    );
    
    if (undefinedScenarios.length > 0 && this.options.showUndefinedSteps) {
      this.output(`${this.getStatusColor(TestStatus.UNDEFINED)}Undefined Steps:${this.resetColor()}`);
      
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
    }
    
    // Output pending steps
    const pendingScenarios = this.scenarios.filter(s => 
      s.status === TestStatus.PENDING || 
      s.steps.some(step => step.status === TestStatus.PENDING)
    );
    
    if (pendingScenarios.length > 0 && this.options.showPendingSteps) {
      this.output(`${this.getStatusColor(TestStatus.PENDING)}Pending:${this.resetColor()}`);
      
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
    }
    
    // Output statistics
    const summary = this.getSummary();
    const totalSteps = this.getTotalSteps();
    const stepStats = this.getStepStats();
    
    this.output('Statistics:');
    this.output(`  Duration: ${this.formatDuration(summary.duration)}`);
    this.output(`  Scenarios: ${summary.total} total`);
    this.output(this.formatScenarioStats(summary));
    this.output(`  Steps: ${totalSteps} total`);
    this.output(this.formatStepStats(stepStats));
    
    // Output final result
    this.output('');
    if (summary.failed > 0) {
      this.output(`${this.getStatusColor(TestStatus.FAILED)}Test run failed!${this.resetColor()}`);
    } else if (summary.undefined > 0) {
      this.output(`${this.getStatusColor(TestStatus.UNDEFINED)}Test run incomplete (undefined steps)!${this.resetColor()}`);
    } else if (summary.pending > 0) {
      this.output(`${this.getStatusColor(TestStatus.PENDING)}Test run incomplete (pending steps)!${this.resetColor()}`);
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
      s.status === TestStatus.UNDEFINED || 
      s.steps.some(step => step.status === TestStatus.UNDEFINED)
    ).length;
    const ambiguous = this.scenarios.filter(s => 
      s.status === TestStatus.AMBIGUOUS || 
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
   * Get statistics for steps
   * 
   * @returns Step statistics
   */
  private getStepStats() {
    const steps = this.scenarios.flatMap(s => s.steps);
    
    return {
      passed: steps.filter(s => s.status === TestStatus.PASSED).length,
      failed: steps.filter(s => s.status === TestStatus.FAILED).length,
      skipped: steps.filter(s => s.status === TestStatus.SKIPPED).length,
      pending: steps.filter(s => s.status === TestStatus.PENDING).length,
      undefined: steps.filter(s => s.status === TestStatus.UNDEFINED).length,
      ambiguous: steps.filter(s => s.status === TestStatus.AMBIGUOUS).length
    };
  }
  
  /**
   * Format scenario statistics
   * 
   * @param summary - Test run summary
   * @returns Formatted scenario statistics
   */
  private formatScenarioStats(summary: ReturnType<SummaryFormatter['getSummary']>): string {
    const stats = [];
    
    if (summary.passed > 0) {
      stats.push(`${this.getStatusColor(TestStatus.PASSED)}${summary.passed} passed${this.resetColor()}`);
    }
    
    if (summary.failed > 0) {
      stats.push(`${this.getStatusColor(TestStatus.FAILED)}${summary.failed} failed${this.resetColor()}`);
    }
    
    if (summary.pending > 0) {
      stats.push(`${this.getStatusColor(TestStatus.PENDING)}${summary.pending} pending${this.resetColor()}`);
    }
    
    if (summary.skipped > 0) {
      stats.push(`${this.getStatusColor(TestStatus.SKIPPED)}${summary.skipped} skipped${this.resetColor()}`);
    }
    
    if (summary.undefined > 0) {
      stats.push(`${this.getStatusColor(TestStatus.UNDEFINED)}${summary.undefined} undefined${this.resetColor()}`);
    }
    
    if (summary.ambiguous > 0) {
      stats.push(`${this.getStatusColor(TestStatus.AMBIGUOUS)}${summary.ambiguous} ambiguous${this.resetColor()}`);
    }
    
    return `    ${stats.join(', ')}`;
  }
  
  /**
   * Format step statistics
   * 
   * @param stats - Step statistics
   * @returns Formatted step statistics
   */
  private formatStepStats(stats: ReturnType<SummaryFormatter['getStepStats']>): string {
    const formattedStats = [];
    
    if (stats.passed > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.PASSED)}${stats.passed} passed${this.resetColor()}`);
    }
    
    if (stats.failed > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.FAILED)}${stats.failed} failed${this.resetColor()}`);
    }
    
    if (stats.pending > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.PENDING)}${stats.pending} pending${this.resetColor()}`);
    }
    
    if (stats.skipped > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.SKIPPED)}${stats.skipped} skipped${this.resetColor()}`);
    }
    
    if (stats.undefined > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.UNDEFINED)}${stats.undefined} undefined${this.resetColor()}`);
    }
    
    if (stats.ambiguous > 0) {
      formattedStats.push(`${this.getStatusColor(TestStatus.AMBIGUOUS)}${stats.ambiguous} ambiguous${this.resetColor()}`);
    }
    
    return `    ${formattedStats.join(', ')}`;
  }
  
  /**
   * Format duration in a human-readable format
   * 
   * @param duration - Duration in milliseconds
   * @returns Formatted duration
   */
  private formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(duration / 60000);
      const seconds = ((duration % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
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
   * Reset the color
   * 
   * @returns ANSI reset code
   */
  private resetColor(): string {
    return this.options.colors ? '\x1b[0m' : '';
  }
} 