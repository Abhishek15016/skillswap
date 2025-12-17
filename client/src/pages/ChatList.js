import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, Clock, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUserChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching user chats for:', user.id);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data = await response.json();
      console.log('✅ User chats loaded:', data);
      setChats(data.chat_rooms || []);
    } catch (error) {
      console.error('❌ Error fetching user chats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserChats();
  }, [fetchUserChats]);

  const getOtherUser = (chat) => {
    if (!chat.swap_request) return null;
    const { from_user, to_user } = chat.swap_request;
    return user.id === from_user?.id ? to_user : from_user;
  };

  const getLastMessage = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text.length > 50 
      ? lastMessage.text.substring(0, 50) + '...' 
      : lastMessage.text;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return false;
    
    if (!searchTerm) return true;
    
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.swap_request?.skill_offered?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.swap_request?.skill_wanted?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Chats</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchUserChats}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Conversations</h1>
              <p className="text-gray-600 mt-1">
                Continue your skill exchange conversations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations by name or skills..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Chat List */}
        {filteredChats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {filteredChats.map((chat, index) => {
              const otherUser = getOtherUser(chat);
              const lastMessage = getLastMessage(chat.messages);
              const lastMessageTime = chat.messages && chat.messages.length > 0 
                ? formatTime(chat.messages[chat.messages.length - 1].created_at)
                : '';

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link 
                    to={`/chat/${chat.request_id}`} 
                    className="block bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 p-6"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img 
                          src={otherUser?.photo_url || `https://via.placeholder.com/60x60?text=${otherUser?.name?.charAt(0)}`}
                          alt={otherUser?.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/60x60?text=${otherUser?.name?.charAt(0)}`;
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {otherUser?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                              {lastMessage}
                            </p>
                            
                            {/* Swap Details */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">You offer:</span>
                                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                                  {chat.swap_request?.skill_offered || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">You want:</span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {chat.swap_request?.skill_wanted || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Time and Arrow */}
                          <div className="flex flex-col items-end space-y-2">
                            {lastMessageTime && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {lastMessageTime}
                              </span>
                            )}
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No conversations found' : 'No active conversations'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No conversations match your search for "${searchTerm}"`
                  : 'Accept a swap request to start chatting with other users and exchange skills.'
                }
              </p>
              <Link
                to="/requests"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                View Requests
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 