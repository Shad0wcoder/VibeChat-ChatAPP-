import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import formatMessageTime, { formatDateOnly } from "../lib/utils";


import { useRef } from 'react';

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (isMessagesLoading) return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  )

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => {
          const messageDate = formatDateOnly(message.createdAt);
          const prevMessageDate =
            index > 0 ? formatDateOnly(messages[index - 1].createdAt) : null;

          const showDateDivider = messageDate !== prevMessageDate;

          return (
            <React.Fragment key={message._id}>
              {showDateDivider && (
                <div className="flex justify-center my-2">
                  <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {messageDate}
                  </span>
                </div>
              )}

              <div
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"
                  }`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>

                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>

                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[50px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p className='md:text-lg font-medium text-[15px] p-1'>{message.text}</p>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <MessageInput />
    </div>

  )
}

export default ChatContainer