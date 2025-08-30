import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            const unreadCount = await Message.countDocuments({ senderId, receiverId, read: false });
            io.to(receiverSocketId).emit("messageCountUpdate", { userId: senderId, count: unreadCount });
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });

    }
}

export const getUnreadCounts = async (req, res) => {
    try {
        const myId = req.user._id;

        const counts = await Message.aggregate([
            { $match: { receiverId: myId, read: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        // Convert to object { senderId: count }
        const result = {};
        counts.forEach(c => {
            result[c._id] = c.count;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markMessagesRead = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params; // the user whose messages are being read

        await Message.updateMany(
            { senderId: userId, receiverId: myId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
