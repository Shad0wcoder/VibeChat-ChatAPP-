import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { socket } from "../lib/socket"; // import your socket client

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUserLoading } = useChatStore();
  const { onlineUsers, authUser} = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [messageCounts, setMessageCounts] = useState({}); // store { userId: unreadCount }
  const token = authUser?.token;
  const url = "http://localhost:5001"
  console.log("Token:", token);


  // Fetch users
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Fetch initial unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch(`${url}/api/messages/unreadCounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json(); // { userId: count }
        setMessageCounts(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (token) fetchUnreadCounts();
  }, [token]);

  // Listen for real-time updates from socket
  useEffect(() => {
    socket.on("messageCountUpdate", ({ userId, count }) => {
      setMessageCounts((prev) => ({ ...prev, [userId]: count }));
    });

    return () => socket.off("messageCountUpdate");
  }, []);

  // When user clicks on a contact
  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    // Mark messages as read in backend
    try {
      await fetch(`${url}/api/messages/markRead/${user._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reset unread count locally
      setMessageCounts((prev) => ({ ...prev, [user._id]: 0 }));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`w-full p-3 flex items-center gap-3 cursor-pointer hover:bg-base-200 ${
              selectedUser?._id === user._id ? "bg-base-200" : ""
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 rounded-full object-cover"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 ring-2 ring-zinc-900 rounded-full" />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium truncate">{user.fullName}</div>
                {/* Unread message count badge */}
                {messageCounts[user._id] > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {messageCounts[user._id]}
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
