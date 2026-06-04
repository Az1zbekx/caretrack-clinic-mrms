const fs = require('fs').promises;
const path = require('path');

/**
 * Safely reads data from a JSON file.
 * If file does not exist, initializes it with an empty array.
 * @param {string} filePath - Absolute path to JSON file
 * @returns {Promise<Array>} - Parsed JSON array
 */
async function readJson(filePath) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (!content.trim()) {
        return [];
      }
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File does not exist, initialize it
        await fs.writeFile(filePath, '[]', 'utf8');
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error(`Database read error: ${error.message}`);
  }
}

/**
 * Safely writes data to a JSON file.
 * Uses atomic writing (write to temp file, then rename) to prevent file corruption.
 * @param {string} filePath - Absolute path to JSON file
 * @param {Array|Object} data - Data to write
 * @returns {Promise<void>}
 */
async function writeJson(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const content = JSON.stringify(data, null, 2);
    
    // Write to temp file first
    await fs.writeFile(tempPath, content, 'utf8');
    // Atomically rename temp file to target file
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error);
    // Cleanup temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch (_) {}
    throw new Error(`Database write error: ${error.message}`);
  }
}

module.exports = {
  readJson,
  writeJson
};
