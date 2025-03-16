/**
 * Step definition registry for Cloudflare Workers
 * 
 * Since Workers cannot dynamically load modules, this registry
 * provides a way to statically register step definitions.
 */
import { CucumberExpression, RegularExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';

/**
 * Step definition function type
 */
export type StepDefinitionFunction = (...args: any[]) => any;

/**
 * Step definition type
 */
export interface StepDefinition {
  /**
   * Pattern for matching step text
   */
  pattern: string | RegExp;
  
  /**
   * Function to execute when the step matches
   */
  fn: StepDefinitionFunction;
}

/**
 * Step definition with parsed expression
 */
interface ParsedStepDefinition {
  /**
   * Original pattern
   */
  pattern: string | RegExp;
  
  /**
   * Parsed expression
   */
  expression: CucumberExpression | RegularExpression;
  
  /**
   * Function to execute
   */
  fn: StepDefinitionFunction;
}

/**
 * Step definition registry for Workers environment
 */
export class WorkersStepRegistry {
  private definitions: ParsedStepDefinition[] = [];
  
  /**
   * Create a new step registry
   * 
   * @param parameterTypeRegistry - Parameter type registry for cucumber expressions
   */
  constructor(private parameterTypeRegistry: ParameterTypeRegistry = new ParameterTypeRegistry()) {}

  /**
   * Register a step definition
   * 
   * @param pattern - Pattern for matching step text
   * @param fn - Function to execute when the step matches
   */
  register(pattern: string | RegExp, fn: StepDefinitionFunction): void {
    const expression = typeof pattern === 'string'
      ? new CucumberExpression(pattern, this.parameterTypeRegistry)
      : new RegularExpression(pattern, this.parameterTypeRegistry);
    
    this.definitions.push({ pattern, expression, fn });
  }

  /**
   * Find a matching step definition for a given step text
   * 
   * @param stepText - Text of the step to match
   * @returns Matching step definition and arguments, or undefined if no match
   */
  findMatchingStep(stepText: string): { definition: ParsedStepDefinition, args: any[] } | undefined {
    for (const definition of this.definitions) {
      const match = definition.expression.match(stepText);
      if (match) {
        const args = match.map((arg: any) => arg.getValue());
        return { definition, args };
      }
    }
    return undefined;
  }

  /**
   * Execute a step with the given text
   * 
   * @param stepText - Text of the step to execute
   * @param world - World object to use as 'this' context
   * @returns Result of the step execution
   * @throws Error if no matching step definition is found
   */
  async executeStep(stepText: string, world: any): Promise<any> {
    const match = this.findMatchingStep(stepText);
    if (!match) {
      throw new Error(`No matching step definition found for: ${stepText}`);
    }
    
    const { definition, args } = match;
    return await definition.fn.apply(world, args);
  }

  /**
   * Get all registered step definitions
   * 
   * @returns Array of all registered step definitions
   */
  getAllDefinitions(): StepDefinition[] {
    return this.definitions.map(({ pattern, fn }) => ({ pattern, fn }));
  }
} 