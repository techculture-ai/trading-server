import FAQ from "../models/faqModel.js";

// Create new FAQ
export const createFAQ = async (req, res) => {
    try {
        const { question, answer, category, isActive, order=1 } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: "Question and answer are required"
            });
        }

        const faq = new FAQ({
            question,
            answer,
            category: category || "General",
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0
        });

        const savedFAQ = await faq.save();
        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: savedFAQ
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create FAQ",
            error: error.message
        });
    }
};

// Get all FAQs (for admin)
export const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({
          category: 1,
          order: 1,
          updatedAt: -1,
        });
        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch FAQs",
            error: error.message
        });
    }
};

// Get active FAQs (for public)
export const getActiveFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ isActive: true }).sort({
          category: 1,
          order: 1,
          updatedAt: -1,
        });
        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch FAQs",
            error: error.message
        });
    }
};

// Get FAQ by ID
export const getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }
        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch FAQ",
            error: error.message
        });
    }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
    try {
        const { question, answer, category, isActive, order } = req.body;
        const faqId = req.params.id;

        const faq = await FAQ.findById(faqId);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        // Update fields
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        faq.category = category || faq.category;
        faq.isActive = isActive !== undefined ? isActive : faq.isActive;
        faq.order = order !== undefined ? order : faq.order;

        const updatedFAQ = await faq.save();
        res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            data: updatedFAQ
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update FAQ",
            error: error.message
        });
    }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        await FAQ.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "FAQ deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete FAQ",
            error: error.message
        });
    }
};

// Get FAQs by category
export const getFAQsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const faqs = await FAQ.find({
          category: category,
          isActive: true,
        }).sort({ order: 1, updatedAt: -1 });
        
        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch FAQs by category",
            error: error.message
        });
    }
};

// Get all categories
export const getFAQCategories = async (req, res) => {
    try {
        const categories = await FAQ.distinct('category');
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};
