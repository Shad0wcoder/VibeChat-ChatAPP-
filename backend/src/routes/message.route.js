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

router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/unreadCounts", protectedRoute, getUnreadCounts);
router.post("/markRead/:id", protectedRoute, markMessagesRead);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

export default router;
