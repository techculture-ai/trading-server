import Customer from "../models/customerModel.js";
import {deleteFromCloudinary,uploadToCloudinary} from "../config/cloudinaryService.js"

// create customer
export const createCustomer = async (req, res) => {
  try {
    const { company, title, category } = req.body;

    const newCustomer = new Customer({
      company,
      title,
      category,
    });
    // Upload image to Cloudinary
    if(req.file) {
      const uploadedImage = await uploadToCloudinary([req.file], "customerReview");
      newCustomer.image = uploadedImage[0].url;
    }
    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
  } catch (error) {
    res.status(500).json({ message: "Error creating customer", error });
  }
};

// get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json({ message: "Customers retrieved successfully", customers });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customers", error });
  }
};

// get customer by id
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer retrieved successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customer", error });
  }
};

// update customer by id
export const updateCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, title, category } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if(req.file) {
        await deleteFromCloudinary(customer.image);
        const uploadedImage = await uploadToCloudinary([req.file], "customerReview");
        customer.image = uploadedImage[0].url;
    }

    customer.company = company;
    customer.title = title;
    customer.category = category;

    await customer.save();
    res.status(200).json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};

// delete customer by id
export const deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await deleteFromCloudinary(customer.image);
    await customer.remove();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};
