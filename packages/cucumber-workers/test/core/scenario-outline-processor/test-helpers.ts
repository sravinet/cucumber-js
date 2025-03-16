import * as messages from '@cucumber/messages';

/**
 * Type definitions for Gherkin document mocks
 */
export type GherkinTag = {
  name: string;
  id: string;
  location: { line: number; column: number };
};

export type GherkinCell = {
  value: string;
  location: { line: number; column: number };
};

export type GherkinRow = {
  id: string;
  location: { line: number; column: number };
  cells: GherkinCell[];
};

export type GherkinTableHeader = {
  id: string;
  location: { line: number; column: number };
  cells: GherkinCell[];
};

export type GherkinTableBody = GherkinRow[];

export type GherkinDataTable = {
  location: { line: number; column: number };
  rows: GherkinRow[];
};

export type GherkinDocString = {
  content: string;
  delimiter: string;
  location: { line: number; column: number };
  mediaType: string;
};

export type GherkinStep = {
  id: string;
  keyword: string;
  text: string;
  location: { line: number; column: number };
  dataTable?: GherkinDataTable;
  docString?: GherkinDocString;
};

export type GherkinExamples = {
  id: string;
  keyword: string;
  name: string;
  description: string;
  location: { line: number; column: number };
  tags: GherkinTag[];
  tableHeader: GherkinTableHeader;
  tableBody: GherkinTableBody;
};

export type GherkinScenario = {
  id: string;
  keyword: string;
  name: string;
  description: string;
  location: { line: number; column: number };
  tags: GherkinTag[];
  steps: GherkinStep[];
  examples: GherkinExamples[];
};

export type GherkinRule = {
  id: string;
  keyword: string;
  name: string;
  description: string;
  location: { line: number; column: number };
  tags: GherkinTag[];
  children: { scenario: GherkinScenario }[];
};

export type GherkinFeatureChild = 
  | { scenario: GherkinScenario }
  | { rule: GherkinRule };

export type GherkinFeature = {
  children: GherkinFeatureChild[];
  keyword: string;
  name: string;
  description: string;
  location: { line: number; column: number };
  tags: GherkinTag[];
  language: string;
};

export type GherkinDocument = {
  comments: any[];
  feature: GherkinFeature;
  uri: string;
};

/**
 * Check if running in a Workers environment
 */
export function isWorkersEnvironment(): boolean {
  return typeof (globalThis as any).caches !== 'undefined' || 
         typeof (globalThis as any).Miniflare !== 'undefined';
}

/**
 * Create a new ID generator for tests
 */
export function createIdGenerator(): messages.IdGenerator.NewId {
  return messages.IdGenerator.uuid();
}

/**
 * Create a basic Gherkin document with a simple scenario outline
 */
export function createBasicScenarioOutlineDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-1',
            keyword: 'Scenario Outline',
            name: 'Test Scenario',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a <param> step',
                location: { line: 4, column: 13 },
                dataTable: undefined,
                docString: undefined
              },
              {
                id: 'step-2',
                keyword: 'When ',
                text: 'I do something',
                location: { line: 5, column: 13 },
                dataTable: undefined,
                docString: undefined
              },
              {
                id: 'step-3',
                keyword: 'Then ',
                text: 'I should see <result>',
                location: { line: 6, column: 13 },
                dataTable: undefined,
                docString: undefined
              }
            ],
            examples: [
              {
                id: 'examples-1',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 8, column: 13 },
                tags: [],
                tableHeader: {
                  id: 'header-1',
                  location: { line: 9, column: 15 },
                  cells: [
                    { value: 'param', location: { line: 9, column: 17 } },
                    { value: 'result', location: { line: 9, column: 25 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-1',
                    location: { line: 10, column: 15 },
                    cells: [
                      { value: 'first', location: { line: 10, column: 17 } },
                      { value: 'pass', location: { line: 10, column: 25 } }
                    ]
                  },
                  {
                    id: 'row-2',
                    location: { line: 11, column: 15 },
                    cells: [
                      { value: 'second', location: { line: 11, column: 17 } },
                      { value: 'fail', location: { line: 11, column: 25 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with a scenario outline containing a data table
 */
export function createDataTableScenarioOutlineDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-2',
            keyword: 'Scenario Outline',
            name: 'Test Scenario with Table',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a step with table:',
                location: { line: 4, column: 13 },
                docString: undefined,
                dataTable: {
                  location: { line: 5, column: 15 },
                  rows: [
                    {
                      id: 'dt-row-1',
                      location: { line: 5, column: 15 },
                      cells: [
                        { value: 'id', location: { line: 5, column: 17 } },
                        { value: 'name', location: { line: 5, column: 22 } }
                      ]
                    },
                    {
                      id: 'dt-row-2',
                      location: { line: 6, column: 15 },
                      cells: [
                        { value: '1', location: { line: 6, column: 17 } },
                        { value: '<name>', location: { line: 6, column: 22 } }
                      ]
                    }
                  ]
                }
              }
            ],
            examples: [
              {
                id: 'examples-2',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 9, column: 13 },
                tags: [],
                tableHeader: {
                  id: 'header-2',
                  location: { line: 10, column: 15 },
                  cells: [
                    { value: 'name', location: { line: 10, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-3',
                    location: { line: 11, column: 15 },
                    cells: [
                      { value: 'Alice', location: { line: 11, column: 17 } }
                    ]
                  },
                  {
                    id: 'row-4',
                    location: { line: 12, column: 15 },
                    cells: [
                      { value: 'Bob', location: { line: 12, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with a scenario outline containing a doc string
 */
export function createDocStringScenarioOutlineDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-3',
            keyword: 'Scenario Outline',
            name: 'Test Scenario with DocString',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a step with docstring:',
                location: { line: 4, column: 13 },
                dataTable: undefined,
                docString: {
                  content: 'This is a <param> docstring',
                  delimiter: '"""',
                  location: { line: 5, column: 15 },
                  mediaType: ''
                }
              }
            ],
            examples: [
              {
                id: 'examples-3',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 10, column: 13 },
                tags: [],
                tableHeader: {
                  id: 'header-3',
                  location: { line: 11, column: 15 },
                  cells: [
                    { value: 'param', location: { line: 11, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-5',
                    location: { line: 12, column: 15 },
                    cells: [
                      { value: 'first', location: { line: 12, column: 17 } }
                    ]
                  },
                  {
                    id: 'row-6',
                    location: { line: 13, column: 15 },
                    cells: [
                      { value: 'second', location: { line: 13, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with tagged examples
 */
export function createTaggedExamplesDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-4',
            keyword: 'Scenario Outline',
            name: 'Test Scenario',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a <param> step',
                location: { line: 4, column: 13 },
                dataTable: undefined,
                docString: undefined
              }
            ],
            examples: [
              {
                id: 'examples-4',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 7, column: 13 },
                tags: [{ name: '@smoke', id: 'tag-1', location: { line: 6, column: 13 } }],
                tableHeader: {
                  id: 'header-4',
                  location: { line: 8, column: 15 },
                  cells: [
                    { value: 'param', location: { line: 8, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-7',
                    location: { line: 9, column: 15 },
                    cells: [
                      { value: 'first', location: { line: 9, column: 17 } }
                    ]
                  }
                ]
              },
              {
                id: 'examples-5',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 12, column: 13 },
                tags: [{ name: '@regression', id: 'tag-2', location: { line: 11, column: 13 } }],
                tableHeader: {
                  id: 'header-5',
                  location: { line: 13, column: 15 },
                  cells: [
                    { value: 'param', location: { line: 13, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-8',
                    location: { line: 14, column: 15 },
                    cells: [
                      { value: 'second', location: { line: 14, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with multiple scenario outlines
 */
export function createMultipleScenarioOutlinesDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-5',
            keyword: 'Scenario Outline',
            name: 'First Scenario',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a <param1> step',
                location: { line: 4, column: 13 },
                dataTable: undefined,
                docString: undefined
              }
            ],
            examples: [
              {
                id: 'examples-6',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 6, column: 13 },
                tags: [],
                tableHeader: {
                  id: 'header-6',
                  location: { line: 7, column: 15 },
                  cells: [
                    { value: 'param1', location: { line: 7, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-9',
                    location: { line: 8, column: 15 },
                    cells: [
                      { value: 'first', location: { line: 8, column: 17 } }
                    ]
                  },
                  {
                    id: 'row-10',
                    location: { line: 9, column: 15 },
                    cells: [
                      { value: 'second', location: { line: 9, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          scenario: {
            id: 'scenario-6',
            keyword: 'Scenario Outline',
            name: 'Second Scenario',
            description: '',
            location: { line: 12, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-2',
                keyword: 'Given ',
                text: 'a <param2> step',
                location: { line: 13, column: 13 },
                dataTable: undefined,
                docString: undefined
              }
            ],
            examples: [
              {
                id: 'examples-7',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 15, column: 13 },
                tags: [],
                tableHeader: {
                  id: 'header-7',
                  location: { line: 16, column: 15 },
                  cells: [
                    { value: 'param2', location: { line: 16, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-11',
                    location: { line: 17, column: 15 },
                    cells: [
                      { value: 'third', location: { line: 17, column: 17 } }
                    ]
                  },
                  {
                    id: 'row-12',
                    location: { line: 18, column: 15 },
                    cells: [
                      { value: 'fourth', location: { line: 18, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with a rule containing a scenario outline
 */
export function createRuleScenarioOutlineDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          rule: {
            id: 'rule-1',
            keyword: 'Rule',
            name: 'Test Rule',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            children: [
              {
                scenario: {
                  id: 'scenario-7',
                  keyword: 'Scenario Outline',
                  name: 'Rule Scenario',
                  description: '',
                  location: { line: 4, column: 13 },
                  tags: [],
                  steps: [
                    {
                      id: 'step-1',
                      keyword: 'Given ',
                      text: 'a <param> step',
                      location: { line: 5, column: 15 },
                      dataTable: undefined,
                      docString: undefined
                    }
                  ],
                  examples: [
                    {
                      id: 'examples-8',
                      keyword: 'Examples',
                      name: '',
                      description: '',
                      location: { line: 7, column: 15 },
                      tags: [],
                      tableHeader: {
                        id: 'header-8',
                        location: { line: 8, column: 17 },
                        cells: [
                          { value: 'param', location: { line: 8, column: 19 } }
                        ]
                      },
                      tableBody: [
                        {
                          id: 'row-13',
                          location: { line: 9, column: 17 },
                          cells: [
                            { value: 'rule', location: { line: 9, column: 19 } }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
}

/**
 * Create a Gherkin document with tagged scenario outlines
 */
export function createTaggedScenarioOutlinesDocument(): GherkinDocument {
  return {
    comments: [],
    feature: {
      children: [
        {
          scenario: {
            id: 'scenario-8',
            keyword: 'Scenario Outline',
            name: 'First Scenario',
            description: '',
            location: { line: 3, column: 11 },
            tags: [],
            steps: [
              {
                id: 'step-1',
                keyword: 'Given ',
                text: 'a <param1> step',
                location: { line: 4, column: 13 },
                dataTable: undefined,
                docString: undefined
              }
            ],
            examples: [
              {
                id: 'examples-9',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 7, column: 13 },
                tags: [{ name: '@smoke', id: 'tag-3', location: { line: 6, column: 13 } }],
                tableHeader: {
                  id: 'header-9',
                  location: { line: 8, column: 15 },
                  cells: [
                    { value: 'param1', location: { line: 8, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-14',
                    location: { line: 9, column: 15 },
                    cells: [
                      { value: 'first', location: { line: 9, column: 17 } }
                    ]
                  }
                ]
              },
              {
                id: 'examples-10',
                keyword: 'Examples',
                name: '',
                description: '',
                location: { line: 12, column: 13 },
                tags: [{ name: '@regression', id: 'tag-4', location: { line: 11, column: 13 } }],
                tableHeader: {
                  id: 'header-10',
                  location: { line: 13, column: 15 },
                  cells: [
                    { value: 'param1', location: { line: 13, column: 17 } }
                  ]
                },
                tableBody: [
                  {
                    id: 'row-15',
                    location: { line: 14, column: 15 },
                    cells: [
                      { value: 'second', location: { line: 14, column: 17 } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ],
      keyword: 'Feature',
      name: 'Test Feature',
      description: '',
      location: { line: 1, column: 1 },
      tags: [],
      language: 'en'
    },
    uri: 'test.feature'
  };
} 