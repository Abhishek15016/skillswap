import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';

import { ArrowLeft, Send, Clock, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Chat = () => {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchChatData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching chat data for request ID:', requestId);
      const data = await chatService.getChatRoom(requestId);
      console.log('✅ Chat data received:', data);
      setChatData(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('❌ Error fetching chat data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatData?.chat_room?.id) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage(chatData.chat_room.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherUser = () => {
    if (!chatData?.swap_request) return null;
    const { from_user, to_user } = chatData.swap_request;
    return user.id === from_user?.id ? to_user : from_user;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-responsive py-8">
          <div className="card">
            <div className="alert alert-error">
              {error}
            </div>
            <div className="text-center">
              <Link to="/requests" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chatData?.chat_room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-responsive py-8">
          <div className="card">
            <div className="alert alert-warning">
              Chat room not found. This might be because the request hasn't been accepted yet.
            </div>
            <div className="text-center">
              <Link to="/requests" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat</h1>
              <p className="text-gray-600">
                Chat with {otherUser?.name} about your skill swap
              </p>
            </div>
            <Link to="/requests" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-0 overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-gradient-primary text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={otherUser?.photo_url || `https://via.placeholder.com/50x50?text=${otherUser?.name?.charAt(0)}`}
                  alt={otherUser?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold">{otherUser?.name}</h3>
                  <p className="text-primary-100 text-sm">
                    Swap: {chatData.swap_request?.skill_offered} ↔ {chatData.swap_request?.skill_wanted}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-primary-100">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Active</span>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto custom-scrollbar p-6 bg-gray-50">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`chat-message ${message.sender_id === user.id ? 'own' : 'other'}`}>
                      <div className="mb-1">
                        {message.text}
                      </div>
                      <div className="chat-message-time flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 bg-white border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="form-input flex-1"
              />
              <button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="btn btn-primary"
              >
                {sending ? (
                  <div className="loading-spinner h-4 w-4"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Swap Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card mt-8"
        >
          <div className="card-header">
            <h3 className="card-title">Swap Details</h3>
            <p className="card-subtitle">Information about your skill exchange</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Exchange Partners
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <img 
                    src={chatData.swap_request?.from_user?.photo_url || `https://via.placeholder.com/32x32?text=${chatData.swap_request?.from_user?.name?.charAt(0)}`}
                    alt={chatData.swap_request?.from_user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{chatData.swap_request?.from_user?.name}</p>
                    <p className="text-sm text-gray-600">Offers: {chatData.swap_request?.skill_offered}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src={chatData.swap_request?.to_user?.photo_url || `https://via.placeholder.com/32x32?text=${chatData.swap_request?.to_user?.name?.charAt(0)}`}
                    alt={chatData.swap_request?.to_user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{chatData.swap_request?.to_user?.name}</p>
                    <p className="text-sm text-gray-600">Offers: {chatData.swap_request?.skill_wanted}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Request Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Status:</span> 
                  <span className={`badge ml-2 ${
                    chatData.swap_request?.status === 'accepted' ? 'badge-accepted' : 
                    chatData.swap_request?.status === 'rejected' ? 'badge-rejected' : 
                    'badge-pending'
                  }`}>
                    {chatData.swap_request?.status}
                  </span>
                </p>
                <p><span className="font-medium">Request Date:</span> {chatData.swap_request?.created_at ? new Date(chatData.swap_request.created_at).toLocaleDateString() : 'N/A'}</p>
                {chatData.swap_request?.message && (
                  <p><span className="font-medium">Message:</span> {chatData.swap_request.message}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat; 