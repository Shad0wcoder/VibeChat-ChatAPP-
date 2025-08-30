import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
  markMessagesRead,      // add this
  getUnreadCounts        // add this
} from '../controllers/message.controller.js';

const router = express.Router();

// Existing routes
router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

// New routes
router.post("/markRead/:id", protectedRoute, markMessagesRead);
router.get("/unreadCounts", protectedRoute, getUnreadCounts);

export default router;
