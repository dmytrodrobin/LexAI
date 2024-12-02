import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus } from 'lucide-react';
import { postRequest, getRequest } from '@/lib/utils'; // Ensure you have a `getRequest` function
import { useNavigate, useSearchParams } from 'react-router-dom'; // React Router for query params
import { useAuth } from '@/context/AuthContext';

interface Message {
  type: 'request' | 'response';
  text: string;
  createdAt: string;
}

export const ChatPage: React.FC = () => {
  const [chats, setChats] = useState<string[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, refresh } = useAuth()

  useEffect(() => {
    if (currentUser?.conversations) {
      setChats(currentUser.conversations.filter(c => !!c).sort((a, b) => a.updatedAt > b.updatedAt ? 1 : 0).map(c => c._id))
    }
  }, [currentUser])

  // Fetch messages if an `id` is provided
  useEffect(() => {
    const chatId = searchParams.get('id');

    if (chatId) {
      setCurrentChat(chatId);
      fetchMessages(chatId);
    }
  }, [searchParams]);

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await getRequest(`/conversation/${chatId}`);
      const sorted = response.messages.sort((a: Message, b: Message) => a.createdAt > b.createdAt ? 1 : 0)
      setMessages(sorted); // Ensure `response.messages` is formatted correctly
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      if (error.status === 403) {
        navigate("/login")
      }
    }
  };

  const createNewChat = () => {
    setCurrentChat(null);
    navigate("/chat")
    setMessages([]); // Clear messages for the new chat
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendClick = async () => {
    if (!message.trim()) {
      return;
    }

    try {
      const newMessage: Message = {
        type: 'request',
        text: message,
        createdAt: new Date().toISOString(),
      };

      // Update local messages immediately for better UX
      setMessages((prev) => [...prev, newMessage]);

      // Send the message to the server
      const response = await postRequest(`/conversation`, { conversationId: currentChat, text: message });



      // If no `id` in params, navigate to new chat page with the provided ID
      if (!currentChat && response._id) {
        await refresh()
        setCurrentChat(response._id); // Set current chat ID
        setChats((prev) => [response._id, ...prev,])
        navigate(`/chat?id=${response._id}`); // Navigate to the new chat
      }

      const responseMessage: Message = {
        type: 'response',
        text: response.messages[0].text,
        createdAt: response.messages[0].createdAt,
      };

      // Update with server response
      setMessages((prev) => [...prev, responseMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 p-4 border-r">
        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={createNewChat}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <div className="space-y-2 overflow-y-scroll max-h-96" >
          {chats.map((chat) => (
            <Button
              key={chat}
              variant={currentChat === chat ? 'secondary' : 'default'}
              className="w-full justify-start"
              onClick={() => {
                setCurrentChat(chat);
                fetchMessages(chat); // Fetch messages for the selected chat
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {chat}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {(
          <div className="flex-1 p-4 flex flex-col">
            <Card className="h-full overflow-y-auto p-4">
              {/* Display Messages */}
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'request' ? 'justify-end' : 'justify-start'
                      } mb-2`}
                  >
                    <div
                      className={`p-2 rounded-lg text-white ${msg.type === 'request' ? 'bg-blue-500' : 'bg-gray-300 text-black'
                        }`}
                    >
                      <p>{msg.text}</p>
                      <small className="block text-xs mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No messages in this chat yet
                </div>
              )}
            </Card>
            <div className="mt-4 flex">
              <Input
                placeholder="Type a message..."
                className="flex-1 mr-2"
                value={message}
                onChange={handleInputChange}
              />
              <Button onClick={handleSendClick}>Send</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
