import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinaryService.js";
import Testimonial from "../models/testimonialModel.js";

// create testimonial
export const createTestimonial = async (req, res) => {
    try {
        const {name, message, title} = req.body;
        if(!name || !message || !title) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        const newtestimonial = new Testimonial({
            name,
            message,
            title
        });

        // Handle multiple file uploads (image and backgroundImage)
        if(req.files && Object.keys(req.files).length > 0){
            const folder = "testimonials";
            
            // Handle image upload
            if (req.files.image && req.files.image.length > 0) {
                const imageResult = await uploadToCloudinary(req.files.image, folder);
                newtestimonial.image = imageResult[0].url;
            }
            
            // Handle background image upload
            if (req.files.backgroundImage && req.files.backgroundImage.length > 0) {
                const backgroundResult = await uploadToCloudinary(req.files.backgroundImage, folder);
                newtestimonial.backgroundImage = backgroundResult[0].url;
            }
        }

        await newtestimonial.save();
        res.status(201).json({
            success: true,
            message: "Testimonial created successfully",
            testimonial: newtestimonial
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get all testimonials
export const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Testimonials fetched successfully",
            testimonials
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//get by id
export const getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial data not found" });
        }
        return res.status(200).json({
            message: "Testimonial data fetched successfully",
            testimonial
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// delete testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByIdAndDelete(id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial data not found" });
        }
        
        // Delete both images from cloudinary
        if(testimonial.image){
            await deleteFromCloudinary(testimonial.image);
        }
        if(testimonial.backgroundImage){
            await deleteFromCloudinary(testimonial.backgroundImage);
        }
        
        return res.status(200).json({
            message: "Testimonial data deleted successfully",
            testimonial
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//edit testimonial
export const editTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, message, title, removeBackgroundImage } = req.body;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial data not found" });
        }

        // Handle background image removal
        if (removeBackgroundImage === 'true') {
            if (testimonial.backgroundImage) {
                await deleteFromCloudinary(testimonial.backgroundImage);
                testimonial.backgroundImage = undefined;
            }
        }

        // Handle multiple file uploads
        if (req.files && Object.keys(req.files).length > 0) {
            console.log("Uploading new images...");
            const foldername = "testimonials";
            
            // Handle image upload
            if (req.files.image && req.files.image.length > 0) {
                const imageResult = await uploadToCloudinary(req.files.image, foldername);
                if (testimonial.image) {
                    await deleteFromCloudinary(testimonial.image);
                }
                testimonial.image = imageResult[0].url;
            }
            
            // Handle background image upload (only if not removing)
            if (req.files.backgroundImage && req.files.backgroundImage.length > 0 && removeBackgroundImage !== 'true') {
                const backgroundResult = await uploadToCloudinary(req.files.backgroundImage, foldername);
                if (testimonial.backgroundImage) {
                    await deleteFromCloudinary(testimonial.backgroundImage);
                }
                testimonial.backgroundImage = backgroundResult[0].url;
            }
        }

        testimonial.name = name || testimonial.name;
        testimonial.message = message || testimonial.message;
        testimonial.title = title || testimonial.title;

        console.log("Testimonial before save:", {
            name: testimonial.name,
            title: testimonial.title,
            message: testimonial.message,
            image: testimonial.image,
            backgroundImage: testimonial.backgroundImage
        });

        await testimonial.save();
        
        console.log("Testimonial after save:", {
            name: testimonial.name,
            title: testimonial.title,
            message: testimonial.message,
            image: testimonial.image,
            backgroundImage: testimonial.backgroundImage
        });
        
        return res.status(200).json({
            message: "Testimonial data updated successfully",
            testimonial
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}