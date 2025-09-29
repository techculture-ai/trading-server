import contactModel from "../models/contactModel.js";

//create contact
export const createContact = async (req, res) => {
  const { name, email, phone, message="NA", company="Individual", service } = req.body;

  if(!name || !email || !phone || !service) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }

  try {
    const contact = await contactModel.create({
      name,
      email,
      phone,
      message,
      company,
      service
    });

    return res.status(201).json({
        message: "Contact created successfully",
        contact
        });


  } catch (error) {
   res.status(500).json({
            success: false,
            message: error.message
        });
  }
};

// get all contacts
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await contactModel.find();
        res.status(200).json({
            success: true,
            message: "Contacts fetched successfully",
            contacts
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
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactModel.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact data not found" });
        }
        return res.status(200).json({
            message: "Contact data fetched successfully",
            contact
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// delete 
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactModel.findByIdAndDelete(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact data not found" });
        }
        return res.status(200).json({
            message: "Contact data deleted successfully",
            contact
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// update
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { read } = req.body;

        const contact = await contactModel.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact data not found" });
        }

        contact.read = read || contact.read;
        await contact.save();
        
        return res.status(200).json({
            message: "Contact data updated successfully",
            contact
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}