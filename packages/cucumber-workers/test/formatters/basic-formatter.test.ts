/**
 * Tests for the BasicFormatter class
 */
import { describe, it, expect, vi } from 'vitest';
import { BasicFormatter, TestStatus } from '../../src/formatters/basic-formatter.js';

describe('BasicFormatter', () => {
  it('should format a successful test run', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new BasicFormatter({ colors: false, showSteps: true }, output);
    
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
    expect(output).toHaveBeenCalledWith('Starting test run...\n');
    expect(output).toHaveBeenCalledWith('Scenario: Successful scenario - PASSED');
    expect(output).toHaveBeenCalledWith('  at features/test.feature:3');
    expect(output).toHaveBeenCalledWith('  Given I have 5 cucumbers - PASSED');
    expect(output).toHaveBeenCalledWith('  When I eat 3 cucumbers - PASSED');
    expect(output).toHaveBeenCalledWith('  Then I should have 2 cucumbers left - PASSED');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Test run completed:'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Passed: 1'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Failed: 0'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Test run passed!'));
  });
  
  it('should format a failed test run', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new BasicFormatter({ colors: false, showSteps: true }, output);
    
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
    expect(output).toHaveBeenCalledWith('Starting test run...\n');
    expect(output).toHaveBeenCalledWith('Scenario: Failed scenario - FAILED');
    expect(output).toHaveBeenCalledWith('  at features/test.feature:3');
    expect(output).toHaveBeenCalledWith('  Given I have 5 cucumbers - PASSED');
    expect(output).toHaveBeenCalledWith('  When I eat 3 cucumbers - PASSED');
    expect(output).toHaveBeenCalledWith('  Then I should have 3 cucumbers left - FAILED');
    expect(output).toHaveBeenCalledWith('    Expected 3 but got 2');
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Test run completed:'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Passed: 0'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Failed: 1'));
    expect(output).toHaveBeenCalledWith(expect.stringContaining('Test run failed!'));
  });
  
  it('should get a summary of the test run', () => {
    // Arrange
    const formatter = new BasicFormatter();
    
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
  
  it('should respect the showSteps option', () => {
    // Arrange
    const output = vi.fn();
    const formatter = new BasicFormatter({ colors: false, showSteps: false }, output);
    
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
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    expect(output).toHaveBeenCalledWith('Starting test run...\n');
    expect(output).toHaveBeenCalledWith('Scenario: Successful scenario - PASSED');
    expect(output).toHaveBeenCalledWith('  at features/test.feature:3');
    expect(output).not.toHaveBeenCalledWith('  Given I have 5 cucumbers - PASSED');
  });
}); 