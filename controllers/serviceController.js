import Service from "../models/serviceModel.js";
import {deleteFromCloudinary,uploadToCloudinary} from "../config/cloudinaryService.js"
import { cleanupAfterUpload } from "../utils/cleanupTempFiles.js";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphen
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-"); // collapse multiple hyphens
}

//create 
export const createService = async (req, res) => {
  const { title, description, features = [], category="main", order = 1, showOnHomePage = false, showOnHeader = false } = req.body;
  try {

    if(!title || !description || !features) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;

    const slug = slugify(title)
    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return res.status(400).json({ message: "A service with this title already exists. Please choose a different title." });
    }

    const count = await Service.countDocuments({category});

    let newOrder = count + 1;


    const service = await Service.create({
      title,
      description,
      features: parsedFeatures,
      category,
      order: parseInt(newOrder) || 1,
      showOnHomePage,
      slug,
    });

    if (req.files.file) {
      let folder = "services";
      const image = await uploadToCloudinary(req.files.file, folder);
      service.image = image[0].url;
    }

    if (req.files.sliderImage) {
      let folder = "services/slider";
      const sliderImages = await uploadToCloudinary(req.files.sliderImage, folder);
      service.sliderImage = sliderImages.map(img => img.url);
    }

    await service.save();
    await cleanupAfterUpload(req.files);

    return res.status(201).json({
        message : "Service created successfully",
        service
    })
    
  } catch (error) {
    
    await cleanupAfterUpload(req.file);
    
    res.status(400).json({ error: error.message });
  }
};

// get all
export const getAllServices = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; 
    const skip = (page - 1) * limit;
    const category = req.query.category; 
    const showOnHomePage = req.query.showOnHomePage;
    const showOnHeader = req.query.showOnHeader;
    
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (showOnHomePage) {
      filter.showOnHomePage = showOnHomePage === "true";
    }
    if (showOnHeader) {
      filter.showOnHeader = showOnHeader === "true";
    }

    // Get total count for pagination info
    const totalServices = await Service.countDocuments(filter);
    
    // Get paginated services
    const services = await Service.find(filter)
      .sort({ order: 1, updatedAt: -1 }) // Sort by updatedAt first (descending), then by order (ascending)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalServices / limit);
    const hasMore = page < totalPages;

    return res.status(200).json({
      message: "Services fetched successfully",
      services,
      pagination: {
        currentPage: page,
        totalPages,
        totalServices,
        hasMore,
        servicesPerPage: limit,
        category: category || 'all'
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get by id
export const getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get by slug
export const getServiceBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const service = await Service.findOne({ slug });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({
      message: "Service fetched successfully",
      service,
    });
  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update by id
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, features, category, order, showOnHomePage, showOnHeader } = req.body;

  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }  
    service.title = title || service.title;
    service.description = description || service.description;
    service.features = JSON.parse(features) || service.features;
    service.category = category || service.category;
    service.order = order !== undefined ? parseInt(order) : service.order;
    service.showOnHomePage = showOnHomePage !== undefined ? showOnHomePage : service.showOnHomePage;
    service.showOnHeader = showOnHeader !== undefined ? showOnHeader : service.showOnHeader;
    service.slug = title ? slugify(title) : service.slug;
    
    const slugConflict = await Service.findOne({ slug: service.slug, _id: { $ne: service._id } });
    if (slugConflict) {
      return res.status(400).json({ message: "A service with this title already exists. Please choose a different title." });
    }

    if (req.files.file) {
      if (service.image) {
        await deleteFromCloudinary(service.image);
      }
      let folder = "services";
      const image = await uploadToCloudinary(req.files.file, folder);
      service.image = image[0].url;
    }

    if (req.files.sliderImage) {
      let folder = "services/slider";
      const sliderImages = await uploadToCloudinary(req.files.sliderImage, folder);
      const newSliderImages = sliderImages.map(img => img.url);

      // Merge with existing slider images if provided
      let existingSliderImages = [];
      if (req.body.existingSliderImages) {
        try {
          existingSliderImages = JSON.parse(req.body.existingSliderImages);
          const deletedImages = service.sliderImage.filter(img => !existingSliderImages.includes(img));
          if (deletedImages.length > 0) {
              await deleteFromCloudinary(deletedImages);
          }
        } catch (e) {
          console.log("Error parsing existingSliderImages:", e);
        }
      }

      service.sliderImage = [...existingSliderImages, ...newSliderImages];
    }

    if(!req.files.sliderImage ){
      try{
        let existingSliderImages = req.body.existingSliderImages ? JSON.parse(req.body.existingSliderImages) : [];
        const deletedImages = service.sliderImage.filter(img => !existingSliderImages.includes(img));
        if (deletedImages.length > 0) {
            await deleteFromCloudinary(deletedImages);
        }
        service.sliderImage = existingSliderImages;
      } catch(e){
        console.log("Error parsing existingSliderImages:", e);
      }
    }

    await service.save();
    return res.status(200).json({
      message: "Service updated successfully",
      service,
    });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}


//delete by id
export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    if(service.image){
        await deleteFromCloudinary(service.image);
    }
    if(service.sliderImage && service.sliderImage.length > 0){
        await deleteFromCloudinary(service.sliderImage);
    }
    await Service.findByIdAndDelete(id);
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

