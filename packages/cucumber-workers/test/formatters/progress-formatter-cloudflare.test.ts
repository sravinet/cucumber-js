/**
 * Tests for the ProgressFormatter class in Cloudflare Workers environment
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Miniflare } from 'miniflare';
import { ProgressFormatter } from '../../src/formatters/progress-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

describe('ProgressFormatter in Cloudflare environment', () => {
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

  it('should format a test run in Workers environment', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Cloudflare scenario',
      featurePath: 'features/cloudflare.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given I am running in a Cloudflare Workers environment',
          status: TestStatus.PASSED
        },
        {
          text: 'When I execute a test',
          status: TestStatus.PASSED
        },
        {
          text: 'Then it should pass',
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
  
  it('should handle mixed test statuses in Workers environment', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    // Add scenarios with different statuses
    formatter.addScenario({
      name: 'Passed scenario',
      featurePath: 'features/cloudflare.feature',
      line: 3,
      status: TestStatus.PASSED,
      steps: [
        {
          text: 'Given a passing step',
          status: TestStatus.PASSED
        }
      ]
    });
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/cloudflare.feature',
      line: 8,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given a failing step',
          status: TestStatus.FAILED,
          error: 'Error in Workers environment'
        }
      ]
    });
    
    formatter.addScenario({
      name: 'Skipped scenario',
      featurePath: 'features/cloudflare.feature',
      line: 13,
      status: TestStatus.SKIPPED,
      steps: [
        {
          text: 'Given a skipped step',
          status: TestStatus.SKIPPED
        }
      ]
    });
    
    formatter.end();
    
    // Assert - Check that each character is output
    expect(output).toHaveBeenCalledWith('.');  // Passed
    expect(output).toHaveBeenCalledWith('F');  // Failed
    expect(output).toHaveBeenCalledWith('-');  // Skipped
    
    // Check that the summary contains the correct counts
    const outputCalls = output.mock.calls.map(call => call[0]);
    const scenarioSummaryIndex = outputCalls.findIndex(call => 
      call.includes('scenarios') && call.includes('failed') && call.includes('passed')
    );
    
    expect(scenarioSummaryIndex).toBeGreaterThan(0);
    
    const scenarioSummary = outputCalls[scenarioSummaryIndex];
    expect(scenarioSummary).toContain('3 scenarios');
    expect(scenarioSummary).toContain('1 failed');
    expect(scenarioSummary).toContain('1 skipped');
    expect(scenarioSummary).toContain('1 passed');
  });
  
  it('should handle error messages in Workers environment', async () => {
    // Arrange
    const output = vi.fn();
    const formatter = new ProgressFormatter({ colors: false }, output);
    
    // Act
    formatter.start();
    
    formatter.addScenario({
      name: 'Failed scenario',
      featurePath: 'features/cloudflare.feature',
      line: 3,
      status: TestStatus.FAILED,
      steps: [
        {
          text: 'Given I am running in a Cloudflare Workers environment',
          status: TestStatus.PASSED
        },
        {
          text: 'When I execute a test that fails',
          status: TestStatus.FAILED,
          error: 'Workers environment error: fetch failed'
        }
      ]
    });
    
    formatter.end();
    
    // Assert
    expect(output).toHaveBeenCalledWith('.');
    expect(output).toHaveBeenCalledWith('F');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('\n');
    expect(output).toHaveBeenCalledWith('Failures:\n');
    expect(output).toHaveBeenCalledWith('1) Scenario: Failed scenario');
    expect(output).toHaveBeenCalledWith('   at features/cloudflare.feature:3');
    expect(output).toHaveBeenCalledWith('   ✗ When I execute a test that fails');
    expect(output).toHaveBeenCalledWith('       Workers environment error: fetch failed');
  });
}); 