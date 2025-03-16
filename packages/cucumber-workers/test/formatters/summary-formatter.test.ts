import { describe, it, expect, vi } from 'vitest';
import { SummaryFormatter } from '../../src/formatters/summary-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

describe('SummaryFormatter', () => {
  it('should format a successful test run correctly', () => {
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: false }, output);
    
    formatter.start();
    
    formatter.addScenario({
      name: 'Successful scenario',
      featurePath: 'features/success.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given a step that passes',
          status: TestStatus.PASSED,
          duration: 1
        },
        {
          text: 'When I do something',
          status: TestStatus.PASSED,
          duration: 2
        },
        {
          text: 'Then I should see a result',
          status: TestStatus.PASSED,
          duration: 3
        }
      ]
    });
    
    formatter.end();
    
    // Verify summary output
    expect(output).toHaveBeenCalledWith('\nCucumber Workers Summary:');
    expect(output).toHaveBeenCalledWith('=======================\n');
    
    // Verify statistics
    expect(output).toHaveBeenCalledWith('Statistics:');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Duration:'));
    expect(output).toHaveBeenCalledWith('  Scenarios: 1 total');
    expect(output).toHaveBeenCalledWith('    1 passed');
    expect(output).toHaveBeenCalledWith('  Steps: 3 total');
    expect(output).toHaveBeenCalledWith('    3 passed');
    
    // Verify final result
    expect(output).toHaveBeenCalledWith('');
    expect(output).toHaveBeenCalledWith('Test run passed!');
  });
  
  it('should format a failed test run correctly', () => {
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: false }, output);
    
    formatter.start();
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/failure.feature',
      line: 3,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given a step that passes',
          status: TestStatus.PASSED,
          duration: 1
        },
        {
          text: 'When I do something that fails',
          status: TestStatus.FAILED,
          duration: 2,
          error: 'Expected true to be false'
        },
        {
          text: 'Then I should not reach this step',
          status: TestStatus.SKIPPED,
          duration: 0
        }
      ]
    });
    
    formatter.end();
    
    // Verify failures section
    expect(output).toHaveBeenCalledWith('Failures:');
    expect(output).toHaveBeenCalledWith('1) Scenario: Failed scenario');
    expect(output).toHaveBeenCalledWith('   at features/failure.feature:3');
    
    // Verify failed steps are shown
    const outputCalls = output.mock.calls.map(call => call[0]);
    expect(outputCalls).toContain('   ✗ When I do something that fails');
    expect(outputCalls).toContain('       Expected true to be false');
    
    // Verify statistics
    expect(output).toHaveBeenCalledWith('Statistics:');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Duration:'));
    expect(output).toHaveBeenCalledWith('  Scenarios: 1 total');
    expect(output).toHaveBeenCalledWith('    1 failed');
    expect(output).toHaveBeenCalledWith('  Steps: 3 total');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 passed'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 failed'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 skipped'));
    
    // Verify final result
    expect(output).toHaveBeenCalledWith('');
    expect(output).toHaveBeenCalledWith('Test run failed!');
  });
  
  it('should format a test run with undefined steps correctly', () => {
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: false }, output);
    
    formatter.start();
    
    formatter.addScenario({
      name: 'Scenario with undefined steps',
      featurePath: 'features/undefined.feature',
      line: 3,
      status: TestStatus.UNDEFINED,
      steps: [
        {
          text: 'Given a step that passes',
          status: TestStatus.PASSED,
          duration: 1
        },
        {
          text: 'When I do something undefined',
          status: TestStatus.UNDEFINED,
          duration: 0
        },
        {
          text: 'Then I should not reach this step',
          status: TestStatus.SKIPPED,
          duration: 0
        }
      ]
    });
    
    formatter.end();
    
    // Verify statistics
    expect(output).toHaveBeenCalledWith('Statistics:');
    expect(output).toHaveBeenCalledWith('  Scenarios: 1 total');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 undefined'));
    expect(output).toHaveBeenCalledWith('  Steps: 3 total');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 passed'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 undefined'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 skipped'));
    
    // Verify final result
    expect(output).toHaveBeenCalledWith('');
    expect(output).toHaveBeenCalledWith('Test run incomplete (undefined steps)!');
  });
  
  it('should format a test run with pending steps correctly', () => {
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: false }, output);
    
    formatter.start();
    
    formatter.addScenario({
      name: 'Scenario with pending steps',
      featurePath: 'features/pending.feature',
      line: 3,
      status: TestStatus.PENDING,
      steps: [
        {
          text: 'Given a step that passes',
          status: TestStatus.PASSED,
          duration: 1
        },
        {
          text: 'When I do something pending',
          status: TestStatus.PENDING,
          duration: 0
        },
        {
          text: 'Then I should not reach this step',
          status: TestStatus.SKIPPED,
          duration: 0
        }
      ]
    });
    
    formatter.end();
    
    // Verify statistics
    expect(output).toHaveBeenCalledWith('Statistics:');
    expect(output).toHaveBeenCalledWith('  Scenarios: 1 total');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 pending'));
    expect(output).toHaveBeenCalledWith('  Steps: 3 total');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 passed'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 pending'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('1 skipped'));
    
    // Verify final result
    expect(output).toHaveBeenCalledWith('');
    expect(output).toHaveBeenCalledWith('Test run incomplete (pending steps)!');
  });
  
  it('should format duration correctly', () => {
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: false }, output);
    
    // Access private method using type assertion
    const formatDuration = (formatter as any).formatDuration.bind(formatter);
    
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(1500)).toBe('1.50s');
    expect(formatDuration(65000)).toBe('1m 5.00s');
  });
}); 