import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Users } from "lucide-react";
import type { Message } from "@shared/schema";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Mock user ID - in real app, get from auth
  const currentUserId = "user123";

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/messages', currentUserId],
    enabled: !!currentUserId,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', currentUserId, selectedConversation],
    enabled: !!selectedConversation,
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // TODO: Implement send message mutation
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Chat Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">John Doe</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active nearby</p>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUserId
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>Nearby contacts</span>
          </div>
        </div>
      </header>

      {/* Conversations List */}
      <main className="flex-1 overflow-y-auto pb-20">
        {conversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation: Message) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(
                  conversation.senderId === currentUserId 
                    ? conversation.receiverId 
                    : conversation.senderId
                )}
                className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`} />
                  <AvatarFallback>
                    {conversation.senderId === currentUserId ? 'R' : 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.senderId === currentUserId ? 'Receiver' : 'Sender'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conversation.content}
                  </p>
                </div>
                
                {!conversation.isRead && conversation.receiverId === currentUserId && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start connecting with people nearby to begin messaging
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
