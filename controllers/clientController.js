import clientModel from "../models/clientModel.js";
import AuditLog from "../models/auditLogModel.js";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Parser } from "json2csv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to normalize column names (remove BOM, trim, handle variations)
const normalizeColumnName = (columnName) => {
  if (!columnName) return '';
  
  // Remove BOM character (\uFEFF)
  let normalized = columnName.replace(/^\uFEFF/, '');
  
  // Trim whitespace
  normalized = normalized.trim();
  
  return normalized;
};

// Helper function to find column by normalized name
const findColumn = (headers, searchName) => {
  const normalizedSearch = normalizeColumnName(searchName).toLowerCase();
  return headers.find(h => normalizeColumnName(h).toLowerCase() === normalizedSearch);
};

// Column mapping from CSV headers to database fields
// Include variations of column names
const COLUMN_MAPPING = {
  'Trading Code': 'tradingCode',
  'Owner': 'owner',
  'Name': 'name',
  'Mobile No': 'mobileNo',
  'Mobile': 'mobileNo',
  'Email ID': 'emailId',
  'Email': 'emailId',
  'DP Client ID': 'dpClientId',
  'DP Client id': 'dpClientId', // Handle case variation
  'Branch Code': 'branchCode',
  'RMTL Code': 'rmtlCode',
  'Investor Type': 'investorType',
  'A/c Open Date': 'accountOpenDate',
  'Account Open Date': 'accountOpenDate',
  'Account Status': 'accountStatus',
  'First Trade Date': 'firstTradeDate',
  'First Trade': 'firstTradeDate', // Handle variation
  'Holding Value': 'holdingValue',
  'Ledger Balance': 'ledgerBalance',
  'Last Trade Date': 'lastTradeDate',
  'YTD Brok.': 'ytdBrok',
  'YTD Brok': 'ytdBrok',
  'Active Exchange': 'activeExchange',
  'Active Exchang': 'activeExchange', // Handle typo/truncation
  'POA/DDPI': 'poaDdpi',
  'Nominee': 'nominee',
  'Annual Income': 'annualIncome',
  'Occupation': 'occupation',
  'City': 'city',
  'State': 'state',
  'Last Login Date': 'lastLoginDate',
  'Calling Status': 'callingStatus',
  'Next Follow up Date': 'nextFollowUpDate',
  'Remarks': 'remarks',
};

// Create a normalized mapping
const createNormalizedMapping = () => {
  const normalized = {};
  Object.keys(COLUMN_MAPPING).forEach(key => {
    const normalizedKey = normalizeColumnName(key);
    normalized[normalizedKey] = COLUMN_MAPPING[key];
  });
  return normalized;
};

