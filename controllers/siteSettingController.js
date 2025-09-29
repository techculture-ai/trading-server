import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinaryService.js";
import SiteSetting from "../models/siteSettingModel.js";

export const getSiteSetting = async (req, res) => {
  try {
    const siteSetting = await SiteSetting.findOne();
    res.status(200).json({ success: true, data: siteSetting });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch site settings" });
  }
};

export const updateSiteSetting = async (req, res) => {
  try {
    const {
      siteTitle,
      email,
      contactNo,
      facebook,
      instagram,
      twitter,
      linkedin,
      registeredIframe,
      officeIframe,
      registeredAddress,
      officeAddress,
    } = req.body;

    const data = {
      siteTitle,
      email,
      contactNo,
      facebook,
      instagram,
      twitter,
      linkedin,
      registeredIframe,
      officeIframe,
      registeredAddress,
      officeAddress,
    };

    let siteSetting = await SiteSetting.findOne();

    // ✅ Handle logo upload
    if (req.files?.logo?.length > 0) {
      if (siteSetting?.logo) {
        await deleteFromCloudinary(siteSetting.logo);
      }

      const foldername = "siteSetting";
      const result = await uploadToCloudinary(req.files.logo, foldername);
      data.logo = result[0].url;

      if (!data.logo) {
        return res.status(400).json({ success: false, message: "Logo upload failed" });
      }
    }

    // ✅ Handle clients upload
    if (req.files?.clients?.length > 0) {
      const foldername = "siteSetting/clients";
      const uploadedClients = await uploadToCloudinary(req.files.clients, foldername);
      const newClientUrls = uploadedClients.map(file => file.url);
      
      // Merge with existing clients if existingClients is provided
      let existingClientUrls = [];
      if (req.body.existingClients) {
        try {
          existingClientUrls = JSON.parse(req.body.existingClients);
        } catch (e) {
          console.log("Error parsing existingClients:", e);
        }
      }
      
      data.clients = [...existingClientUrls, ...newClientUrls];
    }

    // ✅ Save or update
    if (siteSetting) {
      Object.assign(siteSetting, data);
    } else {
      siteSetting = new SiteSetting(data);
    }

    await siteSetting.save();
    res.status(200).json({ success: true, data: siteSetting });
  } catch (error) {
    console.error("Error updating site setting:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
