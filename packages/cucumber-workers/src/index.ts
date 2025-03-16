/**
 * Cucumber.js for Cloudflare Workers
 * 
 * This package provides a specialized version of Cucumber.js that is
 * compatible with Cloudflare Workers, leveraging vitest-pool-workers
 * for test execution.
 */

// Core components
export { WorkersFeatureLoader, type FeatureFile } from './core/feature-loader.js';
export { WorkersStepRegistry, type StepDefinition, type StepDefinitionFunction } from './core/step-registry.js';

// Adapters
export {
  runCucumberInWorkers,
  type WorkersRuntime,
  type WorkersCucumberOptions,
  type WorkersCucumberResult
} from './adapters/workers-runtime-adapter.js';

// Formatters
export {
  BasicFormatter,
  TestStatus,
  type StepResult,
  type ScenarioResult,
  type TestSummary,
  type FormatterOptions
} from './formatters/basic-formatter.js';

// DSL functions for step definitions
import { ParameterTypeRegistry, ParameterType } from '@cucumber/cucumber-expressions';
import { WorkersStepRegistry } from './core/step-registry.js';

// Create a global registry for step definitions
const parameterTypeRegistry = new ParameterTypeRegistry();
const globalRegistry = new WorkersStepRegistry(parameterTypeRegistry);

/**
 * Register a Given step definition
 * 
 * @param pattern - Pattern for matching step text
 * @param fn - Function to execute when the step matches
 */
export function Given(pattern: string | RegExp, fn: (...args: any[]) => any): void {
  globalRegistry.register(pattern, fn);
}

/**
 * Register a When step definition
 * 
 * @param pattern - Pattern for matching step text
 * @param fn - Function to execute when the step matches
 */
export function When(pattern: string | RegExp, fn: (...args: any[]) => any): void {
  globalRegistry.register(pattern, fn);
}

/**
 * Register a Then step definition
 * 
 * @param pattern - Pattern for matching step text
 * @param fn - Function to execute when the step matches
 */
export function Then(pattern: string | RegExp, fn: (...args: any[]) => any): void {
  globalRegistry.register(pattern, fn);
}

/**
 * Get the global step registry
 * 
 * @returns The global step registry
 */
export function getRegistry(): WorkersStepRegistry {
  return globalRegistry;
}

/**
 * Define a custom parameter type
 * 
 * @param name - Name of the parameter type
 * @param regexp - Regular expression for matching the parameter
 * @param transformer - Function to transform the matched value
 */
export function defineParameterType({
  name,
  regexp,
  transformer
}: {
  name: string;
  regexp: RegExp;
  transformer: (s: string) => any;
}): void {
  const parameterType = new ParameterType(
    name,
    regexp,
    null,
    transformer,
    true,
    false
  );
  parameterTypeRegistry.defineParameterType(parameterType);
} 