import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUserLoading } = useChatStore();
  const { onlineUsers, authUser, socket } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [messageCounts, setMessageCounts] = useState({});
  const BASE_URL = import.meta.env.VITE_API_URL;

  if (!authUser) {
    return (
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex items-center justify-center text-zinc-500">
        <p className="text-center px-3">Login to see your contacts</p>
      </aside>
    );
  }

  useEffect(() => {
    if (authUser?._id) {
      socket.emit("registerUser", authUser._id);
    }
  }, [authUser]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch(`${url}/messages/unreadCounts`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setMessageCounts(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const audio = new Audio("/sounds/notific.mp3");

    const handleNewMessage = (message) => {

      if (message.senderId !== authUser._id) {
        audio.play().catch(err => console.log(err));
      }

      setMessageCounts(prev => ({
        ...prev,
        [message.senderId]: selectedUser?._id === message.senderId ? 0 : (prev[message.senderId] || 0) + 1
      }));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, authUser, selectedUser]);




  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    setMessageCounts(prev => ({ ...prev, [user._id]: 0 }));

    try {
      await fetch(`${url}/messages/markRead/${user._id}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter(user => onlineUsers.includes(user._id))
    : users;

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
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
              onChange={e => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map(user => (
          <div
            key={user._id}
            className={`w-full p-3 flex items-center gap-3 cursor-pointer hover:bg-base-200 ${selectedUser?._id === user._id ? "bg-base-200" : ""
              }`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 rounded-full object-cover"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 ring-2 ring-zinc-900 rounded-full" />
              )}
              {messageCounts[user._id] > 0 && (
                <span className="hidden sm:absolute top-0 right-0 w-[20px] h-4 bg-blue-500 text-center text-white text-xs rounded-full">
                  {messageCounts[user._id]}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium truncate">{user.fullName}</div>
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
