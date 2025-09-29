import Technology from "../models/technologiesModel.js"; 

// CREATE - Add new technology category
export const createTechnology = async (req, res) => {
  try {
    const { categoryKey, title, items } = req.body;

    // Check if category already exists
    const existingTech = await Technology.findOne({ categoryKey });
    if (existingTech) {
      return res.status(400).json({
        success: false,
        message: "Technology category with this key already exists",
      });
    }

    const technology = new Technology({
      categoryKey,
      title,
      items: items || [],
    });

    const savedTechnology = await technology.save();

    res.status(201).json({
      success: true,
      message: "Technology category created successfully",
      data: savedTechnology,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating technology category",
      error: error.message,
    });
  }
};

// READ - Get all technology categories
export const getAllTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find();

    res.status(200).json({
      success: true,
      message: "Technologies fetched successfully",
      count: technologies.length,
      data: technologies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching technologies",
      error: error.message,
    });
  }
};

// READ - Get single technology category by ID
export const getTechnologyById = async (req, res) => {
  try {
    const { id } = req.params;
    const technology = await Technology.findById(id);

    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Technology category fetched successfully",
      data: technology,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching technology category",
      error: error.message,
    });
  }
};

// READ - Get technology category by categoryKey
export const getTechnologyByCategoryKey = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const technology = await Technology.findOne({ categoryKey });

    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Technology category fetched successfully",
      data: technology,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching technology category",
      error: error.message,
    });
  }
};

// UPDATE - Update technology category
export const updateTechnology = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If categoryKey is being updated, check if it already exists
    if (updates.categoryKey) {
      const existingTech = await Technology.findOne({
        categoryKey: updates.categoryKey,
        _id: { $ne: id },
      });

      if (existingTech) {
        return res.status(400).json({
          success: false,
          message: "Technology category with this key already exists",
        });
      }
    }

    const technology = await Technology.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Technology category updated successfully",
      data: technology,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating technology category",
      error: error.message,
    });
  }
};

// DELETE - Delete technology category
export const deleteTechnology = async (req, res) => {
  try {
    const { id } = req.params;
    const technology = await Technology.findByIdAndDelete(id);

    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Technology category deleted successfully",
      data: technology,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting technology category",
      error: error.message,
    });
  }
};

// ITEM OPERATIONS - Add item to technology category
export const addTechnologyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Technology item name is required",
      });
    }

    const technology = await Technology.findById(id);
    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    // Check if item already exists
    const itemExists = technology.items.some((item) => item.name === name);
    if (itemExists) {
      return res.status(400).json({
        success: false,
        message: "Technology item already exists in this category",
      });
    }

    technology.items.push({ name });
    await technology.save();

    res.status(200).json({
      success: true,
      message: "Technology item added successfully",
      data: technology,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding technology item",
      error: error.message,
    });
  }
};

// ITEM OPERATIONS - Update technology item
export const updateTechnologyItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { name } = req.body;

    const technology = await Technology.findById(id);
    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    const item = technology.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Technology item not found",
      });
    }

    if (name) item.name = name;
    await technology.save();

    res.status(200).json({
      success: true,
      message: "Technology item updated successfully",
      data: technology,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating technology item",
      error: error.message,
    });
  }
};

// ITEM OPERATIONS - Delete technology item
export const deleteTechnologyItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const technology = await Technology.findById(id);
    if (!technology) {
      return res.status(404).json({
        success: false,
        message: "Technology category not found",
      });
    }

    const item = technology.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Technology item not found",
      });
    }

    technology.items.pull(itemId);
    await technology.save();

    res.status(200).json({
      success: true,
      message: "Technology item deleted successfully",
      data: technology,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting technology item",
      error: error.message,
    });
  }
};

// SEARCH - Search technologies by name or category
export const searchTechnologies = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const technologies = await Technology.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { categoryKey: { $regex: query, $options: "i" } },
        { "items.name": { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      count: technologies.length,
      data: technologies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching technologies",
      error: error.message,
    });
  }
};
