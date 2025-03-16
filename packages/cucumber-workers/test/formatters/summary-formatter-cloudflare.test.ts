/**
 * Tests for the SummaryFormatter class in Cloudflare Workers environment
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Miniflare } from 'miniflare';
import { SummaryFormatter } from '../../src/formatters/summary-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

describe('SummaryFormatter in Cloudflare environment', () => {
  let miniflare: Miniflare;

  // Set up Miniflare before each test
  beforeEach(async () => {
    // Create a new Miniflare instance for each test
    miniflare = new Miniflare({
      modules: true,
      script: `
        export default {
          async fetch(request, env) {
            return new Response("Miniflare is running");
          }
        }
      `,
      // Simulate Cloudflare Workers environment
      compatibilityDate: '2023-12-01',
    });
    
    // Verify Miniflare is running
    const response = await miniflare.dispatchFetch('http://localhost/');
    expect(await response.text()).toBe("Miniflare is running");
  });

  it('should format a successful test run correctly', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new SummaryFormatter({ 
      colors: false,
      showFailedSteps: true,
      showUndefinedSteps: true,
      showPendingSteps: true
    }, output);
    
    // Act
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
    
    // Assert
    // Check that the output contains the expected sections
    const outputCalls = output.mock.calls.map(call => call[0]);
    
    // Verify summary header
    expect(outputCalls.some(call => call.includes('Cucumber Workers Summary'))).toBe(true);
    
    // Verify statistics
    expect(outputCalls.some(call => call.includes('Statistics:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Duration:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Scenarios: 1 total'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 passed'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Steps: 3 total'))).toBe(true);
    expect(outputCalls.some(call => call.includes('3 passed'))).toBe(true);
    
    // Verify final result
    expect(outputCalls.some(call => call.includes('Test run passed!'))).toBe(true);
  });
  
  it('should format a failed test run correctly', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new SummaryFormatter({ 
      colors: false,
      showFailedSteps: true,
      showUndefinedSteps: true,
      showPendingSteps: true
    }, output);
    
    // Act
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
    
    // Assert
    const outputCalls = output.mock.calls.map(call => call[0]);
    
    // Verify failures section
    expect(outputCalls.some(call => call.includes('Failures:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1) Scenario: Failed scenario'))).toBe(true);
    expect(outputCalls.some(call => call.includes('at features/failure.feature:3'))).toBe(true);
    expect(outputCalls.some(call => call.includes('✗ When I do something that fails'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Expected true to be false'))).toBe(true);
    
    // Verify statistics
    expect(outputCalls.some(call => call.includes('Statistics:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Duration:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Scenarios: 1 total'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 failed'))).toBe(true);
    
    // Verify steps statistics
    expect(outputCalls.some(call => call.includes('Steps: 3 total'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 passed'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 failed'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 skipped'))).toBe(true);
    
    // Verify final result
    expect(outputCalls.some(call => call.includes('Test run failed!'))).toBe(true);
  });
  
  it('should format a test run with mixed statuses correctly', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new SummaryFormatter({ 
      colors: false,
      showUndefinedSteps: true,
      showPendingSteps: true
    }, output);
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Passed scenario',
      featurePath: 'features/success.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given a step that passes',
          status: TestStatus.PASSED,
          duration: 1
        }
      ]
    });
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/failure.feature',
      line: 3,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'When I do something that fails',
          status: TestStatus.FAILED,
          duration: 2,
          error: 'Expected true to be false'
        }
      ]
    });
    
    formatter.addScenario({
      name: 'Undefined scenario',
      featurePath: 'features/undefined.feature',
      line: 3,
      status: TestStatus.UNDEFINED,
      steps: [
        {
          text: 'When I do something undefined',
          status: TestStatus.UNDEFINED,
          duration: 0
        }
      ]
    });
    
    formatter.addScenario({
      name: 'Pending scenario',
      featurePath: 'features/pending.feature',
      line: 3,
      status: TestStatus.PENDING,
      steps: [
        {
          text: 'When I do something pending',
          status: TestStatus.PENDING,
          duration: 0
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    const outputCalls = output.mock.calls.map(call => call[0]);
    
    // Verify failures section
    expect(outputCalls.some(call => call.includes('Failures:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1) Scenario: Failed scenario'))).toBe(true);
    
    // Verify undefined steps section
    expect(outputCalls.some(call => call.includes('Undefined Steps:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1) Scenario: Undefined scenario'))).toBe(true);
    expect(outputCalls.some(call => call.includes('? When I do something undefined'))).toBe(true);
    
    // Verify pending steps section
    expect(outputCalls.some(call => call.includes('Pending:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1) Scenario: Pending scenario'))).toBe(true);
    expect(outputCalls.some(call => call.includes('? When I do something pending'))).toBe(true);
    
    // Verify statistics
    expect(outputCalls.some(call => call.includes('Statistics:'))).toBe(true);
    expect(outputCalls.some(call => call.includes('Scenarios: 4 total'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 passed'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 failed'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 undefined'))).toBe(true);
    expect(outputCalls.some(call => call.includes('1 pending'))).toBe(true);
    
    // Verify final result
    expect(outputCalls.some(call => call.includes('Test run failed!'))).toBe(true);
  });
  
  it('should respect formatter options', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new SummaryFormatter({ colors: true }, output);
    
    // Act
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
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    // With colors enabled, we should see ANSI color codes in the output
    // Check for color in the "Test run passed!" message
    const outputCalls = output.mock.calls.map(call => call[0]);
    const coloredOutput = outputCalls.find(call => 
      typeof call === 'string' && call.includes('\u001b[')
    );
    
    expect(coloredOutput).toBeDefined();
  });
}); 