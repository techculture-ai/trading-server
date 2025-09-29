import Enquiry from "../models/enquiryModel.js";
import {demoScheduleConfirmationEmailTemp,adminDemoNotificationEmailTemp} from "../utils/demoTempEmail.js";
import { sendEmail } from "../config/emailService.js";
import googleCalendarService from "../services/googleCalendarService.js";

export const createEnquiryController = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message = "",
      projectName = "General",
      demoDate,
      demoTime,
    } = req.body;

    let ip = req.ip || req.socket.remoteAddress || null;
    if (ip && ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }
    if (ip === "::1") {
      ip = "127.0.0.1";
    }


    let locationData = null;
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        locationData = await response.json(); 
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      message,
      projectName,
      demoDate: demoDate || null,
      demoTime: demoTime || null,
      ip,
      location: locationData?.city || locationData?.regionName || "Unknown",
    });

    let googleMeetData = null;

    // Create Google Meet link if demo is scheduled
    if (demoDate && demoTime) {
      try {
        // Create datetime objects - no timezone conversion
        const demoDateTime = new Date(`${demoDate}T${demoTime}:00`);
        const endDateTime = new Date(demoDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

        googleMeetData = await googleCalendarService.createMeetEvent({
          summary: `Demo Session - ${projectName} with ${name}`,
          description: `Demo session for ${projectName}\n\nClient: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nNotes: ${message || 'No additional notes'}`,
          startDateTime: demoDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          attendeeEmails: [email, process.env.ADMIN_EMAIL],
          timeZone: "Asia/Kolkata" // Keep this for Google Calendar only
        });

        // Update enquiry with Google Meet data
        enquiry.googleMeetLink = googleMeetData.meetLink;
        enquiry.googleEventId = googleMeetData.eventId;
        enquiry.googleEventLink = googleMeetData.eventLink;

        console.log('Google Meet event created:', googleMeetData);

      } catch (googleError) {
        console.error("Google Meet creation failed:", googleError);
        // Continue without Google Meet - don't fail the enquiry creation
      }
    }

    await enquiry.save();

    // Send confirmation email
    if (demoDate && demoTime) {
      try {
        const emailHtml = demoScheduleConfirmationEmailTemp({
          userName: name,
          userEmail: email,
          userPhone: phone,
          companyName: projectName,
          demoDate: new Date(demoDate),
          demoTime: demoTime,
          meetingLink: googleMeetData?.meetLink || "Meeting link will be provided shortly",
          meetingId: googleMeetData?.eventId?.slice(-8) || enquiry._id.toString().slice(-6),
          demoNotes: message,
        });

        await sendEmail({
          sendTo: email,
          subject: "Demo Scheduled Successfully - TechCulture AI",
          text: "",
          html: emailHtml,
        });

        // Send admin notification
        const adminEmailHtml = adminDemoNotificationEmailTemp({
          userName: name, 
          userEmail: email, 
          userPhone: phone, 
          companyName: projectName, 
          demoDate: new Date(demoDate), 
          demoTime, 
          meetingLink: googleMeetData?.meetLink || "N/A", 
          meetingId: googleMeetData?.eventId?.slice(-8) || enquiry._id.toString().slice(-6), 
          demoNotes: message
        });

        await sendEmail({
          sendTo: process.env.ADMIN_EMAIL,
          subject: `New Demo Scheduled: ${name} - ${projectName}`,
          text: "",
          html: adminEmailHtml,
        })

        enquiry.isEmailSent = true;
        await enquiry.save();

      } catch (emailError) {
        console.error("Error sending emails:", emailError);
      }
    }

    return res.status(201).json({
      success: true,
      message: demoDate && demoTime 
        ? "Demo scheduled successfully! Google Meet link created and confirmation email sent." 
        : "Enquiry created successfully",
      enquiry: {
        ...enquiry.toObject(),
        googleMeetLink: enquiry.googleMeetLink,
      },
    });
  } catch (error) {
    console.error("Error in createEnquiryController:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllEnquiriesController = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Enquiries fetched successfully",
            enquiries
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getEnquiryByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Enquiry fetched successfully",
            enquiry
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteEnquiryController = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Delete Google Meet event if exists
        if (enquiry.googleEventId) {
            try {
                await googleCalendarService.deleteEvent(enquiry.googleEventId);
                console.log('Google Meet event deleted:', enquiry.googleEventId);
            } catch (error) {
                console.error("Error deleting Google Meet event:", error);
            }
        }

        await Enquiry.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Enquiry and Google Meet event deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateEnquiryController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const enquiry = await Enquiry.findByIdAndUpdate(id, updateData, { 
            new: true,
            runValidators: true 
        });
        
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        
        return res.status(200).json({
            success: true,
            message: "Enquiry updated successfully",
            enquiry
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}