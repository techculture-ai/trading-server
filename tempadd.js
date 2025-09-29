import mongoose from "mongoose";
import {Category} from "./models/projectModel.js"; // adjust path to your Service model

// 1. Connect to MongoDB
const MONGO_URI = "mongodb+srv://hariom-tech:Root789@cluster0.jv8kgit.mongodb.net/TechCultureAiDB"; // change to your DB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// 2. Function to slugify
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphen
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-"); // collapse multiple hyphens
}

// 3. Main function
async function updateSlugs() {
  try {
    const services = await Category.find({});
    console.log(`Found ${services.length} services`);

    for (const service of services) {
      // create new slug
      const newSlug = slugify(service.name);

      // only update if slug missing or different
      if (!service.slug || service.slug !== newSlug) {
        service.slug = newSlug;
        await service.save();
        console.log(`Updated slug for: ${service.name} → ${newSlug}`);
      }
    }

    console.log("✅ All slugs updated!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

updateSlugs();
