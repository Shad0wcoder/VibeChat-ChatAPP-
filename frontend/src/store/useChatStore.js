import { create } from 'zustand'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from './useAuthStore'


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users. Please try again.");
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true, });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages. Please try again.");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        }
    },

    subscribeToMessages : () => {
        const { selectedUser } = get()
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket


        socket.on("newMessage", (newMessage) => {
            if(newMessage.senderId !== selectedUser._id) return ;
            set({
                messages: [...get().messages, newMessage]
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage") 
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    }
}))