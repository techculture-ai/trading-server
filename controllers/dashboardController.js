import User from "../models/userModel.js";
import JobPost from "../models/jobPostModel.js";
import JobApplication from "../models/jobApplicationModel.js";
import Enquiry from "../models/enquiryModel.js";
import Contact from "../models/contactModel.js";
import contactModel from "../models/contactModel.js";

// Count endpoints
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user count",
      error: error.message,
    });
  }
};

export const getJobPostCount = async (req, res) => {
  try {
    const count = await JobPost.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job post count",
      error: error.message,
    });
  }
};

export const getJobApplicationCount = async (req, res) => {
  try {
    const count = await JobApplication.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job application count",
      error: error.message,
    });
  }
};

export const getEnquiryCount = async (req, res) => {
  try {
    const count = await Enquiry.countDocuments();
    res.status(200).json({ 
      message: "Enquiry count fetched successfully",
      count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching enquiry count",
      error: error.message,
    });
  }
};

export const getContactCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.status(200).json({ 
      message : "Contact count",
      count 
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching contact count",
      error: error.message,
    });
  }
};

// Recent items endpoints
export const getRecentApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedApplications = applications.map((app) => ({
      _id: app._id,
      jobTitle: app.jobId || "Unknown Job",
      applicantName: app.fullName,
      email: app.email,
      createdAt: app.createdAt,
      status: app.status,
    }));

    res.status(200).json(formattedApplications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent applications",
      error: error.message,
    });
  }
};

export const getRecentEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .select("email message createdAt status")
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedEnquiries = enquiries.map((enq) => ({
      _id: enq._id,
      email: enq.email,
      message: enq.message?.substring(0, 100) + "...", // Truncate long messages
      createdAt: enq.createdAt,
      status: enq.status,
    }));

    res.status(200).json(formattedEnquiries);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent enquiries",
      error: error.message,
    });
  }
};

export const getRecentContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find().sort({createdAt : -1}).limit(10);
    const formattedContacts = contacts.map((contact) => ({
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      message: contact.message?.substring(0, 100) + "...",
      createdAt: contact.createdAt,
      read: contact.read,
    }));

    res.status(200).json(formattedContacts);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent contacts",
      error: error.message,
    });
  }
};

// Activity stats endpoint
export const getActivityStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [applications, enquiries] = await Promise.all([
      JobApplication.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            applications: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Enquiry.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            enquiries: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Create a map for all dates in the last 30 days
    const dateMap = new Map();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, {
        date: dateStr,
        applications: 0,
        enquiries: 0,
      });
    }

    // Fill in the actual values
    applications.forEach((item) => {
      if (dateMap.has(item._id)) {
        dateMap.get(item._id).applications = item.applications;
      }
    });

    enquiries.forEach((item) => {
      if (dateMap.has(item._id)) {
        dateMap.get(item._id).enquiries = item.enquiries;
      }
    });

    // Convert map to array and sort by date
    const activityData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.status(200).json(activityData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching activity stats",
      error: error.message,
    });
  }
};

// Activity data helper function
async function getActivityData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [applications, enquiries] = await Promise.all([
    JobApplication.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Enquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Create a map of all dates in the last 30 days
  const dateMap = new Map();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dateMap.set(dateStr, { date: dateStr, applications: 0, enquiries: 0 });
  }

  // Fill in actual values
  applications.forEach((item) => {
    if (dateMap.has(item._id)) {
      dateMap.get(item._id).applications = item.count;
    }
  });

  enquiries.forEach((item) => {
    if (dateMap.has(item._id)) {
      dateMap.get(item._id).enquiries = item.count;
    }
  });

  // Convert map to array and sort by date
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Combined dashboard stats endpoint
export const getDashboardStats = async (req, res) => {
  try {
    const [
      userCount,
      jobCount,
      applicationCount,
      enquiryCount,
      contactCount,
      recentApplications,
      recentEnquiries,
      activityData,
    ] = await Promise.all([
      User.countDocuments(),
      JobPost.countDocuments(),
      JobApplication.countDocuments(),
      Enquiry.countDocuments(),
      Contact.countDocuments(),
      JobApplication.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("jobPost", "title"),
      Enquiry.find().sort({ createdAt: -1 }).limit(10),
      getActivityData(),
    ]);

    res.status(200).json({
      userCount,
      jobCount,
      applicationCount,
      enquiryCount,
      contactCount,
      recentApplications,
      recentEnquiries,
      activityData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
