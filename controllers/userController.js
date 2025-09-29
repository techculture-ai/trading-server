import userModel from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {sendEmail} from "../config/emailService.js"
import VerificationEmail from "../utils/verifyEmail.js";
import forgotPasswordEmail from "../utils/forgotPasswordEmail.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinaryService.js";


//  Register User 
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role="user" } = req.body;
        if (!name || !email || !password ) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const isAlreadyExist = await userModel.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const lowerCaseRole = role.toLowerCase();

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: lowerCaseRole,
            otp: verifyCode,
            otpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        newUser.save();

        const sent = await sendEmail({
            sendTo: email,
            subject: "Verify email from TechCulture App",
            text: "",
            html: VerificationEmail(newUser.name, verifyCode),
        });

        if(!sent.success){
            return res.status(500).json({ message: "Failed to send verification email" });
        }

        return res.status(200).json({ message: "User registered successfully! Verify Your Email" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// verify otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        user.isVerified = true;
        user.otp = "";
        user.otpExpires = "";
        await user.save();
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// Login User
export const adminloginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if(user.role !== "admin"){
            return res.status(400).json({ message: "You are not admin" });
        }
        if (!user.isVerified) {
            const verifyCode = Math.floor(100000 + Math.random() * 900000);
            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000; 
            await user.save();
            await sendEmail({
                sendTo: email,
                subject: "Verify email from TechCulture App",
                text: "",
                html: VerificationEmail(user.name, verifyCode),
            });
            return res.status(400).json({ message: "Verify Your Email" });
        }
        const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({user: {name: user.name, _id: user._id, role : user.role}}, process.env.JWT_SECRET);
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        console.log()
        const user = await userModel.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User profile",
            user
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Update User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if(req.file){
            if(user.profilePicture){
                await deleteFromCloudinary(user.profilePicture);
            }
            const folder = req.body.folder || 'default';
            const file = req.file;
            const result = await uploadToCloudinary([file], folder);
            const profilePicture = result[0].url;
            user.profilePicture = profilePicture || "";
        }

        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        return res.status(200).json({
            message: "User profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000);
        user.otp = verifyCode;
        user.otpExpires = Date.now() + 600000;
        await user.save();
        await sendEmail({
            sendTo: email,
            subject: "Reset Password from TechCulture App",
            text: "",
            html: forgotPasswordEmail(user.name, verifyCode),
        });
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUsers = (req,res)=>{
    try {
        userModel.find({}).then((users) => {
            res.status(200).json({
                message: "All users",
                users
            });
        }).catch((error) => {
            res.status(500).json({ message: error.message });
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide current and new password" });
        }

        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
