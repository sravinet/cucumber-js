import parse from '@cucumber/tag-expressions';
import type { GherkinDocument, Feature, Scenario, Rule, Examples } from '@cucumber/messages';

/**
 * Represents a tag filter that can be used to filter scenarios based on tags
 */
export class TagFilter {
  private readonly tagExpression: { evaluate: (tags: string[]) => boolean };

  /**
   * Creates a new TagFilter with the given tag expression
   * @param tagExpression The tag expression to use for filtering (e.g., '@smoke and not @slow')
   */
  constructor(tagExpression: string) {
    this.tagExpression = parse(tagExpression);
  }

  /**
   * Evaluates if the given tags match the tag expression
   * @param tags Array of tag names to check
   * @returns true if the tags match the tag expression, false otherwise
   */
  evaluate(tags: string[]): boolean {
    return this.tagExpression.evaluate(tags);
  }

  /**
   * Checks if a scenario matches the tag expression
   * @param scenario The scenario to check
   * @param feature The feature containing the scenario (for inherited tags)
   * @param rule The rule containing the scenario (for inherited tags), if any
   * @returns true if the scenario matches the tag expression, false otherwise
   */
  matchesScenario(scenario: Scenario, feature: Feature, rule?: Rule): boolean {
    const tags = this.collectTags(scenario, feature, rule);
    return this.tagExpression.evaluate(tags);
  }

  /**
   * Checks if an examples table matches the tag expression
   * @param examples The examples table to check
   * @param scenario The scenario outline containing the examples
   * @param feature The feature containing the scenario (for inherited tags)
   * @param rule The rule containing the scenario (for inherited tags), if any
   * @returns true if the examples table matches the tag expression, false otherwise
   */
  matchesExamples(examples: Examples, scenario: Scenario, feature: Feature, rule?: Rule): boolean {
    const scenarioTags = this.collectTags(scenario, feature, rule);
    const examplesTags = examples.tags?.map(tag => tag.name) || [];
    const allTags = [...scenarioTags, ...examplesTags];
    return this.tagExpression.evaluate(allTags);
  }

  /**
   * Checks if a document contains any scenarios that match the tag expression
   * @param document The Gherkin document to check
   * @returns true if any scenario in the document matches the tag expression, false otherwise
   */
  matchesDocument(document: GherkinDocument): boolean {
    if (!document.feature) {
      return false;
    }

    const feature = document.feature;
    
    // Check scenarios directly in the feature
    for (const child of feature.children || []) {
      if (child.scenario && this.matchesScenario(child.scenario, feature)) {
        return true;
      }

      // Check scenarios in rules
      if (child.rule) {
        for (const ruleChild of child.rule.children || []) {
          if (ruleChild.scenario && this.matchesScenario(ruleChild.scenario, feature, child.rule)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Collects all tags from a scenario, including inherited tags from feature and rule
   * @param scenario The scenario to collect tags from
   * @param feature The feature containing the scenario
   * @param rule The rule containing the scenario, if any
   * @returns An array of tag names
   */
  private collectTags(scenario: Scenario, feature: Feature, rule?: Rule): string[] {
    const featureTags = feature.tags?.map(tag => tag.name) || [];
    const ruleTags = rule?.tags?.map(tag => tag.name) || [];
    const scenarioTags = scenario.tags?.map(tag => tag.name) || [];
    
    return [...featureTags, ...ruleTags, ...scenarioTags];
  }
} 