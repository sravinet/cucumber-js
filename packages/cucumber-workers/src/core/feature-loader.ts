/**
 * Feature file loader for Cloudflare Workers
 * 
 * Since Workers cannot access the file system directly, this loader
 * provides a way to register and load feature files in memory.
 */

/**
 * Interface for a feature file
 */
export interface FeatureFile {
  /**
   * Path or identifier for the feature file
   */
  path: string;
  
  /**
   * Content of the feature file in Gherkin syntax
   */
  content: string;
}

/**
 * Feature file loader for Workers environment
 */
export class WorkersFeatureLoader {
  private features = new Map<string, string>();

  /**
   * Register a feature file
   * 
   * @param path - Path or identifier for the feature file
   * @param content - Content of the feature file in Gherkin syntax
   */
  register(path: string, content: string): void {
    this.features.set(path, content);
  }

  /**
   * Register multiple feature files
   * 
   * @param features - Array of feature files to register
   */
  registerAll(features: FeatureFile[]): void {
    for (const feature of features) {
      this.register(feature.path, feature.content);
    }
  }

  /**
   * Load a feature file by path
   * 
   * @param path - Path or identifier for the feature file
   * @returns The content of the feature file
   * @throws Error if the feature file is not found
   */
  async load(path: string): Promise<string> {
    const content = this.features.get(path);
    if (content === undefined) {
      throw new Error(`Feature file not found: ${path}`);
    }
    return content;
  }

  /**
   * Check if a feature file exists
   * 
   * @param path - Path or identifier for the feature file
   * @returns True if the feature file exists, false otherwise
   */
  exists(path: string): boolean {
    return this.features.has(path);
  }

  /**
   * Get all registered feature files
   * 
   * @returns Array of all registered feature files
   */
  getAllFeatures(): FeatureFile[] {
    return Array.from(this.features.entries()).map(([path, content]) => ({
      path,
      content
    }));
  }
} 