import clientModel from "../models/clientModel.js";
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

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        client[key] = updateData[key];
      }
    });

    client.lastModified = Date.now();
    await client.save();

    return res.status(200).json({
      message: "Client updated successfully",
      client,
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