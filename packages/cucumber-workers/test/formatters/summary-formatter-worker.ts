import { SummaryFormatter } from '../../src/formatters/summary-formatter.js';
import { TestStatus } from '../../src/formatters/basic-formatter.js';

export default {
  async fetch(request) {
    const logs = [];
    const output = (message) => {
      logs.push(message);
    };

    try {
      const data = await request.json();
      const { type, options } = data;
      const formatter = new SummaryFormatter(options, output);
      
      formatter.start();
      
      if (type === 'success') {
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
      } else if (type === 'failure') {
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
      } else if (type === 'mixed') {
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
      }
      
      formatter.end();
      
      return new Response(JSON.stringify({ logs }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
}; 