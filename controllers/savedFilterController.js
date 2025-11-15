import SavedFilter from "../models/savedFilterModel.js";

// Get all saved filters
export const getAllSavedFilters = async (req, res) => {
  try {
    const filters = await SavedFilter.find()
      .sort({ usageCount: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: filters.length,
      filters,
    });
  } catch (error) {
    console.error("Get saved filters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved filters",
      error: error.message,
    });
  }
};

// Get saved filter by ID
export const getSavedFilterById = async (req, res) => {
  try {
    const filter = await SavedFilter.findById(req.params.id);

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Saved filter not found",
      });
    }

    // Increment usage count
    filter.usageCount += 1;
    await filter.save();

    res.status(200).json({
      success: true,
      filter,
    });
  } catch (error) {
    console.error("Get saved filter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved filter",
      error: error.message,
    });
  }
};

// Create new saved filter
export const createSavedFilter = async (req, res) => {
  try {
    const { name, description, filterConditions, createdBy } = req.body;

    // Validate required fields
    if (!name || !filterConditions || filterConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and filter conditions are required",
      });
    }

    // Check if filter with same name already exists
    const existingFilter = await SavedFilter.findOne({ name });
    if (existingFilter) {
      return res.status(400).json({
        success: false,
        message: "A filter with this name already exists",
      });
    }

    const savedFilter = await SavedFilter.create({
      name,
      description,
      filterConditions,
      createdBy: createdBy || "System",
      isPublic: true,
    });

    res.status(201).json({
      success: true,
      message: "Filter saved successfully",
      filter: savedFilter,
    });
  } catch (error) {
    console.error("Create saved filter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save filter",
      error: error.message,
    });
  }
};

// Update saved filter
export const updateSavedFilter = async (req, res) => {
  try {
    const { name, description, filterConditions } = req.body;

    const filter = await SavedFilter.findById(req.params.id);

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Saved filter not found",
      });
    }

    // Check if new name conflicts with existing filter
    if (name && name !== filter.name) {
      const existingFilter = await SavedFilter.findOne({ name });
      if (existingFilter) {
        return res.status(400).json({
          success: false,
          message: "A filter with this name already exists",
        });
      }
    }

    // Update fields
    if (name) filter.name = name;
    if (description !== undefined) filter.description = description;
    if (filterConditions) filter.filterConditions = filterConditions;

    await filter.save();

    res.status(200).json({
      success: true,
      message: "Filter updated successfully",
      filter,
    });
  } catch (error) {
    console.error("Update saved filter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update filter",
      error: error.message,
    });
  }
};

// Delete saved filter
export const deleteSavedFilter = async (req, res) => {
  try {
    const filter = await SavedFilter.findByIdAndDelete(req.params.id);

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Saved filter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Filter deleted successfully",
    });
  } catch (error) {
    console.error("Delete saved filter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete filter",
      error: error.message,
    });
  }
};

// Increment usage count
export const incrementUsageCount = async (req, res) => {
  try {
    const filter = await SavedFilter.findById(req.params.id);

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Saved filter not found",
      });
    }

    filter.usageCount += 1;
    await filter.save();

    res.status(200).json({
      success: true,
      usageCount: filter.usageCount,
    });
  } catch (error) {
    console.error("Increment usage count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update usage count",
      error: error.message,
    });
  }
};