// Upload CSV and save to database
export const uploadCSV = async (req, res) => {
  let filePath = null;
  let responseSent = false;

  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      return res.status(statusCode).json(data);
    }
  };

  const cleanupFile = () => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  };

  const createDuplicateCSV = (duplicateRecords, csvHeaders) => {
    try {
      if (duplicateRecords.length === 0) return null;

      const json2csvParser = new Parser({ fields: csvHeaders });
      const csv = json2csvParser.parse(duplicateRecords);
      
      const duplicatesDir = path.join(__dirname, '..', 'uploads', 'duplicates');
      if (!fs.existsSync(duplicatesDir)) {
        fs.mkdirSync(duplicatesDir, { recursive: true });
      }

      const filename = `duplicates_${Date.now()}.csv`;
      const filepath = path.join(duplicatesDir, filename);
      
      fs.writeFileSync(filepath, csv);
      
      return {
        filename,
        filepath,
        url: `/duplicates/${filename}`
      };
    } catch (error) {
      console.error("Error creating duplicate CSV:", error);
      return null;
    }
  };

  const normalizeColumnName = (columnName) => {
    if (!columnName) return '';
    let normalized = columnName.replace(/^\uFEFF/, '');
    normalized = normalized.trim();
    return normalized;
  };

  const COLUMN_MAPPING = {
    'Trading Code': 'tradingCode',
    'Owner': 'owner',
    'Name': 'name',
    'Mobile No': 'mobileNo',
    'Mobile': 'mobileNo',
    'Email ID': 'emailId',
    'Email': 'emailId',
    'DP Client ID': 'dpClientId',
    'DP Client id': 'dpClientId',
    'Branch Code': 'branchCode',
    'RMTL Code': 'rmtlCode',
    'Investor Type': 'investorType',
    'A/c Open Date': 'accountOpenDate',
    'Account Open Date': 'accountOpenDate',
    'Account Status': 'accountStatus',
    'First Trade Date': 'firstTradeDate',
    'First Trade': 'firstTradeDate',
    'Holding Value': 'holdingValue',
    'Ledger Balance': 'ledgerBalance',
    'Last Trade Date': 'lastTradeDate',
    'YTD Brok.': 'ytdBrok',
    'YTD Brok': 'ytdBrok',
    'Active Exchange': 'activeExchange',
    'Active Exchang': 'activeExchange',
    'POA/DDPI': 'poaDdpi',
    'Nominee': 'nominee',
    'Annual Income': 'annualIncome',
    'Occupation': 'occupation',
    'City': 'city',
    'State': 'state',
    'Last Login Date': 'lastLoginDate',
    'Calling Status': 'callingStatus',
    'Next Follow up Date': 'nextFollowUpDate',
    'Remarks': 'remarks',
  };

  const createNormalizedMapping = () => {
    const normalized = {};
    Object.keys(COLUMN_MAPPING).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalized[normalizedKey] = COLUMN_MAPPING[key];
    });
    return normalized;
  };

  try {
    if (!req.file) {
      return sendResponse(400, { message: "No file uploaded" });
    }

    filePath = req.file.path;
    const results = [];
    let csvHeaders = [];
    let normalizedHeaders = [];
    let detectedColumns = [];
    let missingColumns = [];
    let extraColumns = [];
    const normalizedMapping = createNormalizedMapping();

    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser())
      .on("headers", (headerList) => {
        if (responseSent) return;

        csvHeaders = headerList.map(h => normalizeColumnName(h));
        normalizedHeaders = csvHeaders.filter(h => h !== '');
        
        console.log("Normalized CSV Headers:", normalizedHeaders);

        const hasTradingCode = normalizedHeaders.some(
          h => h.toLowerCase() === 'trading code'
        );

        if (!hasTradingCode) {
          cleanupFile();
          stream.destroy();
          return sendResponse(400, {
            message: "CSV must contain 'Trading Code' column (required field). Found columns: " + normalizedHeaders.join(", ")
          });
        }

        detectedColumns = normalizedHeaders.filter(
          header => normalizedMapping.hasOwnProperty(header)
        );
        
        const expectedColumns = Object.keys(normalizedMapping);
        missingColumns = expectedColumns.filter(
          header => !normalizedHeaders.some(h => h.toLowerCase() === header.toLowerCase())
        );

        extraColumns = normalizedHeaders.filter(
          header => !normalizedMapping.hasOwnProperty(header) && header !== ''
        );

        console.log("Detected columns:", detectedColumns);
      })
      .on("data", (data) => {
        if (responseSent) return;

        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = normalizeColumnName(key);
          if (normalizedKey) {
            normalizedData[normalizedKey] = data[key];
          }
        });

        const hasData = Object.values(normalizedData).some(
          (value) => value && String(value).trim() !== ""
        );

        const tradingCodeValue = normalizedData['Trading Code'];
        
        if (hasData && tradingCodeValue && String(tradingCodeValue).trim()) {
          results.push(normalizedData);
        }
      })
      .on("end", async () => {
        if (responseSent) return;

        try {
          cleanupFile();

          if (results.length === 0) {
            return sendResponse(400, {
              message: "CSV file is empty or contains no valid data",
            });
          }

          console.log(`Processing ${results.length} records...`);

          // For large files, send immediate response and process in background
          if (results.length > 1000) {
            // Send immediate response
            sendResponse(202, {
              message: "Large file received. Processing in background...",
              totalRows: results.length,
              status: "processing",
              estimatedTime: `${Math.ceil(results.length / 100)} seconds`,
            });

            // Continue processing in background
            processLargeUpload(results, normalizedHeaders, normalizedMapping, req.user?._id);
            return;
          }

          // For smaller files, process normally
          const csvTradingCodes = results
            .map((row) => row['Trading Code'])
            .filter((code) => code && String(code).trim() !== "");

          console.log(`Checking ${csvTradingCodes.length} trading codes for duplicates`);

          const existingClients = await clientModel
            .find({
              tradingCode: { $in: csvTradingCodes },
            })
            .lean();

          console.log(`Found ${existingClients.length} existing clients in database`);

          const existingTradingCodes = new Set(
            existingClients.map((client) => client.tradingCode)
          );

          const newRecords = [];
          const duplicateRecords = [];
          const skippedCodes = [];

          results.forEach((row) => {
            const tradingCode = row['Trading Code'];

            if (!tradingCode || String(tradingCode).trim() === "") {
              return;
            }

            if (existingTradingCodes.has(tradingCode)) {
              duplicateRecords.push(row);
              skippedCodes.push(tradingCode);
            } else {
              newRecords.push(row);
              existingTradingCodes.add(tradingCode);
            }
          });

          console.log(`New records: ${newRecords.length}, Duplicates: ${duplicateRecords.length}`);

          let duplicateFileInfo = null;
          if (duplicateRecords.length > 0) {
            duplicateFileInfo = createDuplicateCSV(duplicateRecords, normalizedHeaders);
          }

          // Batch insert for better performance
          const savedClients = [];
          const failedRecords = [];
          const BATCH_SIZE = 100;

          for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
            const batch = newRecords.slice(i, i + BATCH_SIZE);
            const clientsToInsert = [];

            batch.forEach((row) => {
              try {
                const clientData = {};
                
                normalizedHeaders.forEach((csvHeader) => {
                  if (normalizedMapping[csvHeader]) {
                    const dbField = normalizedMapping[csvHeader];
                    const value = row[csvHeader];
                    
                    if (value !== undefined && value !== null && String(value).trim() !== '') {
                      clientData[dbField] = String(value).trim();
                    }
                  }
                });

                clientsToInsert.push({
                  ...clientData,
                  uploadedBy: req.user?._id,
                  isRead: false,
                });
              } catch (error) {
                console.error("Error preparing client:", error);
                failedRecords.push({
                  tradingCode: row['Trading Code'],
                  error: error.message,
                });
              }
            });

            try {
              const inserted = await clientModel.insertMany(clientsToInsert, { ordered: false });
              savedClients.push(...inserted);
              console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: Saved ${inserted.length} records`);
            } catch (error) {
              console.error("Batch insert error:", error);
              // Handle duplicate key errors
              if (error.writeErrors) {
                error.writeErrors.forEach(err => {
                  failedRecords.push({
                    tradingCode: err.err.op?.tradingCode || 'unknown',
                    error: err.err.errmsg,
                  });
                });
              }
            }
          }

          console.log(`Saved ${savedClients.length} new clients to database`);

          const response = {
            message: "CSV upload processed successfully",
            totalRows: results.length,
            newRecords: savedClients.length,
            duplicatesSkipped: duplicateRecords.length,
            failedRecords: failedRecords.length,
            clients: savedClients.slice(0, 10), // Return only first 10
            columnInfo: {
              detectedColumns: detectedColumns,
              missingColumns: missingColumns,
              extraColumns: extraColumns,
              totalDetected: detectedColumns.length,
              totalExpected: Object.keys(normalizedMapping).length,
            }
          };

          if (duplicateRecords.length > 0) {
            response.skippedTradingCodes = skippedCodes.slice(0, 10);
            response.duplicateMessage = `${duplicateRecords.length} record(s) skipped`;
            
            if (duplicateFileInfo) {
              response.duplicateFile = {
                filename: duplicateFileInfo.filename,
                downloadUrl: duplicateFileInfo.url,
                recordCount: duplicateRecords.length,
              };
            }
          }

          if (failedRecords.length > 0) {
            response.failedRecordsDetails = failedRecords.slice(0, 10);
            response.failedMessage = `${failedRecords.length} record(s) failed to save`;
          }

          if (missingColumns.length > 0) {
            response.warnings = [
              `${missingColumns.length} expected column(s) are missing`
            ];
          }

          return sendResponse(201, response);
        } catch (error) {
          console.error("Processing error:", error);
          console.error("Error stack:", error.stack);
          cleanupFile();
          return sendResponse(500, {
            message: error.message || "Failed to process CSV",
          });
        }
      })
      .on("error", (error) => {
        if (responseSent) return;

        console.error("CSV parsing error:", error);
        cleanupFile();
        return sendResponse(500, {
          message: "Error parsing CSV file. Please check file format.",
          error: error.message,
        });
      });

    // Increase timeout to 5 minutes for large files
    const timeout = setTimeout(() => {
      if (!responseSent) {
        console.error("Request timeout - but processing continues in background");
        sendResponse(202, {
          message: "Processing is taking longer than expected. Data is being saved in background. Please refresh after a minute.",
          status: "processing",
        });
      }
    }, 300000); // 5 minutes

    res.on("finish", () => {
      clearTimeout(timeout);
    });

  } catch (error) {
    console.error("Upload error:", error);
    cleanupFile();
    return sendResponse(500, {
      message: "Upload failed",
      error: error.message,
    });
  }
};

// Helper function for background processing of large files
async function processLargeUpload(results, normalizedHeaders, normalizedMapping, userId) {
  try {
    console.log(`Background processing ${results.length} records...`);

    const csvTradingCodes = results
      .map((row) => row['Trading Code'])
      .filter((code) => code && String(code).trim() !== "");

    const existingClients = await clientModel
      .find({
        tradingCode: { $in: csvTradingCodes },
      })
      .lean();

    const existingTradingCodes = new Set(
      existingClients.map((client) => client.tradingCode)
    );

    const newRecords = results.filter(row => {
      const tradingCode = row['Trading Code'];
      if (!tradingCode || existingTradingCodes.has(tradingCode)) {
        return false;
      }
      existingTradingCodes.add(tradingCode);
      return true;
    });

    console.log(`Background: Processing ${newRecords.length} new records`);

    const BATCH_SIZE = 100;
    let totalSaved = 0;

    for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
      const batch = newRecords.slice(i, i + BATCH_SIZE);
      const clientsToInsert = batch.map(row => {
        const clientData = {};
        
        normalizedHeaders.forEach((csvHeader) => {
          if (normalizedMapping[csvHeader]) {
            const dbField = normalizedMapping[csvHeader];
            const value = row[csvHeader];
            
            if (value !== undefined && value !== null && String(value).trim() !== '') {
              clientData[dbField] = String(value).trim();
            }
          }
        });

        return {
          ...clientData,
          uploadedBy: userId,
          isRead: false,
        };
      });

      try {
        const inserted = await clientModel.insertMany(clientsToInsert, { ordered: false });
        totalSaved += inserted.length;
        console.log(`Background batch ${Math.floor(i/BATCH_SIZE) + 1}: Saved ${inserted.length} records (Total: ${totalSaved})`);
      } catch (error) {
        console.error("Background batch error:", error.message);
      }
    }

    console.log(`Background processing complete: ${totalSaved} records saved`);
  } catch (error) {
    console.error("Background processing error:", error);
  }
}

// Download duplicate file
export const downloadDuplicateFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '..', 'uploads', 'duplicates', filename);

    console.log("Attempting to download file:", filepath);

    if (!fs.existsSync(filepath)) {
      console.error("File not found:", filepath);
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=duplicate_records_${Date.now()}.csv`
    );

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Delete file after sending
    fileStream.on("end", () => {
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          try {
            fs.unlinkSync(filepath);
            console.log("Duplicate file deleted:", filepath);
          } catch (err) {
            console.error("Error deleting duplicate file:", err);
          }
        }
      }, 1000);
    });

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error downloading file" });
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({
      message: "Failed to download file",
      error: error.message,
    });
  }
};

