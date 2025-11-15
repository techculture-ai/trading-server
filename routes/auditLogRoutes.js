import express from "express";
import {
  getClientAuditLogs,
  getAuditLogsByTradingCode,
  getAllAuditLogs,
  getAuditLogStats,
  deleteAuditLog,
  exportAuditLogs,
} from "../controllers/auditLogController.js";

const router = express.Router();

// Get audit logs for specific client
router.get("/client/:clientId", getClientAuditLogs);

// Get audit logs by trading code
router.get("/trading-code/:tradingCode", getAuditLogsByTradingCode);

// Get all audit logs with filters
router.get("/", getAllAuditLogs);

// Get audit log statistics
router.get("/stats", getAuditLogStats);

// Export audit logs
router.get("/export", exportAuditLogs);

// Delete audit log (admin only)
router.delete("/:id", deleteAuditLog);

export default router;
