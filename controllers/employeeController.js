import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinaryService.js";
import employeeModel from "../models/employeeModel.js";

// create employee 
export const createEmployee = async (req, res) => {
    try {
        const { name, description, designation, department, socialLinks=[] } = req.body;
        
        const newEmployee = new employeeModel({
            name,
            description,
            designation,
            department,
            socialLinks
        })

        if(req.file){
            let foldername = "employee";
            const file = req.file;
            const result = await uploadToCloudinary([file], foldername);
            const profilePicture = result[0].url;
            newEmployee.profilePicture = profilePicture || "";
        }
        await newEmployee.save();

        return res.status(201).json({
            message: "Employee created successfully",
            employee: newEmployee
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.find();
        return res.status(200).json({
            message: "Employees fetched successfully",
            employees
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// get employee by id
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await employeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(200).json({
            message: "Employee fetched successfully",
            employee
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id", id)
        const { name, description, designation, department, socialLinks=[] } = req.body;

        const employee = await employeeModel.findOne({_id: id});
        console.log("employee", employee)
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if(req.file){
            if(employee.profilePicture){
                await deleteFromCloudinary(employee.profilePicture);
            }
            const foldername = "employee";
            const file = req.file;
            const result = await uploadToCloudinary([file], foldername);
            employee.profilePicture = result[0].url || "";
        }

        employee.name = name || employee.name;
        employee.description = description || employee.description;
        employee.designation = designation || employee.designation;
        employee.department = department || employee.department;
        employee.socialLinks = socialLinks || employee.socialLinks;

        await employee.save();
        
        return res.status(200).json({
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await employeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        if(employee.profilePicture){
            await deleteFromCloudinary(employee.profilePicture);
        }
        await employeeModel.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Employee deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}