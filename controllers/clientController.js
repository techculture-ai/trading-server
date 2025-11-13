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

// Column mapping from CSV headers to database fields
const COLUMN_MAPPING = {
  'Trading Code': 'tradingCode',
  'Owner': 'owner',
  'Name': 'name',
  'Mobile No': 'mobileNo',
  'Email ID': 'emailId',
  'DP Client ID': 'dpClientId',
  'Branch Code': 'branchCode',
  'RMTL Code': 'rmtlCode',
  'Investor Type': 'investorType',
  'A/c Open Date': 'accountOpenDate',
  'Account Status': 'accountStatus',
  'First Trade Date': 'firstTradeDate',
  'Holding Value': 'holdingValue',
  'Ledger Balance': 'ledgerBalance',
  'Last Trade Date': 'lastTradeDate',
  'YTD Brok.': 'ytdBrok',
  "Active Exchange" : 'activeExchange',
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

// Upload CSV and save to database
export const uploadCSV = async (req, res) => {
  let filePath = null;
  let responseSent = false;

  // Helper function to send response only once
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      return res.status(statusCode).json(data);
    }
  };

  // Helper function to clean up file
  const cleanupFile = () => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  };

  // Helper function to create duplicate CSV file
  const createDuplicateCSV = (duplicateRecords) => {
    try {
      if (duplicateRecords.length === 0) return null;

      const headers = Object.keys(COLUMN_MAPPING);
      const json2csvParser = new Parser({ fields: headers });
      const csv = json2csvParser.parse(duplicateRecords);
      
      const duplicatesDir = path.join(__dirname, '..', 'uploads', 'duplicates');
      if (!fs.existsSync(duplicatesDir)) {
        fs.mkdirSync(duplicatesDir, { recursive: true });
      }

      const filename = `duplicates_${Date.now()}.csv`;
      const filepath = path.join(duplicatesDir, filename);
      
      fs.writeFileSync(filepath, csv);
      
      console.log(`Duplicate CSV created: ${filepath}`);
      
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

  try {
    if (!req.file) {
      return sendResponse(400, { message: "No file uploaded" });
    }

    filePath = req.file.path;
    const results = [];
    let headers = [];

    // Parse CSV file
    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser())
      .on("headers", (headerList) => {
        if (responseSent) return;

        headers = headerList;

        // Check if Trading Code exists
        if (!headerList.includes('Trading Code')) {
          cleanupFile();
          stream.destroy();
          return sendResponse(400, {
            message: "CSV must contain 'Trading Code' column. Found columns: " + headerList.join(", ")
          });
        }
      })
      .on("data", (data) => {
        if (responseSent) return;

        // Filter out completely empty rows
        const hasData = Object.values(data).some(
          (value) => value && value.trim() !== ""
        );
        if (hasData && data['Trading Code'] && data['Trading Code'].trim()) {
          results.push(data);
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

          // Extract all trading codes from CSV
          const csvTradingCodes = results
            .map((row) => row['Trading Code'])
            .filter((code) => code && code.trim() !== "");

          console.log(`Checking ${csvTradingCodes.length} trading codes for duplicates`);

          // Check for existing trading codes in database
          const existingClients = await clientModel
            .find({
              tradingCode: { $in: csvTradingCodes },
            })
            .lean();

          console.log(`Found ${existingClients.length} existing clients in database`);

          const existingTradingCodes = new Set(
            existingClients.map((client) => client.tradingCode)
          );

          // Separate new and duplicate records
          const newRecords = [];
          const duplicateRecords = [];
          const skippedCodes = [];

          results.forEach((row) => {
            const tradingCode = row['Trading Code'];

            if (!tradingCode || tradingCode.trim() === "") {
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

          // Create duplicate CSV file if there are duplicates
          let duplicateFileInfo = null;
          if (duplicateRecords.length > 0) {
            console.log(`Creating duplicate CSV for ${duplicateRecords.length} records`);
            duplicateFileInfo = createDuplicateCSV(duplicateRecords);
          }

          // Save only new records to database
          const savedClients = [];
          for (const row of newRecords) {
            // Map CSV columns to database fields
            const clientData = {};
            Object.keys(COLUMN_MAPPING).forEach((csvHeader) => {
              const dbField = COLUMN_MAPPING[csvHeader];
              clientData[dbField] = row[csvHeader] || "";
            });

            const client = new clientModel({
              ...clientData,
              uploadedBy: req.user?._id,
              isRead: false,
            });
            
            const savedClient = await client.save();
            savedClients.push(savedClient);
          }

          console.log(`Saved ${savedClients.length} new clients to database`);

          // Prepare response
          const response = {
            message: "CSV upload processed successfully",
            totalRows: results.length,
            newRecords: savedClients.length,
            duplicatesSkipped: duplicateRecords.length,
            clients: savedClients,
          };

          // Add duplicate details if any
          if (duplicateRecords.length > 0) {
            response.skippedTradingCodes = skippedCodes;
            response.duplicateMessage = `${
              duplicateRecords.length
            } record(s) skipped: ${skippedCodes.join(", ")}`;
            
            if (duplicateFileInfo) {
              response.duplicateFile = {
                filename: duplicateFileInfo.filename,
                downloadUrl: duplicateFileInfo.url,
                recordCount: duplicateRecords.length,
              };
              console.log("Duplicate file info added to response:", response.duplicateFile);
            }
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

    // Set a timeout to prevent hanging requests
    const timeout = setTimeout(() => {
      if (!responseSent) {
        console.error("Request timeout - destroying stream");
        stream.destroy();
        cleanupFile();
        sendResponse(408, {
          message: "Request timeout. Please try uploading the file again.",
        });
      }
    }, 30000); // 30 seconds timeout

    // Clear timeout when response is sent
    res.on("finish", () => {
      clearTimeout(timeout);
    });

  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error stack:", error.stack);
    cleanupFile();
    return sendResponse(500, {
      message: "Upload failed",
      error: error.message,
    });
  }
};

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

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "" } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { emailId: { $regex: search, $options: "i" } },
            { tradingCode: { $regex: search, $options: "i" } },
            { mobileNo: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const clients = await clientModel
      .find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const count = await clientModel.countDocuments(query);

    return res.status(200).json({
      message: "Clients fetched successfully",
      clients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Get clients error:", error);
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