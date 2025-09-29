import Slider from "../models/sliderModel.js";
import {deleteFromCloudinary,uploadToCloudinary} from "../config/cloudinaryService.js"

//create slider
export const createSlider = async (req, res) => {
  try {
    const { title, subTitle, description, category } = req.body;

    // Validate request
    if (!title || !subTitle || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Upload image to Cloudinary
    if(!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const result = await uploadToCloudinary([req.file], "slider");

    // Create slider
    const slider = new Slider({
      image: result[0].url,
      title,
      subTitle,
      description,
      category
    });

    await slider.save();

    res.status(201).json({
      success: true,
      data: slider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// get all sliders
export const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.status(200).json({
      success: true,
      data: sliders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

//get slider by id
export const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found"
      });
    }
    res.status(200).json({
      success: true,
      data: slider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// delete slider
export const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found"
      });
    }

    await slider.remove();

    await deleteFromCloudinary(slider.image);

    res.status(200).json({
      success: true,
      message: "Slider deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// edit slider 
export const editSlider = async (req, res) => {
    try {
        const slider = await Slider.findById(req.params.id);
        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found"
            });
        }

        const { title, subTitle, description, category } = req.body;

        // Validate request
        if (!title || !subTitle || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Update image in Cloudinary if new image is uploaded
        if (req.file) {
            await deleteFromCloudinary(slider.image);
            const result = await uploadToCloudinary([req.file], "slider");
            slider.image = result[0].url;
        }

        slider.title = title;
        slider.subTitle = subTitle;
        slider.description = description;
        slider.category = category;

        await slider.save();

        res.status(200).json({
            success: true,
            data: slider
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};