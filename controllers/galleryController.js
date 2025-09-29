import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinaryService.js";
import galleryModel from "../models/galleryModel.js";
import { cleanupAfterUpload } from "../utils/cleanupTempFiles.js";

import { v2 as cloudinary } from "cloudinary";

export const createGalleryController = async (req, res) => {
  try {
    const { title, category, galleryType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const newGallery = new galleryModel({
      title,
      category,
      galleryType,
    });

    if (req.file) {
      let foldername = "Gallery";
      const file = req.file;
      const result = await uploadToCloudinary([file], foldername);
      const url = result[0].url || "";
      newGallery.url = url || "";

      if (galleryType === "video") {
        // Set duration if available
        if (result[0].duration) {
          newGallery.duration = result[0].duration;
        }

        // Set video dimensions
        if (result[0].height && result[0].width) {
          newGallery.height = result[0].height;
          newGallery.width = result[0].width;
        }

        // Generate proper video thumbnail using Cloudinary's video thumbnail feature
        if (url) {
          try {
            // Extract the public ID from the video URL
            const publicId = extractPublicIdFromUrl(url);

            // Generate thumbnail using Cloudinary's video thumbnail transformation
            const thumbnailUrl = cloudinary.url(publicId, {
              resource_type: "video",
              format: "jpg",
              width: 640,
              height: 360,
              crop: "fill",
              start_offset: "0", // Take thumbnail from 0 seconds (beginning of video)
              quality: "auto",
            });

            newGallery.thumbnail = thumbnailUrl;
          } catch (thumbnailError) {
            console.error("Error generating thumbnail:", thumbnailError);
            // Fallback: use a default thumbnail or the original video URL
            newGallery.thumbnail = "";
          }
        }
      } else if (galleryType === "image") {
        // For images, create a resized version for thumbnail
        const thumbnailUrl = url.replace(
          "/upload/",
          "/upload/w_640,h_360,c_fill/"
        );
        newGallery.thumbnail = thumbnailUrl;
      }
    }

    await newGallery.save();

    // Clean up temporary file after successful upload
    await cleanupAfterUpload(req.file);

    res.status(201).json({
      success: true,
      message: "Gallery created successfully",
      gallery: newGallery,
    });
  } catch (error) {
    // Clean up temporary file even if there was an error
    await cleanupAfterUpload(req.file);
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  // Extract public ID from URL like:
  // http://res.cloudinary.com/dakf05m4x/video/upload/v1755585786/Gallery/samplevideo_1280x720_1mb-0474605f-322d-4f79-aa9e-d9df3fd3b252.mp4
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

// get all gallery images
export const getAllGallery = async (req, res)=>{
    try{
        const { galleryType } = req.query;
        const gallery = await galleryModel.find({galleryType});
        res.status(200).json({
            success: true,
            message: "Gallery fetched successfully",
            gallery
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// get by id 
export const getGalleryById = async (req, res) => {
    try {
        const { id } = req.params;
        const gallery = await galleryModel.findById(id);
        if (!gallery) {
            return res.status(404).json({ message: "Gallery data not found" });
        }
        return res.status(200).json({
            message: "Gallery data fetched successfully",
            gallery
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// delete gallery
export const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const gallery = await galleryModel.findByIdAndDelete(id);
        if (!gallery) {
            return res.status(404).json({ message: "Gallery data not found" });
        }
        if(gallery.url){
            await deleteFromCloudinary(gallery.url);
        }   
        return res.status(200).json({
            message: "Gallery data deleted successfully",
            gallery
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// update gallery
export const updateGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, galleryType } = req.body;

        const gallery = await galleryModel.findById(id);
        if (!gallery) {
            return res.status(404).json({ message: "Gallery data not found" });
        }

        if(req.file){
            if(gallery.url){
                await deleteFromCloudinary(gallery.url);
            }
            const foldername = "Gallery";
            const file = req.file;
            const result = await uploadToCloudinary([file], foldername);
            gallery.url = result[0].url || "";
        }

        gallery.title = title || gallery.title;
        gallery.category = category || gallery.category;
        gallery.galleryType = galleryType || gallery.galleryType;

        await gallery.save();
        
        return res.status(200).json({
            message: "Gallery data updated successfully",
            gallery
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
