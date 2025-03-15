/**
 * Vitest integration entry point for Cucumber.js
 * 
 * This file provides the Vitest integration API surface for Cucumber.js,
 * ensuring compatibility with Vitest and other ESM-based testing tools.
 */

// Import from API first (alphabetical order)
import { runCucumber as apiRunCucumber } from './api/index.js'
import { createVitestCucumberTest, runCucumberInVitest } from './api/vitest.js'
// Then import from main module
import cucumber from './index.js'

// Version
export const version = cucumber.version

// Core components
export const supportCodeLibraryBuilder = cucumber.supportCodeLibraryBuilder
export const Status = cucumber.Status
export const DataTable = cucumber.DataTable
export const TestCaseHookDefinition = cucumber.TestCaseHookDefinition

// Formatters
export const Formatter = cucumber.Formatter
export const FormatterBuilder = cucumber.FormatterBuilder
export const JsonFormatter = cucumber.JsonFormatter
export const ProgressFormatter = cucumber.ProgressFormatter
export const RerunFormatter = cucumber.RerunFormatter
export const SnippetsFormatter = cucumber.SnippetsFormatter
export const SummaryFormatter = cucumber.SummaryFormatter
export const UsageFormatter = cucumber.UsageFormatter
export const UsageJsonFormatter = cucumber.UsageJsonFormatter
export const formatterHelpers = cucumber.formatterHelpers

// Support Code Functions
export const After = cucumber.After
export const AfterAll = cucumber.AfterAll
export const AfterStep = cucumber.AfterStep
export const Before = cucumber.Before
export const BeforeAll = cucumber.BeforeAll
export const BeforeStep = cucumber.BeforeStep
export const defineStep = cucumber.defineStep
export const defineParameterType = cucumber.defineParameterType
export const Given = cucumber.Given
export const setDefaultTimeout = cucumber.setDefaultTimeout
export const setDefinitionFunctionWrapper = cucumber.setDefinitionFunctionWrapper
export const setWorldConstructor = cucumber.setWorldConstructor
export const setParallelCanAssign = cucumber.setParallelCanAssign
export const Then = cucumber.Then
export const When = cucumber.When
export const World = cucumber.World
export const world = cucumber.world
export const context = cucumber.context
export const parallelCanAssignHelpers = cucumber.parallelCanAssignHelpers

// Time helpers
export const wrapPromiseWithTimeout = cucumber.wrapPromiseWithTimeout

// TypeScript interfaces
export const IWorld = cucumber.IWorld
export const IWorldOptions = cucumber.IWorldOptions
export const IContext = cucumber.IContext
export const ITestCaseHookParameter = cucumber.ITestCaseHookParameter
export const ITestStepHookParameter = cucumber.ITestStepHookParameter
export const IFormatterOptions = cucumber.IFormatterOptions

// Runtime APIs that might be needed for Vitest integration
export const runCucumber = apiRunCucumber

// Vitest integration
export { createVitestCucumberTest, runCucumberInVitest }

// Deprecated (included for backward compatibility)
export const Cli = cucumber.Cli 