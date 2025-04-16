import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from '@/components/ui/card';
import {
  Search,
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Calendar,
  Clock
} from "lucide-react";

const ProviderMessages = () => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(0);
  const [newMessage, setNewMessage] = useState('');

  // Dummy data for conversations
  const conversations = [
    {
      id: 1,
      client: "James Wilson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      lastMessage: "I'll be there on time, thank you.",
      time: "10:45 AM",
      unread: 0,
      online: true,
      messages: [
        { sender: "client", text: "Hello, I need help with my plumbing issue.", time: "10:30 AM" },
        { sender: "provider", text: "Hi James, I'd be happy to help. Can you describe the issue in more detail?", time: "10:35 AM" },
        { sender: "client", text: "The kitchen sink is leaking under the cabinet.", time: "10:38 AM" },
        { sender: "provider", text: "I understand. I can come tomorrow at 10 AM. Would that work for you?", time: "10:40 AM" },
        { sender: "client", text: "I'll be there on time, thank you.", time: "10:45 AM" },
      ]
    },
    {
      id: 2,
      client: "Maria Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "Could you bring extra electrical supplies?",
      time: "Yesterday",
      unread: 2,
      online: false,
      messages: [
        { sender: "client", text: "Hello, I need an electrician for my home.", time: "Yesterday, 3:30 PM" },
        { sender: "provider", text: "Hi Maria, I can help with that. What's the specific issue?", time: "Yesterday, 3:35 PM" },
        { sender: "client", text: "Several outlets aren't working in the living room.", time: "Yesterday, 3:40 PM" },
        { sender: "provider", text: "I'll check the circuit and replace any faulty outlets. I'm available on Thursday at 2 PM.", time: "Yesterday, 4:00 PM" },
        { sender: "client", text: "That works perfectly. Could you bring extra electrical supplies?", time: "Yesterday, 4:05 PM" },
      ]
    },
    {
      id: 3,
      client: "Robert Smith",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      lastMessage: "Thank you for the excellent service!",
      time: "Apr 14",
      unread: 0,
      online: true,
      messages: [
        { sender: "client", text: "I need a quote for house cleaning services.", time: "Apr 14, 9:30 AM" },
        { sender: "provider", text: "Hi Robert, I'd be happy to provide a quote. How large is your home?", time: "Apr 14, 9:45 AM" },
        { sender: "client", text: "It's a 3-bedroom, 2-bathroom house.", time: "Apr 14, 10:00 AM" },
        { sender: "provider", text: "Based on that size, my estimate would be $150-180. Would you like to schedule a visit?", time: "Apr 14, 10:15 AM" },
        { sender: "client", text: "Thank you for the excellent service!", time: "Apr 14, 10:30 AM" },
      ]
    },
    {
      id: 4,
      client: "Sarah Thompson",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      lastMessage: "The bathroom renovation looks amazing!",
      time: "Apr 12",
      unread: 0,
      online: false,
      messages: [
        { sender: "client", text: "Just wanted to follow up on the bathroom renovation.", time: "Apr 12, 2:00 PM" },
        { sender: "provider", text: "Hi Sarah, we're on track to complete by Friday.", time: "Apr 12, 2:10 PM" },
        { sender: "client", text: "That's great news! Can't wait to see it.", time: "Apr 12, 2:30 PM" },
        { sender: "provider", text: "I'll send you some photos of our progress tomorrow.", time: "Apr 12, 2:45 PM" },
        { sender: "client", text: "The bathroom renovation looks amazing!", time: "Apr 12, 3:00 PM" },
      ]
    }
  ];

  const activeChat = conversations[activeConversation];

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      // Logic to send message would go here in a real app
      setNewMessage('');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Messages</h1>
          <p className="text-homehelp-600">Manage your conversations with clients</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex">
            <Clock className="mr-2 h-4 w-4" />
            Message History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <Card className="p-4 overflow-hidden flex flex-col">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-homehelp-500 h-4 w-4" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
            />
          </div>
          
          <div className="space-y-1 overflow-y-auto flex-1">
            {conversations.map((conversation, index) => (
              <div 
                key={conversation.id} 
                className={`p-3 flex items-center rounded-lg cursor-pointer ${
                  activeConversation === index 
                    ? "bg-homehelp-100" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveConversation(index)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={conversation.avatar} 
                      alt={conversation.client}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-homehelp-900 truncate">{conversation.client}</h3>
                    <span className="text-xs text-homehelp-500">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-homehelp-600 truncate">{conversation.lastMessage}</p>
                </div>
                
                {conversation.unread > 0 && (
                  <span className="ml-2 bg-homehelp-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Active Conversation */}
        <Card className="lg:col-span-2 p-0 flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={activeChat.avatar} 
                      alt={activeChat.client}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-homehelp-900">{activeChat.client}</h3>
                    <p className="text-xs text-homehelp-600">
                      {activeChat.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-homehelp-50">
                <div className="space-y-4">
                  {activeChat.messages.map((message, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'provider' 
                            ? 'bg-homehelp-600 text-white rounded-br-none' 
                            : 'bg-white text-homehelp-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'provider' ? 'text-homehelp-100' : 'text-homehelp-500'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input 
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-homehelp-600 hover:bg-homehelp-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-homehelp-500">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProviderMessages;