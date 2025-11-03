import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

/**
 * Shared schema cache for HTTP-fetched external schemas.
 *
 * This cache is used by both generate-example.ts and manual-bundle-schema.ts
 * to avoid redundant HTTP requests when processing multiple schemas.
 */

// Persistent cache directory for external schemas
export const CACHE_DIR = process.env.SCHEMA_CACHE_DIR || path.join(os.tmpdir(), 'nhs-notify-schema-cache');
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`[CACHE] Created cache directory: ${CACHE_DIR}`);
}

/**
 * Generate a cache key from a URL
 */
function getCacheKey(url: string): string {
  const hash = crypto.createHash('sha256').update(url).digest('hex');
  return `${hash}.json`;
}

/**
 * Get cached schema if available and not expired
 */
export function getCachedSchema(url: string): string | null {
  const cacheFile = path.join(CACHE_DIR, getCacheKey(url));

  if (!fs.existsSync(cacheFile)) {
    console.log(`[CACHE] ✗ Cache MISS for ${url}`);
    return null;
  }

  try {
    const stats = fs.statSync(cacheFile);
    const age = Date.now() - stats.mtimeMs;

    if (age > CACHE_MAX_AGE_MS) {
      console.log(`[CACHE] Cache expired for ${url} (age: ${Math.round(age/1000/60)} minutes)`);
      fs.unlinkSync(cacheFile);
      return null;
    }

    const content = fs.readFileSync(cacheFile, 'utf-8');
    console.log(`[CACHE] ✓ Cache HIT for ${url} (age: ${Math.round(age/1000/60)} minutes)`);
    return content;
  } catch (err) {
    console.warn(`[CACHE] Error reading cache for ${url}:`, err);
    return null;
  }
}

/**
 * Store schema in cache
 */
export function setCachedSchema(url: string, content: string): void {
  const cacheFile = path.join(CACHE_DIR, getCacheKey(url));

  try {
    fs.writeFileSync(cacheFile, content, 'utf-8');
    console.log(`[CACHE] ✓ Cached schema from ${url}`);
  } catch (err) {
    console.warn(`[CACHE] Error writing cache for ${url}:`, err);
  }
}

/**
 * Clear all cached schemas
 */
export function clearCache(): number {
  console.log(`[CACHE] Clearing cache directory: ${CACHE_DIR}`);
  if (!fs.existsSync(CACHE_DIR)) {
    console.log(`[CACHE] Cache directory does not exist`);
    return 0;
  }

  const files = fs.readdirSync(CACHE_DIR);
  let cleared = 0;
  for (const file of files) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
      cleared++;
    }
  }
  console.log(`[CACHE] ✓ Cleared ${cleared} cached schema(s)`);
  return cleared;
}

/**
 * Get cache statistics
 */
export function getCacheInfo(): {
  directory: string;
  maxAgeHours: number;
  count: number;
  entries: Array<{ file: string; ageMinutes: number; expired: boolean }>;
} {
  const entries: Array<{ file: string; ageMinutes: number; expired: boolean }> = [];

  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      const ageMinutes = Math.round(age / 1000 / 60);
      const expired = age > CACHE_MAX_AGE_MS;

      entries.push({ file, ageMinutes, expired });
    }
  }

  return {
    directory: CACHE_DIR,
    maxAgeHours: CACHE_MAX_AGE_MS / 1000 / 60 / 60,
    count: entries.length,
    entries
  };
}

/**
 * Display cache information
 */
export function displayCacheInfo(): void {
  const info = getCacheInfo();

  console.log(`[CACHE] Cache directory: ${info.directory}`);
  console.log(`[CACHE] Cache max age: ${info.maxAgeHours} hours`);
  console.log(`[CACHE] Cached schemas: ${info.count}`);

  if (info.entries.length > 0) {
    console.log(`[CACHE] Cache entries:`);
    for (const entry of info.entries) {
      const expiredTag = entry.expired ? ' (EXPIRED)' : '';
      console.log(`[CACHE]   - ${entry.file}: ${entry.ageMinutes} minutes old${expiredTag}`);
    }
  }
}