// Add this helper function BEFORE getAllClients function

function buildAdvancedFilterQuery(conditions) {
  if (conditions.length === 0) return {};

  const groups = [];
  let currentGroup = [];
  let currentOperator = "AND";

  conditions.forEach((condition, index) => {
    const fieldQuery = buildFieldQuery(condition);

    if (index === 0) {
      currentGroup.push(fieldQuery);
      currentOperator = condition.logicalOperator || "AND";
    } else {
      if (condition.logicalOperator === currentOperator) {
        currentGroup.push(fieldQuery);
      } else {
        // New operator, save current group and start new one
        groups.push({ operator: currentOperator, queries: currentGroup });
        currentGroup = [fieldQuery];
        currentOperator = condition.logicalOperator || "AND";
      }
    }
  });

  // Add last group
  if (currentGroup.length > 0) {
    groups.push({ operator: currentOperator, queries: currentGroup });
  }

  // Build final query
  if (groups.length === 1) {
    const group = groups[0];
    if (group.operator === "AND") {
      return { $and: group.queries };
    } else {
      return { $or: group.queries };
    }
  } else {
    // Multiple groups with different operators
    const groupQueries = groups.map((group) => {
      if (group.operator === "AND") {
        return { $and: group.queries };
      } else {
        return { $or: group.queries };
      }
    });
    return { $and: groupQueries };
  }
}

