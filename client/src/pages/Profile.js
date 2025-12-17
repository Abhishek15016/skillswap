import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Camera, Save, Lock, User, MapPin, Clock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    availability: '',
    skills_offered: [],
    skills_wanted: [],
    is_public: true
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillOfferedInput, setSkillOfferedInput] = useState('');
  const [skillWantedInput, setSkillWantedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    console.log('🏠 Profile component mounted');
    console.log('🏠 Current user:', user);
    
    if (user) {
      console.log('🏠 Setting form data from user:', {
        name: user.name,
        location: user.location,
        availability: user.availability,
        skills_offered: user.skills_offered,
        skills_wanted: user.skills_wanted,
        is_public: user.is_public
      });
      
      setFormData({
        name: user.name || '',
        location: user.location || '',
        availability: user.availability || '',
        skills_offered: user.skills_offered || [],
        skills_wanted: user.skills_wanted || [],
        is_public: user.is_public !== false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addSkill = (type) => {
    const inputValue = type === 'skills_offered' ? skillOfferedInput : skillWantedInput;
    if (inputValue.trim() && !formData[type].includes(inputValue.trim())) {
      setFormData({
        ...formData,
        [type]: [...formData[type], inputValue.trim()]
      });
      // Clear the appropriate input
      if (type === 'skills_offered') {
        setSkillOfferedInput('');
      } else {
        setSkillWantedInput('');
      }
    }
  };

  const removeSkill = (type, index) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📁 File selected:', file.name, file.size);
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      console.log('📤 Uploading photo for user:', user.id);
      console.log('📤 File details:', { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });
      
      const response = await userService.uploadPhoto(user.id, selectedFile);
      console.log('✅ Photo upload response:', response);
      
      // Update user with new photo URL
      const updatedUser = { ...user, photo_url: response.photo_url };
      updateUser(updatedUser);
      
      // Clear selected file and preview, show success message
      setSelectedFile(null);
      setImagePreview(null);
      setMessage('Photo uploaded successfully! The image should update shortly.');
      
      // Force a re-render by updating the user state
      setTimeout(() => {
        console.log('🔄 Refreshing user data...');
        // This will trigger a re-render with the new photo URL
      }, 100);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      setMessage('Failed to upload photo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      console.log('💾 Saving profile data:', formData);
      console.log('💾 User ID:', user.id);
      
      const response = await userService.updateUser(user.id, formData);
      console.log('✅ Profile update response:', response);
      
      updateUser({ ...user, ...response.user });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessage('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match!');
      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long!');
      setChangingPassword(false);
      return;
    }

    try {
      await userService.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Password change error:', error);
      setMessage('Failed to change password: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const defaultAvatar = 'https://via.placeholder.com/120x120?text=' + user?.name?.charAt(0).toUpperCase();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile and skills</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}
          >
            {message}
          </motion.div>
        )}

        {/* Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card mb-8"
        >
          <div className="card-header">
            <h2 className="card-title">Profile Photo</h2>
            <p className="card-subtitle">Update your profile picture</p>
          </div>
          
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <img 
                src={imagePreview || user.photo_url || defaultAvatar} 
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-strong hover-scale transition-all duration-300"
                onError={(e) => {
                  console.log('❌ Image failed to load:', e.target.src);
                  e.target.src = defaultAvatar;
                }}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully:', e.target.src);
                }}
              />
              {imagePreview && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="btn btn-outline cursor-pointer">
                <Camera className="h-4 w-4 mr-2" />
                Choose Photo
              </label>
              {selectedFile && (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={handlePhotoUpload}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner h-4 w-4 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-4">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </motion.div>

        {user.role === 'admin' ? (
          // Admin Profile - Simplified version
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card mb-8"
            >
              <div className="card-header">
                <h2 className="card-title">Admin Profile</h2>
                <p className="card-subtitle">Manage your admin account settings</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <User className="h-4 w-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input bg-gray-50"
                    value={user.email}
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner h-4 w-4 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Username
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title">Change Password</h2>
                <p className="card-subtitle">Update your account password</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                  <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    placeholder="Confirm new password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-full"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <div className="loading-spinner h-4 w-4 mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        ) : (
          // Regular User Profile - Full version
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="card-header">
              <h2 className="card-title">Profile Information</h2>
              <p className="card-subtitle">Update your personal details and skills</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input bg-gray-50"
                  value={user.email}
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="availability" className="form-label">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Availability
                </label>
                <textarea
                  id="availability"
                  name="availability"
                  className="form-textarea"
                  value={formData.availability}
                  onChange={handleChange}
                  placeholder="Describe your availability (e.g., 'Weekends only', 'Evenings after 6 PM')"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills You Can Offer</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={skillOfferedInput}
                    onChange={(e) => setSkillOfferedInput(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, Cooking)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('skills_offered'))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => addSkill('skills_offered')}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_offered.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('skills_offered', index)}
                        className="skill-tag-remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills You Want to Learn</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={skillWantedInput}
                    onChange={(e) => setSkillWantedInput(e.target.value)}
                    placeholder="Add a skill (e.g., Spanish, Guitar)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('skills_wanted'))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => addSkill('skills_wanted')}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_wanted.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('skills_wanted', index)}
                        className="skill-tag-remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Make my profile public
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile; 