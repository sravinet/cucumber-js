/**
 * Vite plugin for Cucumber Workers
 * 
 * This plugin transforms feature files into importable modules and
 * provides HMR support for feature files and step definitions.
 * It integrates with @cloudflare/vite-plugin for Cloudflare Workers compatibility.
 */

import type { Plugin, ResolvedConfig } from 'vite';
import { Parser } from '@cucumber/gherkin';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Options for the Cucumber Workers Vite plugin
 */
export interface CucumberWorkersPluginOptions {
  /**
   * Glob pattern for feature files
   */
  featureGlob?: string;
  
  /**
   * Glob pattern for step definition files
   */
  stepDefinitionsGlob?: string;
  
  /**
   * Whether to include source maps
   */
  sourceMaps?: boolean;

  /**
   * Whether to enable HMR for feature files and step definitions
   */
  hmr?: boolean;

  /**
   * Whether to automatically register step definitions
   */
  autoRegisterSteps?: boolean;

  /**
   * Cloudflare Workers specific options
   */
  workers?: {
    /**
     * Whether to optimize for Cloudflare Workers
     */
    optimize?: boolean;

    /**
     * Memory limit for Cloudflare Workers (in MB)
     */
    memoryLimit?: number;

    /**
     * CPU limit for Cloudflare Workers (in ms)
     */
    cpuLimit?: number;
  };
}

/**
 * Create a Vite plugin for Cucumber Workers
 * 
 * @param options - Plugin options
 * @returns Vite plugin
 */
export function cucumberWorkers(options: CucumberWorkersPluginOptions = {}): Plugin {
  const {
    featureGlob = 'features/**/*.feature',
    stepDefinitionsGlob = 'features/step_definitions/**/*.{js,ts}',
    sourceMaps = true,
    hmr = true,
    autoRegisterSteps = true,
    workers = {
      optimize: true,
      memoryLimit: 128,
      cpuLimit: 10000
    }
  } = options;
  
  // Feature file manifest
  const featureFiles = new Map<string, string>();
  // Step definition files
  const stepDefinitionFiles = new Set<string>();
  
  // Resolved config
  let config: ResolvedConfig;
  
  return {
    name: 'vite-plugin-cucumber-workers',
    
    /**
     * Store the resolved config
     */
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    
    /**
     * Configure Vite for Cucumber Workers
     */
    config() {
      return {
        resolve: {
          alias: {
            '@cucumber/cucumber-workers': '@cucumber/cucumber-workers/src'
          }
        },
        optimizeDeps: {
          include: [
            '@cucumber/cucumber-expressions',
            '@cucumber/gherkin',
            '@cucumber/messages',
            '@cucumber/tag-expressions'
          ]
        },
        test: {
          environment: 'node',
          pool: '@cloudflare/vitest-pool-workers',
          poolOptions: {
            workers: {
              // Workers-specific configuration
              memoryLimit: workers.memoryLimit,
              cpuLimit: workers.cpuLimit
            }
          }
        }
      };
    },
    
    /**
     * Transform feature files into importable modules
     */
    transform(code, id) {
      if (id.endsWith('.feature')) {
        // Parse the feature file to validate it
        try {
          // Create a parser and parse the feature file
          const parser = new Parser() as any;
          
          // Parse the feature file
          parser.parse(code);
        } catch (error) {
          // Log the error and continue
          console.error(`Error parsing feature file ${id}: ${(error as Error).message}`);
          return null;
        }
        
        // Store the feature file content
        featureFiles.set(id, code);
        
        // Generate a JavaScript module that exports the feature file content
        const jsModule = `
          export default {
            path: ${JSON.stringify(id)},
            content: ${JSON.stringify(code)}
          };
        `;
        
        // Generate a source map if enabled
        if (sourceMaps) {
          // Create a simple source map that maps the generated JS back to the feature file
          const sourceMap = {
            version: 3,
            file: id + '.js',
            sources: [id],
            sourcesContent: [code],
            names: [],
            mappings: 'AAAA' // Basic mapping
          };
          
          return {
            code: jsModule,
            map: sourceMap
          };
        }
        
        return {
          code: jsModule,
          map: { mappings: '' }
        };
      }
      
      // Track step definition files
      if (autoRegisterSteps && id.match(/\.(js|ts)$/)) {
        const content = fs.readFileSync(id, 'utf-8');
        if (content.includes('@cucumber/cucumber-workers') && 
            (content.includes('Given(') || content.includes('When(') || content.includes('Then('))) {
          stepDefinitionFiles.add(id);
        }
      }
      
      return null;
    },
    
    /**
     * Configure the development server for HMR
     */
    configureServer(server) {
      if (!hmr) return;
      
      // Watch feature files for changes
      server.watcher.add(featureGlob);
      
      // Watch step definition files for changes
      server.watcher.add(stepDefinitionsGlob);
      
      // Handle HMR for feature files and step definitions
      server.watcher.on('change', (path) => {
        if (path.endsWith('.feature')) {
          // Invalidate the module to trigger a reload
          const module = server.moduleGraph.getModuleById(path);
          if (module) {
            server.moduleGraph.invalidateModule(module);
            server.ws.send({
              type: 'update',
              updates: [
                {
                  type: 'js-update',
                  path,
                  acceptedPath: path,
                  timestamp: Date.now()
                }
              ]
            });
          }
        } else if (stepDefinitionFiles.has(path)) {
          // Invalidate the module to trigger a reload
          const module = server.moduleGraph.getModuleById(path);
          if (module) {
            server.moduleGraph.invalidateModule(module);
            server.ws.send({
              type: 'update',
              updates: [
                {
                  type: 'js-update',
                  path,
                  acceptedPath: path,
                  timestamp: Date.now()
                }
              ]
            });
          }
        }
      });
    },
    
    /**
     * Build hook to discover and process feature files
     */
    async buildStart() {
      if (config.command === 'build') {
        try {
          // Discover feature files
          const featureFilePaths = await glob(featureGlob, { absolute: true });
          
          // Process each feature file
          for (const filePath of featureFilePaths) {
            const content = fs.readFileSync(filePath, 'utf-8');
            featureFiles.set(filePath, content);
          }
          
          // Discover step definition files
          if (autoRegisterSteps) {
            const stepFilePaths = await glob(stepDefinitionsGlob, { absolute: true });
            for (const filePath of stepFilePaths) {
              stepDefinitionFiles.add(filePath);
            }
          }
        } catch (error) {
          console.error('Error discovering feature files:', error);
        }
      }
    },
    
    /**
     * Generate a manifest of feature files
     */
    generateBundle() {
      if (config.command === 'build') {
        // Generate a manifest of feature files
        const manifest = {
          features: Array.from(featureFiles.keys()).map(path => ({
            path,
            relativePath: path.replace(config.root, '')
          })),
          stepDefinitions: Array.from(stepDefinitionFiles).map(path => ({
            path,
            relativePath: path.replace(config.root, '')
          }))
        };
        
        // Add the manifest to the bundle
        this.emitFile({
          type: 'asset',
          fileName: 'cucumber-workers-manifest.json',
          source: JSON.stringify(manifest, null, 2)
        });
      }
    }
  };
} 