function buildFieldQuery(condition) {
  const { field, operator, value } = condition;


   if (operator.startsWith("date")) {
    const now = new Date();
    
    switch (operator) {
      case "dateEquals":
        const dateValue = new Date(value);
        const nextDay = new Date(dateValue);
        nextDay.setDate(nextDay.getDate() + 1);
        return {
          [field]: {
            $gte: dateValue.toISOString().split('T')[0],
            $lt: nextDay.toISOString().split('T')[0]
          }
        };

      case "dateBefore":
        return { [field]: { $lt: value } };

      case "dateAfter":
        return { [field]: { $gt: value } };

      case "dateWithin1Week":
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: oneWeekFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin2Weeks":
        const twoWeeksFromNow = new Date(now);
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: twoWeeksFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin1Month":
        const oneMonthFromNow = new Date(now);
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: oneMonthFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin2Months":
        const twoMonthsFromNow = new Date(now);
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: twoMonthsFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin3Months":
        const threeMonthsFromNow = new Date(now);
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: threeMonthsFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin6Months":
        const sixMonthsFromNow = new Date(now);
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: sixMonthsFromNow.toISOString().split('T')[0]
          }
        };

      case "dateWithin1Year":
        const oneYearFromNow = new Date(now);
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return {
          [field]: {
            $gte: now.toISOString().split('T')[0],
            $lte: oneYearFromNow.toISOString().split('T')[0]
          }
        };

      case "datePast1Week":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return {
          [field]: {
            $gte: oneWeekAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast2Weeks":
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return {
          [field]: {
            $gte: twoWeeksAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast1Month":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return {
          [field]: {
            $gte: oneMonthAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast2Months":
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        return {
          [field]: {
            $gte: twoMonthsAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast3Months":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return {
          [field]: {
            $gte: threeMonthsAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast6Months":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return {
          [field]: {
            $gte: sixMonthsAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "datePast1Year":
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return {
          [field]: {
            $gte: oneYearAgo.toISOString().split('T')[0],
            $lte: now.toISOString().split('T')[0]
          }
        };

      case "dateCustomRange":
        const [startDate, endDate] = value.split(',');
        return {
          [field]: {
            $gte: startDate.trim(),
            $lte: endDate.trim()
          }
        };

      default:
        return {};
    }
  }

  switch (operator) {
    case "equals":
      return { [field]: { $regex: `^${escapeRegex(value)}$`, $options: "i" } };

    case "notEquals":
      return { [field]: { $not: { $regex: `^${escapeRegex(value)}$`, $options: "i" } } };

    case "contains":
      return { [field]: { $regex: escapeRegex(value), $options: "i" } };

    case "notContains":
      return { [field]: { $not: { $regex: escapeRegex(value), $options: "i" } } };

    case "startsWith":
      return { [field]: { $regex: `^${escapeRegex(value)}`, $options: "i" } };

    case "endsWith":
      return { [field]: { $regex: `${escapeRegex(value)}$`, $options: "i" } };

    case "isEmpty":
      return {
        $or: [
          { [field]: { $exists: false } },
          { [field]: null },
          { [field]: "" },
          { [field]: { $regex: "^\\s*$" } }, // Empty or whitespace only
        ],
      };

    case "isNotEmpty":
      return {
        [field]: { 
          $exists: true, 
          $ne: null, 
          $ne: "",
          $not: { $regex: "^\\s*$" } // Not empty or whitespace only
        },
      };

    case "greaterThan":
      // Try to parse as number, fallback to string comparison
      const gtNum = parseFloat(value);
      return isNaN(gtNum) ? { [field]: { $gt: value } } : { [field]: { $gt: gtNum } };

    case "lessThan":
      const ltNum = parseFloat(value);
      return isNaN(ltNum) ? { [field]: { $lt: value } } : { [field]: { $lt: ltNum } };

    case "greaterThanOrEqual":
      const gteNum = parseFloat(value);
      return isNaN(gteNum) ? { [field]: { $gte: value } } : { [field]: { $gte: gteNum } };

    case "lessThanOrEqual":
      const lteNum = parseFloat(value);
      return isNaN(lteNum) ? { [field]: { $lte: value } } : { [field]: { $lte: lteNum } };

    default:
      return {};
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Now update your getAllClients function to use these helper functions
export const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "", filters = "[]" } = req.query;

    // Allow larger limits but cap at 1000 for performance
    const maxLimit = Math.min(parseInt(limit), 1000);

    // Parse filter conditions
    let filterConditions = [];
    try {
      filterConditions = JSON.parse(filters);
      console.log("Parsed filter conditions:", filterConditions);
    } catch (error) {
      console.error("Error parsing filters:", error);
    }

    // Build MongoDB query
    const query = {};

    // Add search query if provided
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { emailId: { $regex: search, $options: "i" } },
        { tradingCode: { $regex: search, $options: "i" } },
        { mobileNo: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { owner: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }

    // Build advanced filter query
    if (filterConditions.length > 0) {
      const advancedFilters = buildAdvancedFilterQuery(filterConditions);
      
      console.log("Advanced filters built:", JSON.stringify(advancedFilters, null, 2));
      
      if (search && search.trim() !== "") {
        // Combine search and filters with AND
        query.$and = [{ $or: query.$or }, advancedFilters];
        delete query.$or;
      } else {
        // Only advanced filters
        Object.assign(query, advancedFilters);
      }
    }

    console.log("Final MongoDB Query:", JSON.stringify(query, null, 2));

    // Execute query with pagination
    const clients = await clientModel
      .find(query)
      .sort({ uploadedAt: -1 })
      .limit(maxLimit)
      .skip((page - 1) * maxLimit)
      .lean()
      .exec();

    const count = await clientModel.countDocuments(query);

    console.log(`Found ${count} total records, returning ${clients.length} for page ${page}`);

    return res.status(200).json({
      message: "Clients fetched successfully",
      clients,
      totalPages: Math.ceil(count / maxLimit),
      currentPage: parseInt(page),
      totalRecords: count,
      limit: maxLimit,
      appliedFilters: filterConditions.length,
      query: query, // Return query for debugging
    });
  } catch (error) {
    console.error("Get clients error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// Get client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientModel.findById(id).lean();

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({
      message: "Client fetched successfully",
      client,
    });
  } catch (error) {
    console.error("Get client error:", error);
    return res.status(500).json({
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};

// Helper function to get field labels
const getFieldLabel = (fieldName) => {
  const fieldLabels = {
    tradingCode: "Trading Code",
    owner: "Owner",
    name: "Name",
    mobileNo: "Mobile No",
    emailId: "Email ID",
    dpClientId: "DP Client ID",
    branchCode: "Branch Code",
    rmtlCode: "RMTL Code",
    investorType: "Investor Type",
    accountOpenDate: "A/c Open Date",
    accountStatus: "Account Status",
    firstTradeDate: "First Trade Date",
    holdingValue: "Holding Value",
    ledgerBalance: "Ledger Balance",
    lastTradeDate: "Last Trade Date",
    ytdBrok: "YTD Brok.",
    activeExchange: "Active Exchange",
    poaDdpi: "POA/DDPI",
    nominee: "Nominee",
    annualIncome: "Annual Income",
    occupation: "Occupation",
    city: "City",
    state: "State",
    lastLoginDate: "Last Login Date",
    callingStatus: "Calling Status",
    nextFollowUpDate: "Next Follow up Date",
    remarks: "Remarks",
    reEycDoneDate: "Re-EYC Done Date",
    demoRequiredDate: "Demo Required Date",
    fundReceivedAmount: "Fund Received Amount",
    fundReceivedDate: "Fund Received Date",
    fundNotReceivedReason: "Fund Not Received Reason",
    callbackDate: "Callback Date",
    notInterestedReason: "Not Interested Reason",
    wrongNumberAlternate: "Wrong Number Alternate",
    dpValue: "DP Value",
    notMappedReason: "Not Mapped Reason",
  };
  return fieldLabels[fieldName] || fieldName;
};

// Helper function to format value for display
const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "Empty";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { editedBy = "Admin", editedByEmail = "", ipAddress = "", userAgent = "" } = req.headers;

    const client = await clientModel.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if Trading Code is being changed
    if (updateData.tradingCode && updateData.tradingCode !== client.tradingCode) {
      const existingClient = await clientModel.findOne({
        tradingCode: updateData.tradingCode,
        _id: { $ne: id },
      });

      if (existingClient) {
        return res.status(400).json({
          message: `Trading Code ${updateData.tradingCode} already exists`,
        });
      }
    }

    // Track changes
    const changes = [];
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "lastModified") {
        const oldValue = client[key];
        const newValue = updateData[key];

        // Only log if value actually changed
        if (String(oldValue) !== String(newValue)) {
          changes.push({
            field: key,
            fieldLabel: getFieldLabel(key),
            oldValue: formatValue(oldValue),
            newValue: formatValue(newValue),
          });
        }

        client[key] = newValue;
      }
    });

    client.lastModified = Date.now();
    await client.save();

    // Create audit log if there are changes
    if (changes.length > 0) {
      await AuditLog.create({
        clientId: client._id,
        tradingCode: client.tradingCode,
        action: "UPDATE",
        editedBy,
        editedByEmail,
        changes,
        metadata: {
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      });
    }

    return res.status(200).json({
      message: "Client updated successfully",
      client,
      changesLogged: changes.length,
    });
  } catch (error) {
    console.error("Update client error:", error);
    return res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// Toggle read status
export const toggleReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const client = await clientModel.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.isRead = isRead;
    client.lastModified = Date.now();
    await client.save();

    return res.status(200).json({
      message: "Read status updated successfully",
      client,
    });
  } catch (error) {
    console.error("Toggle read error:", error);
    return res.status(500).json({
      message: "Failed to update read status",
      error: error.message,
    });
  }
};

// Delete single client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientModel.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    await clientModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);
    return res.status(500).json({
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

// Delete multiple clients
export const deleteMultipleClients = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No client IDs provided" });
    }

    const result = await clientModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Clients deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete multiple error:", error);
    return res.status(500).json({
      message: "Failed to delete clients",
      error: error.message,
    });
  }
};

// Export clients to CSV
export const exportClientsToCSV = async (req, res) => {
  try {
    const clients = await clientModel.find().sort({ uploadedAt: -1 }).lean();

    if (clients.length === 0) {
      return res.status(404).json({ message: "No clients found to export" });
    }

    // Map database fields back to CSV headers
    const reverseMapping = {};
    Object.keys(COLUMN_MAPPING).forEach((csvHeader) => {
      const dbField = COLUMN_MAPPING[csvHeader];
      reverseMapping[dbField] = csvHeader;
    });

    const headers = Object.keys(COLUMN_MAPPING);
    
    const data = clients.map((client) => {
      const row = {};
      Object.keys(COLUMN_MAPPING).forEach((csvHeader) => {
        const dbField = COLUMN_MAPPING[csvHeader];
        row[csvHeader] = client[dbField] || "";
      });
      return row;
    });

    const json2csvParser = new Parser({ fields: headers });
    const csv = json2csvParser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=clients_${Date.now()}.csv`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({
      message: "Failed to export data",
      error: error.message,
    });
  }
};

// Delete all clients
export const deleteAllClients = async (req, res) => {
  try {
    const result = await clientModel.deleteMany({});

    return res.status(200).json({
      message: "All clients deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all error:", error);
    return res.status(500).json({
      message: "Failed to delete all clients",
      error: error.message,
    });
  }
};

// Get statistics
export const getClientStats = async (req, res) => {
  try {
    const totalClients = await clientModel.countDocuments();
    const recentUploads = await clientModel.countDocuments({
      uploadedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return res.status(200).json({
      message: "Statistics fetched successfully",
      stats: {
        totalClients,
        recentUploads,
        totalColumns: Object.keys(COLUMN_MAPPING).length,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Get all client IDs (for bulk operations)
export const getAllClientIds = async (req, res) => {
  try {
    const { search = "", filters = "[]" } = req.query;

    // Parse filter conditions
    let filterConditions = [];
    try {
      filterConditions = JSON.parse(filters);
    } catch (error) {
      console.error("Filter parse error:", error);
    }

    // Build MongoDB query (same logic as getAllClients)
    const query = {};

    // Add search query if provided
    if (search && search.trim() !== "") {
      query.$or = [
        { tradingCode: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { emailId: new RegExp(search, "i") },
        { mobileNo: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
      ];
    }

    // Build advanced filter query
    if (filterConditions.length > 0) {
      const filterQuery = buildAdvancedFilterQuery(filterConditions);
      if (query.$or) {
        query.$and = [{ $or: query.$or }, filterQuery];
        delete query.$or;
      } else {
        Object.assign(query, filterQuery);
      }
    }

    // Fetch only _id field for efficiency
    const clients = await clientModel
      .find(query)
      .select("_id")
      .lean()
      .exec();

    const ids = clients.map((client) => client._id.toString());

    return res.status(200).json({
      message: "Client IDs fetched successfully",
      ids,
      count: ids.length,
    });
  } catch (error) {
    console.error("Get all client IDs error:", error);
    return res.status(500).json({
      message: "Failed to fetch client IDs",
      error: error.message,
    });
  }
};


export const updateCSV = async (req, res) => {
  let filePath = null;
  let responseSent = false;

  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      return res.status(statusCode).json(data);
    }
  };

  const cleanupFile = () => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  };

  const normalizeColumnName = (columnName) => {
    if (!columnName) return '';
    let normalized = columnName.replace(/^\uFEFF/, '');
    normalized = normalized.trim();
    return normalized;
  };

  const createNormalizedMapping = () => {
    const normalized = {};
    Object.keys(COLUMN_MAPPING).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalized[normalizedKey] = COLUMN_MAPPING[key];
    });
    return normalized;
  };

  try {
    if (!req.file) {
      return sendResponse(400, { message: "No file uploaded" });
    }

    filePath = req.file.path;
    const results = [];
    let csvHeaders = [];
    let normalizedHeaders = [];
    let detectedColumns = [];
    const normalizedMapping = createNormalizedMapping();

    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser())
      .on("headers", (headerList) => {
        if (responseSent) return;

        csvHeaders = headerList.map(h => normalizeColumnName(h));
        normalizedHeaders = csvHeaders.filter(h => h !== '');
        
        console.log("UPDATE CSV - Normalized Headers:", normalizedHeaders);

        const hasTradingCode = normalizedHeaders.some(
          h => h.toLowerCase() === 'trading code'
        );

        if (!hasTradingCode) {
          cleanupFile();
          stream.destroy();
          return sendResponse(400, {
            message: "CSV must contain 'Trading Code' column (required field for updates). Found columns: " + normalizedHeaders.join(", ")
          });
        }

        detectedColumns = normalizedHeaders.filter(
          header => normalizedMapping.hasOwnProperty(header)
        );
        
        console.log("UPDATE CSV - Detected columns:", detectedColumns);
      })
      .on("data", (data) => {
        if (responseSent) return;

        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = normalizeColumnName(key);
          if (normalizedKey) {
            normalizedData[normalizedKey] = data[key];
          }
        });

        const tradingCodeValue = normalizedData['Trading Code'];
        
        if (tradingCodeValue && String(tradingCodeValue).trim()) {
          results.push(normalizedData);
        }
      })
      .on("end", async () => {
        if (responseSent) return;

        try {
          cleanupFile();

          if (results.length === 0) {
            return sendResponse(400, {
              message: "CSV file is empty or contains no valid data",
            });
          }

          console.log(`UPDATE CSV - Processing ${results.length} records...`);

          // Extract all trading codes
          const tradingCodes = results
            .map((row) => row['Trading Code'])
            .filter((code) => code && String(code).trim() !== "");

          // Find existing clients
          const existingClients = await clientModel
            .find({
              tradingCode: { $in: tradingCodes },
            })
            .lean();

          const existingTradingCodesMap = new Map();
          existingClients.forEach(client => {
            existingTradingCodesMap.set(client.tradingCode, client);
          });

          console.log(`UPDATE CSV - Found ${existingClients.length} existing clients`);

          // Separate records into update and insert
          const recordsToUpdate = [];
          const recordsToInsert = [];
          const failedRecords = [];

          results.forEach((row) => {
            const tradingCode = row['Trading Code'];

            if (!tradingCode || String(tradingCode).trim() === "") {
              return;
            }

            if (existingTradingCodesMap.has(tradingCode)) {
              recordsToUpdate.push(row);
            } else {
              recordsToInsert.push(row);
            }
          });

          console.log(`UPDATE CSV - To Update: ${recordsToUpdate.length}, To Insert: ${recordsToInsert.length}`);

          // Process updates
          const updatedClients = [];
          const BATCH_SIZE = 100;

          for (let i = 0; i < recordsToUpdate.length; i += BATCH_SIZE) {
            const batch = recordsToUpdate.slice(i, i + BATCH_SIZE);

            for (const row of batch) {
              try {
                const tradingCode = row['Trading Code'];
                
                // Build update data - ONLY for columns present in CSV
                const updateData = {};
                normalizedHeaders.forEach((csvHeader) => {
                  if (normalizedMapping[csvHeader] && csvHeader !== 'Trading Code') {
                    const dbField = normalizedMapping[csvHeader];
                    const value = row[csvHeader];
                    
                    // Update field if value is present in CSV (even if empty string)
                    if (value !== undefined && value !== null) {
                      updateData[dbField] = String(value).trim();
                    }
                  }
                });

                updateData.lastModified = Date.now();

                const updated = await clientModel.findOneAndUpdate(
                  { tradingCode: tradingCode },
                  { $set: updateData },
                  { new: true }
                );

                if (updated) {
                  updatedClients.push(updated);
                }
              } catch (error) {
                console.error("Error updating client:", error);
                failedRecords.push({
                  tradingCode: row['Trading Code'],
                  error: error.message,
                  action: 'update'
                });
              }
            }

            console.log(`UPDATE CSV - Batch ${Math.floor(i/BATCH_SIZE) + 1}: Updated ${batch.length} records`);
          }

          // Process inserts (new clients)
          const insertedClients = [];

          for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
            const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
            const clientsToInsert = [];

            batch.forEach((row) => {
              try {
                const clientData = {};
                
                normalizedHeaders.forEach((csvHeader) => {
                  if (normalizedMapping[csvHeader]) {
                    const dbField = normalizedMapping[csvHeader];
                    const value = row[csvHeader];
                    
                    if (value !== undefined && value !== null && String(value).trim() !== '') {
                      clientData[dbField] = String(value).trim();
                    }
                  }
                });

                clientsToInsert.push({
                  ...clientData,
                  uploadedBy: req.user?._id,
                  isRead: false,
                });
              } catch (error) {
                console.error("Error preparing client:", error);
                failedRecords.push({
                  tradingCode: row['Trading Code'],
                  error: error.message,
                  action: 'insert'
                });
              }
            });

            try {
              const inserted = await clientModel.insertMany(clientsToInsert, { ordered: false });
              insertedClients.push(...inserted);
              console.log(`UPDATE CSV - Batch ${Math.floor(i/BATCH_SIZE) + 1}: Inserted ${inserted.length} new records`);
            } catch (error) {
              console.error("Batch insert error:", error);
            }
          }

          console.log(`UPDATE CSV - Complete: ${updatedClients.length} updated, ${insertedClients.length} inserted`);

          const response = {
            message: "CSV update/insert processed successfully",
            totalRows: results.length,
            updatedRecords: updatedClients.length,
            insertedRecords: insertedClients.length,
            failedRecords: failedRecords.length,
            detectedColumns: detectedColumns,
            summary: {
              columnsInCSV: detectedColumns.length,
              totalExpectedColumns: Object.keys(normalizedMapping).length,
              onlySpecifiedColumnsUpdated: true
            },
            updatedClients: updatedClients.slice(0, 5), // Sample
            insertedClients: insertedClients.slice(0, 5), // Sample
          };

          if (failedRecords.length > 0) {
            response.failedRecordsDetails = failedRecords.slice(0, 10);
            response.failedMessage = `${failedRecords.length} record(s) failed to process`;
          }

          return sendResponse(200, response);
        } catch (error) {
          console.error("UPDATE CSV - Processing error:", error);
          cleanupFile();
          return sendResponse(500, {
            message: error.message || "Failed to process CSV update",
          });
        }
      })
      .on("error", (error) => {
        if (responseSent) return;

        console.error("UPDATE CSV - Parsing error:", error);
        cleanupFile();
        return sendResponse(500, {
          message: "Error parsing CSV file. Please check file format.",
          error: error.message,
        });
      });

    const timeout = setTimeout(() => {
      if (!responseSent) {
        console.error("UPDATE CSV - Request timeout");
        sendResponse(408, {
          message: "Request timeout. Please try again.",
        });
      }
    }, 300000); // 5 minutes

    res.on("finish", () => {
      clearTimeout(timeout);
    });

  } catch (error) {
    console.error("UPDATE CSV - Upload error:", error);
    cleanupFile();
    return sendResponse(500, {
      message: "Upload failed",
      error: error.message,
    });
  }
};