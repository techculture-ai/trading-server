# Temporary File Cleanup System

This system automatically manages temporary files in the uploads directory to prevent disk space issues and ensure optimal server performance.

## 🎯 Features

- **Automatic Cleanup**: Runs every 30 minutes to clean files older than 1 hour
- **Manual Cleanup**: API endpoints for manual cleanup operations
- **Smart File Handling**: Automatically cleans up files after successful/failed uploads
- **Statistics**: Monitor uploads directory size and file count
- **Configurable**: Adjustable cleanup intervals and file age thresholds

## 📁 Files Structure

```
utils/
├── cleanupTempFiles.js     # Core cleanup functions
├── testCleanup.js          # Test suite for cleanup system
middlewares/
├── cleanupMiddleware.js    # Express middleware for automatic cleanup
routes/
├── cleanupRoutes.js        # API endpoints for manual operations
```

## 🔧 Core Functions

### `cleanupTempFiles(maxAgeHours)`
Cleans up files older than specified hours
- **Parameters**: `maxAgeHours` (default: 1)
- **Returns**: `{ deletedCount, totalSize }`

### `cleanupAfterUpload(files)`
Immediately cleans up specified files after upload
- **Parameters**: `files` - Multer file object(s)
- **Usage**: Call in controllers after successful Cloudinary upload

### `getUploadsStats()`
Returns statistics about uploads directory
- **Returns**: `{ fileCount, totalSize, totalSizeMB, files }`

### `startAutomaticCleanup(intervalMinutes, maxAgeHours)`
Starts automatic cleanup process
- **Parameters**: 
  - `intervalMinutes` (default: 30) - How often to run cleanup
  - `maxAgeHours` (default: 1) - Age threshold for file deletion

## 🚀 API Endpoints

### GET `/api/cleanup/stats`
Get uploads directory statistics
```json
{
  "success": true,
  "data": {
    "fileCount": 5,
    "totalSize": 1048576,
    "totalSizeMB": "1.00",
    "files": [...]
  },
  "message": "Found 5 files (1.00 MB)"
}
```

### POST `/api/cleanup/manual`
Trigger manual cleanup
```json
{
  "maxAgeHours": 2  // Optional, defaults to 1
}
```

### POST `/api/cleanup/force`
Force cleanup all files (dangerous - use carefully)

## 📝 Implementation Examples

### In Controllers
```javascript
import { cleanupAfterUpload } from "../utils/cleanupTempFiles.js";

export const createProject = async (req, res) => {
  try {
    // ... upload to Cloudinary ...
    const savedProject = await newProject.save();
    
    // Clean up temp file after successful upload
    await cleanupAfterUpload(req.file);
    
    res.status(201).json({ project: savedProject });
  } catch (error) {
    // Clean up temp file even on error
    await cleanupAfterUpload(req.file);
    res.status(500).json({ error: error.message });
  }
};
```

### In Main Server
```javascript
import { startAutomaticCleanup } from "./utils/cleanupTempFiles.js";

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start automatic cleanup: every 30 minutes, delete files older than 1 hour
  startAutomaticCleanup(30, 1);
});
```

## 🧪 Testing

Run the test suite to verify cleanup functionality:

```bash
node utils/testCleanup.js
```

The test creates dummy files with different ages and verifies:
- Files older than threshold are deleted
- Recent files are preserved
- Statistics are accurate
- Individual file deletion works

## ⚙️ Configuration

### Environment Variables
You can add these to your `.env` file:

```env
CLEANUP_INTERVAL_MINUTES=30
CLEANUP_MAX_AGE_HOURS=1
CLEANUP_ENABLED=true
```

### Customization
Modify the cleanup behavior in `index.js`:

```javascript
// Custom cleanup: every 15 minutes, delete files older than 30 minutes
startAutomaticCleanup(15, 0.5);

// More aggressive: every 60 minutes, delete files older than 2 hours
startAutomaticCleanup(60, 2);
```

## 📊 Monitoring

### View Current Status
```bash
curl http://localhost:5000/api/cleanup/stats
```

### Manual Cleanup
```bash
curl -X POST http://localhost:5000/api/cleanup/manual \
  -H "Content-Type: application/json" \
  -d '{"maxAgeHours": 2}'
```

## 🛡️ Error Handling

The cleanup system includes comprehensive error handling:
- Continues operation even if individual files fail to delete
- Logs errors without crashing the server
- Graceful shutdown on server termination
- Safe handling of non-existent directories

## 📋 Best Practices

1. **Controller Integration**: Always call `cleanupAfterUpload()` in both success and error cases
2. **Monitoring**: Regularly check `/api/cleanup/stats` to monitor disk usage
3. **Testing**: Run cleanup tests before deploying to production
4. **Backup**: Ensure important files are backed up before force cleanup
5. **Logging**: Monitor server logs for cleanup operations and errors

## 🚨 Important Notes

- **Force Cleanup**: Use `/api/cleanup/force` with extreme caution
- **File Age**: Based on file modification time, not creation time
- **Disk Space**: Monitor disk usage in production environments
- **Concurrent Uploads**: System handles multiple simultaneous uploads safely
- **Cloudinary**: Cleanup only affects local temporary files, not Cloudinary assets
