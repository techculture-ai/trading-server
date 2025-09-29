import JobPost from "../models/jobPostModel.js";

//create
export const createJobPost = async (req, res) => {
    try {
        const { jobId, title, description, department, location, type, salaryRange, experienceRequired, skills, isActive, deadline } = req.body;

        if (!jobId || !title || !description) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const existingJobPost = await JobPost.findOne({ jobId });
        if (existingJobPost) {
            return res.status(400).json({ message: "Job post with this ID already exists" });
        }
        const newJobPost = new JobPost({
            jobId,
            title,
            description,
            department,
            location,
            type,
            salaryRange,
            experienceRequired,
            skills,
            isActive,
            deadline
        });
        await newJobPost.save();
        res.status(201).json({ message: "Job post created successfully", jobPost: newJobPost });
        
    } catch (error) {
        console.error("Error creating job post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// edit 
export const editJobPost = async (req, res) => {
    try {
        const { jobId } = req.params;
        const updates = req.body;

        const jobPost = await JobPost.findOneAndUpdate({ jobId }, updates, { new: true });
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found" });
        }

        res.status(200).json({ message: "Job post updated successfully", jobPost });
        
    } catch (error) {
        console.error("Error updating job post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// delete
export const deleteJobPost = async (req, res) => {
    try {
        const { jobId } = req.params;

        const jobPost = await JobPost.findOneAndDelete({ jobId });
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found" });
        }

        res.status(200).json({ message: "Job post deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting job post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// get all job posts
export const getAllJobPosts = async (req, res) => {
    try {
        const jobPosts = await JobPost.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Job posts fetched successfully",
            jobPosts
        });
        
    } catch (error) {
        console.error("Error fetching job posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// get single job post
export const getJobPostById = async (req, res) => {
    try {
        const { jobId } = req.params;

        console.log("job id", jobId)

        const jobPost = await JobPost.findOne({ jobId });
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found" });
        }
        res.status(200).json(jobPost);
    }
    catch (error) {
        console.error("Error fetching job post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// get job post by filters 
export const getJobPostsByFilters = async (req, res) => {
  try {
    const { department, location, type, isActive } = req.query;

    const filters = {};
    if (department) filters.department = { $regex: department, $options: "i" };
    if (location) {
      filters.location = { $regex: location, $options: "i" }; // case-insensitive partial match
    }
    if (type) filters.type = { $regex: type, $options: "i" };
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const jobPosts = await JobPost.find(filters).sort({ createdAt: -1 });
    res.status(200).json(jobPosts);
  } catch (error) {
    console.error("Error fetching job posts by filters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
