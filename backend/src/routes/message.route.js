import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
  markMessagesRead,
  getUnreadCounts
} from '../controllers/message.controller.js';

const router = express.Router();

// Always put fixed routes first
router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/unreadCounts", protectedRoute, getUnreadCounts);   // ✅ move up
router.post("/markRead/:id", protectedRoute, markMessagesRead); // ✅ before :id
router.get("/:id", protectedRoute, getMessages);                // keep last
router.post("/send/:id", protectedRoute, sendMessage);

export default router;
