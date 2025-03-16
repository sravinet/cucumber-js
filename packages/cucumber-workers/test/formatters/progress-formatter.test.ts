/**
 * Tests for the ProgressFormatter class
 */
import { describe, it, expect, vi } from 'vitest';
import { ProgressFormatter } from '../../src/formatters/progress-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

describe('ProgressFormatter', () => {
  it('should format a successful test run with progress characters', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Successful scenario',
      featurePath: 'features/test.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I have 5 cucumbers',
          status: TestStatus.PASSED
        },
        {
          text: 'When I eat 3 cucumbers',
          status: TestStatus.PASSED
        },
        {
          text: 'Then I should have 2 cucumbers left',
          status: TestStatus.PASSED
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('1 scenarios (1 passed)');
    expect(output).toHaveBeenCalledWith('3 steps (3 passed)');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Duration:'));
    expect(output).toHaveBeenCalledWith('Test run passed!');
  });
  
  it('should format a failed test run with appropriate characters', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/test.feature',
      line: 3,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given I have 5 cucumbers',
          status: TestStatus.PASSED
        },
        {
          text: 'When I eat 3 cucumbers',
          status: TestStatus.PASSED
        },
        {
          text: 'Then I should have 3 cucumbers left',
          status: TestStatus.FAILED,
          error: 'Expected 3 but got 2'
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('F');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('Failures:\n');
    expect(output).toHaveBeenCalledWith('1) Scenario: Failed scenario');
    expect(output).toHaveBeenCalledWith('   at features/test.feature:3');
    expect(output).toHaveBeenCalledWith('   ✗ Then I should have 3 cucumbers left');
    expect(output).toHaveBeenCalledWith('       Expected 3 but got 2');
    expect(output).toHaveBeenCalledWith('1 scenarios (1 failed)');
    expect(output).toHaveBeenCalledWith('3 steps (1 failed, 2 passed)');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Duration:'));
    expect(output).toHaveBeenCalledWith('Test run failed!');
  });
  
  it('should format a mixed test run with different status characters', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    // Passed scenario
    formatter.addScenario({
      name: 'Passed scenario',
      featurePath: 'features/test.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given a passing step',
          status: TestStatus.PASSED
        }
      ]
    });
    
    // Failed scenario
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/test.feature',
      line: 8,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given a failing step',
          status: TestStatus.FAILED,
          error: 'Error message'
        }
      ]
    });
    
    // Skipped scenario
    formatter.addScenario({
      name: 'Skipped scenario',
      featurePath: 'features/test.feature',
      line: 13,
      status: TestStatus.SKIPPED,
      steps: [
        {
          text: 'Given a skipped step',
          status: TestStatus.SKIPPED
        }
      ]
    });
    
    // Pending scenario
    formatter.addScenario({
      name: 'Pending scenario',
      featurePath: 'features/test.feature',
      line: 18,
      status: TestStatus.PENDING,
      steps: [
        {
          text: 'Given a pending step',
          status: TestStatus.PENDING
        }
      ]
    });
    
    // Undefined scenario
    formatter.addScenario({
      name: 'Undefined scenario',
      featurePath: 'features/test.feature',
      line: 23,
      status: TestStatus.PASSED, // Overall status doesn't matter for this test
      steps: [
        {
          text: 'Given an undefined step',
          status: TestStatus.UNDEFINED
        }
      ]
    });
    
    formatter.end();
    
    // Assert - Check that each character is output
    // We don't need to check the exact order or all output calls
    expect(output).toHaveBeenCalledWith('.');  // Passed
    expect(output).toHaveBeenCalledWith('F');  // Failed
    expect(output).toHaveBeenCalledWith('-');  // Skipped
    expect(output).toHaveBeenCalledWith('P');  // Pending
    expect(output).toHaveBeenCalledWith('U');  // Undefined
    
    // Check that the summary contains the correct counts
    const outputCalls = output.mock.calls.map(call => call[0]);
    const scenarioSummaryIndex = outputCalls.findIndex(call => 
      call.includes('scenarios') && call.includes('failed') && call.includes('passed')
    );
    const stepSummaryIndex = outputCalls.findIndex(call => 
      call.includes('steps') && call.includes('failed') && call.includes('passed')
    );
    
    expect(scenarioSummaryIndex).toBeGreaterThan(0);
    expect(stepSummaryIndex).toBeGreaterThan(0);
    
    const scenarioSummary = outputCalls[scenarioSummaryIndex];
    const stepSummary = outputCalls[stepSummaryIndex];
    
    expect(scenarioSummary).toContain('5 scenarios');
    expect(scenarioSummary).toContain('1 failed');
    expect(scenarioSummary).toContain('1 undefined');
    expect(scenarioSummary).toContain('1 pending');
    expect(scenarioSummary).toContain('1 skipped');
    
    expect(stepSummary).toContain('5 steps');
    expect(stepSummary).toContain('1 failed');
    expect(stepSummary).toContain('1 undefined');
    expect(stepSummary).toContain('1 pending');
    expect(stepSummary).toContain('1 skipped');
    expect(stepSummary).toContain('1 passed');
  });
  
  it('should add a newline every 80 characters', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    // Create a scenario with 100 passing steps
    const steps = Array(100).fill(null).map(() => ({
      text: 'Given a passing step',
      status: TestStatus.PASSED
    }));
    
    formatter.addScenario({
      name: 'Scenario with many steps',
      featurePath: 'features/test.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps
    });
    
    formatter.end();
    
    // Assert
    // Should have called output with a newline at the 80th step
    const outputCalls = output.mock.calls.map(call => call[0]);
    const newlineIndex = outputCalls.indexOf('\n');
    expect(newlineIndex).toBe(80); // 0-indexed, so the 80th call is at index 79
    
    // The last few calls should include newlines for the end of the output
    // but we don't need to check the exact indices
    const lastNewlineIndices = outputCalls
      .map((call, index) => call === '\n' ? index : -1)
      .filter(index => index !== -1);
    
    expect(lastNewlineIndices.length).toBeGreaterThanOrEqual(2);
    expect(lastNewlineIndices[0]).toBe(80);
  });
  
  it('should get a summary of the test run', () => {
    // Arrange
    const formatter = new ProgressFormatter();
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Passed scenario',
      featurePath: 'features/test.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: []
    });
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/test.feature',
      line: 8,
      status: TestStatus.FAILED,
      steps: []
    });
    
    formatter.addScenario({
      name: 'Skipped scenario',
      featurePath: 'features/test.feature',
      line: 13,
      status: TestStatus.SKIPPED,
      steps: []
    });
    
    formatter.addScenario({
      name: 'Pending scenario',
      featurePath: 'features/test.feature',
      line: 18,
      status: TestStatus.PENDING,
      steps: []
    });
    
    formatter.end();
    
    // Assert
    const summary = formatter.getSummary();
    expect(summary.total).toBe(4);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.pending).toBe(1);
    expect(summary.duration).toBeGreaterThanOrEqual(0);
  });
}); 