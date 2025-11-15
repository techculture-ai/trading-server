import AuditLog from "../models/auditLogModel.js";
import clientModel from "../models/clientModel.js";

// Get audit logs for a specific client
export const getClientAuditLogs = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find({ clientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments({ clientId });

    return res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get client audit logs error:", error);
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// Get audit logs by trading code
export const getAuditLogsByTradingCode = async (req, res) => {
  try {
    const { tradingCode } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find({ tradingCode })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments({ tradingCode });

    return res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get audit logs by trading code error:", error);
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// Get all audit logs with filters
export const getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      editedBy,
      action,
      startDate,
      endDate,
      tradingCode,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter query
    const filter = {};

    if (editedBy) filter.editedBy = editedBy;
    if (action) filter.action = action;
    if (tradingCode) filter.tradingCode = new RegExp(tradingCode, "i");

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { tradingCode: new RegExp(search, "i") },
        { editedBy: new RegExp(search, "i") },
        { editedByEmail: new RegExp(search, "i") },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clientId", "name tradingCode");

    const total = await AuditLog.countDocuments(filter);

    // Get unique editors for filter options
    const editors = await AuditLog.distinct("editedBy");

    return res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      filterOptions: {
        editors,
        actions: ["UPDATE", "CREATE", "DELETE"],
      },
    });
  } catch (error) {
    console.error("Get all audit logs error:", error);
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// Get audit log statistics
export const getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const totalLogs = await AuditLog.countDocuments(filter);

    const actionCounts = await AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]);

    const topEditors = await AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: "$editedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentActivity = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return res.status(200).json({
      totalLogs,
      actionCounts,
      topEditors,
      recentActivity,
    });
  } catch (error) {
    console.error("Get audit log stats error:", error);
    return res.status(500).json({
      message: "Failed to fetch audit log statistics",
      error: error.message,
    });
  }
};

// Delete audit logs (admin only, with caution)
export const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    await AuditLog.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Audit log deleted successfully",
    });
  } catch (error) {
    console.error("Delete audit log error:", error);
    return res.status(500).json({
      message: "Failed to delete audit log",
      error: error.message,
    });
  }
};

// Export audit logs to CSV
export const exportAuditLogs = async (req, res) => {
  try {
    const { clientId, tradingCode, startDate, endDate } = req.query;

    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (tradingCode) filter.tradingCode = new RegExp(tradingCode, "i");

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .populate("clientId", "name tradingCode");

    // Flatten the data for CSV export
    const csvData = logs.flatMap((log) =>
      log.changes.map((change) => ({
        Date: new Date(log.createdAt).toLocaleString(),
        TradingCode: log.tradingCode,
        Action: log.action,
        EditedBy: log.editedBy,
        EditedByEmail: log.editedByEmail,
        Field: change.fieldLabel,
        OldValue: change.oldValue,
        NewValue: change.newValue,
      }))
    );

    return res.status(200).json({
      data: csvData,
      count: csvData.length,
    });
  } catch (error) {
    console.error("Export audit logs error:", error);
    return res.status(500).json({
      message: "Failed to export audit logs",
      error: error.message,
    });
  }
};
