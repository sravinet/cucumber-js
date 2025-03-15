/**
 * Type definitions for mime 3.0.0
 * Project: https://github.com/broofa/mime
 * Definitions by: Cucumber.js team
 */

declare module 'mime' {
  namespace mime {
    /**
     * Get the mime type associated with a file extension.
     * @param path Path to file or extension name (e.g. "txt")
     * @return Mime type or null if not found
     */
    function getType(path: string): string | null;

    /**
     * Get the default extension for a mime type.
     * @param type Mime type
     * @return Extension or null if not found
     */
    function getExtension(type: string): string | null;

    /**
     * Define a mime type.
     * @param typeMap Object with MIME type as key and extensions as values
     * @param force If true, overwrite existing extension mappings
     */
    function define(typeMap: Record<string, string[]>, force?: boolean): void;
  }

  export = mime;
} 