import { describe, it, expect } from 'vitest';
import { GherkinDocument, Feature, Scenario, Rule, Examples } from '@cucumber/messages';
import { TagFilter } from '../../src/core/tag-filter.js';

describe('TagFilter', () => {
  describe('matchesScenario', () => {
    it('should match a scenario with a matching tag', () => {
      const filter = new TagFilter('@smoke');
      const scenario = createScenario(['@smoke']);
      const feature = createFeature([]);
      
      expect(filter.matchesScenario(scenario, feature)).toBe(true);
    });

    it('should not match a scenario without a matching tag', () => {
      const filter = new TagFilter('@smoke');
      const scenario = createScenario(['@regression']);
      const feature = createFeature([]);
      
      expect(filter.matchesScenario(scenario, feature)).toBe(false);
    });

    it('should match a scenario with a tag inherited from the feature', () => {
      const filter = new TagFilter('@smoke');
      const scenario = createScenario([]);
      const feature = createFeature(['@smoke']);
      
      expect(filter.matchesScenario(scenario, feature)).toBe(true);
    });

    it('should match a scenario with a tag inherited from the rule', () => {
      const filter = new TagFilter('@smoke');
      const scenario = createScenario([]);
      const feature = createFeature([]);
      const rule = createRule(['@smoke']);
      
      expect(filter.matchesScenario(scenario, feature, rule)).toBe(true);
    });

    it('should support complex tag expressions', () => {
      const filter = new TagFilter('@smoke and not @slow');
      const scenario = createScenario(['@smoke', '@fast']);
      const feature = createFeature([]);
      
      expect(filter.matchesScenario(scenario, feature)).toBe(true);
      
      const slowScenario = createScenario(['@smoke', '@slow']);
      expect(filter.matchesScenario(slowScenario, feature)).toBe(false);
    });
  });

  describe('matchesExamples', () => {
    it('should match examples with a matching tag', () => {
      const filter = new TagFilter('@smoke');
      const examples = createExamples(['@smoke']);
      const scenario = createScenario([]);
      const feature = createFeature([]);
      
      expect(filter.matchesExamples(examples, scenario, feature)).toBe(true);
    });

    it('should match examples with a tag inherited from the scenario', () => {
      const filter = new TagFilter('@smoke');
      const examples = createExamples([]);
      const scenario = createScenario(['@smoke']);
      const feature = createFeature([]);
      
      expect(filter.matchesExamples(examples, scenario, feature)).toBe(true);
    });
  });

  describe('matchesDocument', () => {
    it('should match a document with a matching scenario', () => {
      const filter = new TagFilter('@smoke');
      const document = createDocument([
        createScenario(['@regression']),
        createScenario(['@smoke'])
      ]);
      
      expect(filter.matchesDocument(document)).toBe(true);
    });

    it('should not match a document without any matching scenarios', () => {
      const filter = new TagFilter('@smoke');
      const document = createDocument([
        createScenario(['@regression']),
        createScenario(['@e2e'])
      ]);
      
      expect(filter.matchesDocument(document)).toBe(false);
    });

    it('should match a document with a scenario in a rule', () => {
      const filter = new TagFilter('@smoke');
      const document = createGherkinDocument({
        feature: createFeature([])
      });
      
      // Add a rule with a scenario to the feature
      if (document.feature) {
        document.feature.children = [
          {
            rule: {
              ...createRule([]),
              children: [
                { scenario: createScenario(['@smoke']) }
              ]
            }
          }
        ];
      }
      
      expect(filter.matchesDocument(document)).toBe(true);
    });
  });
});

// Helper functions to create test data

function createTag(name: string) {
  return { name, id: '', location: { line: 1, column: 1 } };
}

function createScenario(tags: string[]): Scenario {
  return {
    id: '',
    name: 'Test Scenario',
    description: '',
    tags: tags.map(createTag),
    examples: [],
    keyword: 'Scenario',
    location: { line: 1, column: 1 },
    steps: []
  };
}

function createFeature(tags: string[]): Feature {
  return {
    name: 'Test Feature',
    description: '',
    tags: tags.map(createTag),
    children: [],
    keyword: 'Feature',
    language: 'en',
    location: { line: 1, column: 1 }
  };
}

function createRule(tags: string[]): Rule {
  return {
    id: '',
    name: 'Test Rule',
    description: '',
    tags: tags.map(createTag),
    children: [],
    keyword: 'Rule',
    location: { line: 1, column: 1 }
  };
}

function createExamples(tags: string[]): Examples {
  return {
    id: '',
    name: 'Test Examples',
    description: '',
    tags: tags.map(createTag),
    keyword: 'Examples',
    location: { line: 1, column: 1 },
    tableBody: [],
    tableHeader: { id: '', location: { line: 1, column: 1 }, cells: [] }
  };
}

function createDocument(scenarios: Scenario[]): GherkinDocument {
  const feature = createFeature([]);
  feature.children = scenarios.map(scenario => ({ scenario }));
  
  return createGherkinDocument({
    feature
  });
}

function createGherkinDocument(partial: Partial<GherkinDocument>): GherkinDocument {
  return {
    uri: 'test.feature',
    ...partial
  } as GherkinDocument;
} 