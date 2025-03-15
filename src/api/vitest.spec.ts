import { EventEmitter } from 'node:events'
import { expect } from 'chai'
import { Envelope } from '@cucumber/messages'
import { IRunResult, ISupportCodeLibrary, ISupportCodeCoordinates } from './types'
import { runCucumberInVitest, createVitestCucumberTest, IVitestRunOptions } from './vitest'
import * as runCucumberModule from './run_cucumber'

// Create a mock support code library
const mockSupportCodeLibrary: ISupportCodeLibrary = {
  originalCoordinates: {
    requireModules: [],
    requirePaths: [],
    importPaths: [],
    loaders: []
  }
}

// Mock dependencies
const mockRunCucumber = {
  runCucumber: async (
    options: any,
    environment: any,
    onMessage?: (message: Envelope) => void
  ): Promise<IRunResult> => {
    // Simulate some messages being emitted
    if (onMessage) {
      onMessage({ testCaseStarted: { id: '1', testCaseId: '1', timestamp: { seconds: 0, nanos: 0 } } } as Envelope)
      onMessage({ testCaseFinished: { testCaseStartedId: '1', timestamp: { seconds: 0, nanos: 0 }, willBeRetried: false } } as Envelope)
    }
    return { 
      success: true,
      support: mockSupportCodeLibrary
    }
  }
}

// Mock test function for Vitest
const mockTestFn = (name: string, fn: () => Promise<void>): void => {
  // Store the function for later execution in tests
  mockTestFn.lastFn = fn
  mockTestFn.lastName = name
}
mockTestFn.lastFn = null as any
mockTestFn.lastName = ''

describe('Vitest Adapter', () => {
  const originalRunCucumber = runCucumberModule.runCucumber

  beforeEach(() => {
    // Use jest.spyOn or similar to mock the function
    jest.spyOn(runCucumberModule, 'runCucumber').mockImplementation(mockRunCucumber.runCucumber)
  })

  afterEach(() => {
    // Restore the original implementation
    jest.restoreAllMocks()
  })

  describe('runCucumberInVitest', () => {
    it('should run Cucumber and return results with messages', async () => {
      const options: IVitestRunOptions = {
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        }
      }

      const result = await runCucumberInVitest(options)

      expect(result.success).to.equal(true)
      expect(result.messages).to.be.an('array')
      expect(result.messages.length).to.equal(2)
      expect(result.messages[0].testCaseStarted).to.exist
      expect(result.messages[1].testCaseFinished).to.exist
    })

    it('should call beforeAll and afterAll hooks if provided', async () => {
      let beforeAllCalled = false
      let afterAllCalled = false

      const options: IVitestRunOptions = {
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        },
        vitest: {
          hooks: {
            beforeAll: async () => { beforeAllCalled = true },
            afterAll: async () => { afterAllCalled = true }
          }
        }
      }

      const result = await runCucumberInVitest(options)

      expect(beforeAllCalled).to.equal(true)
      expect(afterAllCalled).to.equal(true)
      expect(result.success).to.equal(true)
    })

    it('should call afterAll hook even if runCucumber throws', async () => {
      let afterAllCalled = false
      
      // Override mock to throw an error
      jest.spyOn(runCucumberModule, 'runCucumber').mockImplementation(async () => {
        throw new Error('Test error')
      })

      const options: IVitestRunOptions = {
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        },
        vitest: {
          hooks: {
            afterAll: async () => { afterAllCalled = true }
          }
        }
      }

      try {
        await runCucumberInVitest(options)
        // Should not reach here
        expect.fail('Expected runCucumberInVitest to throw')
      } catch (error) {
        expect(error).to.be.an('error')
        expect(afterAllCalled).to.equal(true)
      }
    })
  })

  describe('createVitestCucumberTest', () => {
    it('should create a Vitest test with the provided name', () => {
      const options: IVitestRunOptions = {
        name: 'Custom test name',
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        }
      }

      createVitestCucumberTest(mockTestFn, options)

      expect(mockTestFn.lastName).to.equal('Custom test name')
      expect(mockTestFn.lastFn).to.be.a('function')
    })

    it('should use a default name if none provided', () => {
      const options: IVitestRunOptions = {
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        }
      }

      createVitestCucumberTest(mockTestFn, options)

      expect(mockTestFn.lastName).to.equal('Run Cucumber features')
      expect(mockTestFn.lastFn).to.be.a('function')
    })

    it('should throw an error if Cucumber tests fail', async () => {
      // Override mock to return failure
      jest.spyOn(runCucumberModule, 'runCucumber').mockImplementation(async () => ({ 
        success: false, 
        support: mockSupportCodeLibrary 
      }))

      const options: IVitestRunOptions = {
        sources: { 
          paths: ['features/'],
          defaultDialect: 'en',
          names: [],
          tagExpression: '',
          order: 'defined'
        },
        support: {
          importPaths: ['features/step_definitions/**/*.js']
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: 0,
          retryTagFilter: '',
          strict: false,
          worldParameters: {}
        },
        formats: {
          stdout: 'summary',
          files: {},
          publish: false,
          options: {}
        }
      }

      createVitestCucumberTest(mockTestFn, options)

      try {
        await mockTestFn.lastFn()
        // Should not reach here
        expect.fail('Expected test function to throw')
      } catch (error) {
        expect(error).to.be.an('error')
        expect(error.message).to.equal('Cucumber tests failed')
      }
    })
  })
}) 