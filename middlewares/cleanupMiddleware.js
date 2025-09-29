import { cleanupAfterUpload } from "../utils/cleanupTempFiles.js";

/**
 * Middleware to automatically clean up uploaded files after request completion
 * This ensures temp files are cleaned up regardless of success/failure
 */
export const cleanupMiddleware = (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;
  const originalSend = res.send;
  
  // Override res.end to cleanup files
  res.end = function(...args) {
    // Clean up uploaded files
    if (req.file || req.files) {
      setImmediate(async () => {
        try {
          await cleanupAfterUpload(req.file || req.files);
        } catch (error) {
          console.error('Error in cleanup middleware:', error.message);
        }
      });
    }
    
    // Call original end function
    return originalEnd.apply(this, args);
  };

  // Override res.send to cleanup files
  res.send = function(...args) {
    // Clean up uploaded files
    if (req.file || req.files) {
      setImmediate(async () => {
        try {
          await cleanupAfterUpload(req.file || req.files);
        } catch (error) {
          console.error('Error in cleanup middleware:', error.message);
        }
      });
    }
    
    // Call original send function
    return originalSend.apply(this, args);
  };

  next();
};

/**
 * Simple cleanup middleware that can be added to specific routes
 */
export const simpleCleanup = async (req, res, next) => {
  try {
    // Continue with the request
    next();
  } finally {
    // Clean up after request completes (success or failure)
    if (req.file || req.files) {
      setImmediate(async () => {
        try {
          await cleanupAfterUpload(req.file || req.files);
        } catch (error) {
          console.error('Error in simple cleanup middleware:', error.message);
        }
      });
    }
  }
};
