import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Filter, MapPin, Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !filterSkill || 
                        user.skills_offered?.some(skill => skill.toLowerCase().includes(filterSkill.toLowerCase())) ||
                        user.skills_wanted?.some(skill => skill.toLowerCase().includes(filterSkill.toLowerCase()));
    
    return matchesSearch && matchesSkill;
  });

  const allSkills = [...new Set(
    users.flatMap(user => [
      ...(user.skills_offered || []),
      ...(user.skills_wanted || [])
    ])
  )].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community members...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchUsers}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Members</h1>
              <p className="text-gray-600 mt-1">
                Connect with {users.length} skilled professionals
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredUsers.map((userItem, index) => (
              <motion.div
                key={userItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* User Header */}
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={userItem.photo_url || `https://via.placeholder.com/60x60?text=${userItem.name?.charAt(0)}`}
                      alt={userItem.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/60x60?text=${userItem.name?.charAt(0)}`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{userItem.name}</h3>
                      {userItem.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {userItem.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Offered */}
                  {userItem.skills_offered && userItem.skills_offered.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        Offers
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {userItem.skills_offered.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-tag text-xs">
                            {skill}
                          </span>
                        ))}
                        {userItem.skills_offered.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{userItem.skills_offered.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Wanted */}
                  {userItem.skills_wanted && userItem.skills_wanted.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                        Wants to Learn
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {userItem.skills_wanted.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-tag text-xs bg-blue-100 text-blue-800 border-blue-200">
                            {skill}
                          </span>
                        ))}
                        {userItem.skills_wanted.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{userItem.skills_wanted.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <Link
                    to={`/profile/${userItem.id}`}
                    className="btn btn-outline w-full"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center py-16"
          >
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterSkill 
                ? 'Try adjusting your search or filter criteria'
                : 'No community members available at the moment'
              }
            </p>
            {(searchTerm || filterSkill) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSkill('');
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 