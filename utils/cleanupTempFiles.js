import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the uploads directory path
const uploadsDir = path.join(__dirname, '../uploads');

/**
 * Delete a specific temporary file
 * @param {string} filePath - Path to the file to delete
 */
export const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
  }
};

/**
 * Delete multiple temporary files
 * @param {Array<string>} filePaths - Array of file paths to delete
 */
export const deleteFiles = async (filePaths) => {
  if (!Array.isArray(filePaths)) return;
  
  const deletePromises = filePaths.map(filePath => deleteFile(filePath));
  await Promise.all(deletePromises);
};

/**
 * Clean up all temporary files in the uploads directory
 * @param {number} maxAgeHours - Delete files older than this many hours (default: 1 hour)
 */
export const cleanupTempFiles = async (maxAgeHours = 1) => {
  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      return;
    }

    const files = await fs.promises.readdir(uploadsDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds

    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      
      try {
        const stats = await fs.promises.stat(filePath);
        
        // Skip directories
        if (stats.isDirectory()) continue;
        
        // Check if file is older than maxAge
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          totalSize += stats.size;
          await fs.promises.unlink(filePath);
          deletedCount++;
          console.log(`Deleted old temporary file: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleanup completed: Deleted ${deletedCount} temporary files, freed ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log('✅ No old temporary files found to cleanup');
    }

    return { deletedCount, totalSize };
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  }
};

/**
 * Clean up temporary files immediately after successful upload
 * @param {Object|Array} files - Multer file object(s) to clean up
 */
export const cleanupAfterUpload = async (files) => {
  try {
    if (!files) return;

    const filesToDelete = [];

    if (Array.isArray(files)) {
      // Multiple files
      files.forEach(file => {
        if (file && file.path) {
          filesToDelete.push(file.path);
        }
      });
    } else if (files.path) {
      // Single file
      filesToDelete.push(files.path);
    }

    if (filesToDelete.length > 0) {
      await deleteFiles(filesToDelete);
      console.log(`✅ Cleaned up ${filesToDelete.length} temporary files after upload`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up after upload:', error.message);
  }
};

/**
 * Start automatic cleanup interval
 * @param {number} intervalMinutes - Run cleanup every X minutes (default: 30 minutes)
 * @param {number} maxAgeHours - Delete files older than X hours (default: 1 hour)
 */
export const startAutomaticCleanup = (intervalMinutes = 60, maxAgeHours = 1) => {
  console.log(`🔄 Starting automatic temp file cleanup every ${intervalMinutes} minutes...`);
  
  // Run cleanup immediately on start
  cleanupTempFiles(maxAgeHours).catch(console.error);
  
  // Set up interval for periodic cleanup
  const interval = setInterval(() => {
    cleanupTempFiles(maxAgeHours).catch(console.error);
  }, 24* intervalMinutes * 60 * 1000);

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Stopping automatic cleanup...');
    clearInterval(interval);
  });

  process.on('SIGINT', () => {
    console.log('🛑 Stopping automatic cleanup...');
    clearInterval(interval);
  });

  return interval;
};

/**
 * Get statistics about the uploads directory
 */
export const getUploadsStats = async () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return { fileCount: 0, totalSize: 0, files: [] };
    }

    const files = await fs.promises.readdir(uploadsDir);
    let totalSize = 0;
    const fileDetails = [];

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      
      try {
        const stats = await fs.promises.stat(filePath);
        if (!stats.isDirectory()) {
          totalSize += stats.size;
          fileDetails.push({
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      } catch (error) {
        console.error(`Error getting stats for ${file}:`, error.message);
      }
    }

    return {
      fileCount: fileDetails.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      files: fileDetails
    };
  } catch (error) {
    console.error('Error getting uploads stats:', error.message);
    throw error;
  }
};
