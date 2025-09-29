import Subscriber from "../models/subscriberModel.js";
import subscriptionConfirmationEmailTemp from "../utils/subscribeEmail.js";
import {sendEmail} from "../config/emailService.js"
import adminNotificationEmailTemp from "../utils/notificationEmail.js";

// create subscriber
export const createSubscriber = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const existingSubscriber = await Subscriber.findOne({
            email: email.toLowerCase().trim()
        });
        if (existingSubscriber) {
            return res.status(400).json({ message: "Email is already subscribed" });
        }
        const newSubscriber = new Subscriber({
            email: email.toLowerCase().trim()
        });
        await newSubscriber.save();
        // Send confirmation email
        sendEmail({
            sendTo: email,
            subject: "Thank You for Subscribing to Info Tech India",
            text: "",
            html: subscriptionConfirmationEmailTemp( email),
        });
        return res.status(201).json({ message: "Subscription successful" });
    } catch (error) {
        console.error("Error creating subscriber:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// get all subscribers
export const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        return res.status(200).json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
// delete subscriber by id
export const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const subscriber = await Subscriber.findByIdAndDelete(id);
        if (!subscriber) {
            return res.status(404).json({ error: "Subscriber not found" });
        }
        return res.status(204).json();
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// send notification email to all subscribers
export const sendNotificationToSubscribers = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }
        const subscribers = await Subscriber.find();
        const emailPromises = subscribers.map((subscriber) =>
            sendEmail({
                sendTo: subscriber.email,
                subject: subject,
                text: "",
                html: adminNotificationEmailTemp(subscriber.email, subject,message),
            })
        );
        await Promise.all(emailPromises);
        return res.status(200).json({ message: "Notifications sent successfully" });
    } catch (error) {
        console.error("Error sending notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
    }  
};
