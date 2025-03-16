/**
 * Feature file transformer for Vitest
 * 
 * This transformer converts .feature files into importable modules.
 */

export default {
  /**
   * Process a feature file
   * 
   * @param {string} sourceText - Feature file content
   * @param {string} id - Feature file path
   * @returns {object} - Transformed module
   */
  process(sourceText, id) {
    // Generate a JavaScript module that exports the feature file content
    const code = `
      export default {
        path: ${JSON.stringify(id)},
        content: ${JSON.stringify(sourceText)}
      };
    `;
    
    return {
      code,
      map: { mappings: '' }
    };
  }
}; 