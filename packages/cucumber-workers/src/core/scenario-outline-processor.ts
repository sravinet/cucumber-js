import type { 
  GherkinDocument, 
  Feature, 
  Scenario, 
  Examples, 
  Step, 
  Rule,
  PickleTable
} from '@cucumber/messages';
import { TagFilter } from './tag-filter.js';

/**
 * Interface for a processed scenario from a scenario outline
 */
export interface ProcessedScenario {
  /**
   * The name of the scenario with placeholders replaced
   */
  name: string;
  
  /**
   * The steps of the scenario with placeholders replaced
   */
  steps: ProcessedStep[];
  
  /**
   * The original scenario outline
   */
  originalScenario: Scenario;
  
  /**
   * The examples row that was used to process this scenario
   */
  examplesRow: string[];
  
  /**
   * The examples header that was used to process this scenario
   */
  examplesHeader: string[];
  
  /**
   * The line number of the examples row in the feature file
   */
  line: number;
  
  /**
   * Tags for this scenario (including inherited tags)
   */
  tags: string[];
}

/**
 * Interface for a processed step from a scenario outline
 */
export interface ProcessedStep {
  /**
   * The text of the step with placeholders replaced
   */
  text: string;
  
  /**
   * The keyword of the step (e.g., "Given", "When", "Then")
   */
  keyword: string;
  
  /**
   * The data table of the step with placeholders replaced, if any
   */
  dataTable?: PickleTable;
  
  /**
   * The doc string of the step with placeholders replaced, if any
   */
  docString?: {
    content: string;
    mediaType?: string;
  };
  
  /**
   * The original step
   */
  originalStep: Step;
}

/**
 * Class for processing scenario outlines and examples
 */
export class ScenarioOutlineProcessor {
  /**
   * Process a scenario outline and its examples to generate concrete scenarios
   * 
   * @param scenarioOutline The scenario outline to process
   * @param feature The feature containing the scenario outline
   * @param rule The rule containing the scenario outline, if any
   * @param tagFilter Optional tag filter to apply to examples
   * @returns Array of processed scenarios
   */
  processScenarioOutline(
    scenarioOutline: Scenario,
    feature: Feature,
    rule?: Rule,
    tagFilter?: TagFilter
  ): ProcessedScenario[] {
    if (!scenarioOutline.examples || scenarioOutline.examples.length === 0) {
      return [];
    }
    
    const result: ProcessedScenario[] = [];
    
    // Process each examples table
    for (const examples of scenarioOutline.examples) {
      // Skip examples that don't match the tag filter
      if (tagFilter && !tagFilter.matchesExamples(examples, scenarioOutline, feature, rule)) {
        continue;
      }
      
      // Skip examples without a header or body
      if (!examples.tableHeader || !examples.tableBody || examples.tableBody.length === 0) {
        continue;
      }
      
      // Get the header values
      const header = examples.tableHeader.cells.map(cell => cell.value);
      
      // Process each row in the examples table
      for (const row of examples.tableBody) {
        const values = row.cells.map(cell => cell.value);
        
        // Create a processed scenario for this row
        const processedScenario: ProcessedScenario = {
          name: this.replacePlaceholders(scenarioOutline.name, header, values),
          steps: this.processSteps(scenarioOutline.steps || [], header, values),
          originalScenario: scenarioOutline,
          examplesRow: values,
          examplesHeader: header,
          line: row.location.line,
          tags: this.collectTags(scenarioOutline, examples, feature, rule)
        };
        
        result.push(processedScenario);
      }
    }
    
    return result;
  }
  
  /**
   * Process all scenario outlines in a document
   * 
   * @param document The Gherkin document to process
   * @param tagFilter Optional tag filter to apply to examples
   * @returns Array of processed scenarios
   */
  processDocument(document: GherkinDocument, tagFilter?: TagFilter): ProcessedScenario[] {
    if (!document.feature) {
      return [];
    }
    
    const feature = document.feature;
    const result: ProcessedScenario[] = [];
    
    // Process scenario outlines directly in the feature
    for (const child of feature.children || []) {
      if (child.scenario && child.scenario.examples && child.scenario.examples.length > 0) {
        const processedScenarios = this.processScenarioOutline(
          child.scenario,
          feature,
          undefined,
          tagFilter
        );
        result.push(...processedScenarios);
      }
      
      // Process scenario outlines in rules
      if (child.rule) {
        for (const ruleChild of child.rule.children || []) {
          if (ruleChild.scenario && ruleChild.scenario.examples && ruleChild.scenario.examples.length > 0) {
            const processedScenarios = this.processScenarioOutline(
              ruleChild.scenario,
              feature,
              child.rule,
              tagFilter
            );
            result.push(...processedScenarios);
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Process the steps of a scenario outline
   * 
   * @param steps The steps to process
   * @param header The header values from the examples table
   * @param values The values from the examples row
   * @returns Array of processed steps
   */
  private processSteps(steps: readonly Step[], header: string[], values: string[]): ProcessedStep[] {
    return steps.map(step => {
      const processedStep: ProcessedStep = {
        text: this.replacePlaceholders(step.text, header, values),
        keyword: step.keyword,
        originalStep: step
      };
      
      // Process data table if present
      if (step.dataTable) {
        const rows = step.dataTable.rows.map(row => {
          return {
            cells: row.cells.map(cell => {
              return {
                value: this.replacePlaceholders(cell.value, header, values)
              };
            })
          };
        });
        
        processedStep.dataTable = {
          rows
        };
      }
      
      // Process doc string if present
      if (step.docString) {
        processedStep.docString = {
          content: this.replacePlaceholders(step.docString.content, header, values),
          mediaType: step.docString.mediaType
        };
      }
      
      return processedStep;
    });
  }
  
  /**
   * Replace placeholders in a string with values from an examples row
   * 
   * @param text The text containing placeholders
   * @param header The header values from the examples table
   * @param values The values from the examples row
   * @returns The text with placeholders replaced
   */
  private replacePlaceholders(text: string, header: string[], values: string[]): string {
    let result = text;
    
    for (let i = 0; i < header.length; i++) {
      const placeholder = `<${header[i]}>`;
      const value = values[i];
      
      // Replace all occurrences of the placeholder with the value
      result = result.split(placeholder).join(value);
    }
    
    return result;
  }
  
  /**
   * Collect all tags from a scenario outline, examples, feature, and rule
   * 
   * @param scenario The scenario outline
   * @param examples The examples table
   * @param feature The feature containing the scenario outline
   * @param rule The rule containing the scenario outline, if any
   * @returns Array of tag names
   */
  private collectTags(
    scenario: Scenario,
    examples: Examples,
    feature: Feature,
    rule?: Rule
  ): string[] {
    const featureTags = feature.tags?.map(tag => tag.name) || [];
    const ruleTags = rule?.tags?.map(tag => tag.name) || [];
    const scenarioTags = scenario.tags?.map(tag => tag.name) || [];
    const examplesTags = examples.tags?.map(tag => tag.name) || [];
    
    return [...featureTags, ...ruleTags, ...scenarioTags, ...examplesTags];
  }
} 