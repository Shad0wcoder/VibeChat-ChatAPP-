// lib/socket.js
import { io } from "socket.io-client";

// Get logged-in user ID from your auth store or localStorage
const userId = localStorage.getItem("userId"); // adjust to your auth logic

export const socket = io("http://localhost:5173", {
  query: { userId },
});
