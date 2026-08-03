import { join } from "path"
import { pathToFileURL } from "url"

/**
 * Build a file:// URL for a dynamic import relative to the running module.
 * pathToFileURL is required on Windows: `import("C:\\...")` is parsed as a
 * URL with scheme "c:" and throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
 */
export function fileImportURL(dirname: string, ...parts: string[]): string {
  return pathToFileURL(join(dirname, ...parts)).href
}
