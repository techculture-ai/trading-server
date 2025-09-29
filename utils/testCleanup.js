import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  cleanupTempFiles, 
  getUploadsStats, 
  deleteFile,
  deleteFiles,
  cleanupAfterUpload
} from './cleanupTempFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test function to create dummy files
async function createTestFiles() {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create test files with different ages
  const testFiles = [
    { name: 'old-file-1.txt', content: 'Old test file 1', ageHours: 2 },
    { name: 'old-file-2.jpg', content: 'Old test image file', ageHours: 3 },
    { name: 'recent-file-1.txt', content: 'Recent test file 1', ageHours: 0.5 },
    { name: 'recent-file-2.png', content: 'Recent test image', ageHours: 0.1 }
  ];

  for (const file of testFiles) {
    const filePath = path.join(uploadsDir, file.name);
    fs.writeFileSync(filePath, file.content);
    
    // Set file modification time to simulate age
    const ageMs = file.ageHours * 60 * 60 * 1000;
    const pastTime = new Date(Date.now() - ageMs);
    fs.utimesSync(filePath, pastTime, pastTime);
    
    console.log(`Created test file: ${file.name} (age: ${file.ageHours}h)`);
  }

  return testFiles;
}

// Test cleanup functions
async function testCleanupFunctions() {
  console.log('\n🧪 Testing Cleanup Functions');
  console.log('================================');

  try {
    // Create test files
    console.log('\n1. Creating test files...');
    await createTestFiles();

    // Get initial stats
    console.log('\n2. Initial stats:');
    let stats = await getUploadsStats();
    console.log(`   Files: ${stats.fileCount}, Size: ${stats.totalSizeMB}MB`);
    stats.files.forEach(file => {
      const age = (Date.now() - file.modified.getTime()) / (1000 * 60 * 60);
      console.log(`   - ${file.name}: ${(file.size / 1024).toFixed(2)}KB, Age: ${age.toFixed(2)}h`);
    });

    // Test cleanup with 1 hour threshold
    console.log('\n3. Testing cleanup (files older than 1 hour)...');
    const result = await cleanupTempFiles(1);
    console.log(`   Deleted: ${result.deletedCount} files`);
    console.log(`   Freed: ${(result.totalSize / 1024).toFixed(2)}KB`);

    // Get stats after cleanup
    console.log('\n4. Stats after cleanup:');
    stats = await getUploadsStats();
    console.log(`   Files: ${stats.fileCount}, Size: ${stats.totalSizeMB}MB`);
    stats.files.forEach(file => {
      const age = (Date.now() - file.modified.getTime()) / (1000 * 60 * 60);
      console.log(`   - ${file.name}: ${(file.size / 1024).toFixed(2)}KB, Age: ${age.toFixed(2)}h`);
    });

    // Test force cleanup (delete all remaining files)
    console.log('\n5. Testing force cleanup (delete all files)...');
    const forceResult = await cleanupTempFiles(0);
    console.log(`   Deleted: ${forceResult.deletedCount} files`);

    // Final stats
    console.log('\n6. Final stats:');
    stats = await getUploadsStats();
    console.log(`   Files: ${stats.fileCount}, Size: ${stats.totalSizeMB}MB`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Test individual file deletion
async function testIndividualDeletion() {
  console.log('\n🧪 Testing Individual File Deletion');
  console.log('====================================');

  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const testFile = path.join(uploadsDir, 'test-delete.txt');
    
    // Create a test file
    fs.writeFileSync(testFile, 'Test content for deletion');
    console.log('Created test file for deletion');

    // Test deleteFile function
    await deleteFile(testFile);
    
    if (!fs.existsSync(testFile)) {
      console.log('✅ Individual file deletion successful');
    } else {
      console.log('❌ Individual file deletion failed');
    }

  } catch (error) {
    console.error('❌ Individual deletion test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Cleanup System Tests');
  console.log('=================================');

  await testIndividualDeletion();
  await testCleanupFunctions();

  console.log('\n🏁 All tests completed!');
  console.log('\nYou can now use the cleanup system with confidence:');
  console.log('- Automatic cleanup runs every 30 minutes');
  console.log('- Manual cleanup: POST /api/cleanup/manual');
  console.log('- View stats: GET /api/cleanup/stats');
  console.log('- Force cleanup: POST /api/cleanup/force');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testCleanupFunctions, testIndividualDeletion };
