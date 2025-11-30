import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Shield, Camera, Edit3, Save, X,
  Sparkles, LogOut, ArrowLeft, CheckCircle2, AlertCircle,
  Key, Loader2, Eye, EyeOff, Lock, Trash2, Upload, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { AuthBackground } from '../components/AuthBackground';
import { uploadAvatar, removeAvatar } from '../services/upload';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
  });

  // Avatar upload state
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Real-time validation for new password
  const validateNewPassword = (password: string) => {
    if (!password) {
      return '';
    } else if (password.length < 8) {
      return 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      return 'Must contain an uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      return 'Must contain a lowercase letter';
    } else if (!/\d/.test(password)) {
      return 'Must contain a number';
    }
    return '';
  };

  // Real-time validation for confirm password
  const validateConfirmPassword = (confirmPass: string, newPass: string) => {
    if (!confirmPass) {
      return '';
    } else if (newPass !== confirmPass) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Handle new password change with real-time validation
  const handleNewPasswordChange = (value: string) => {
    setPasswordData(prev => ({ ...prev, newPassword: value }));

    // Validate new password
    const newPassError = validateNewPassword(value);
    setPasswordErrors(prev => ({ ...prev, newPassword: newPassError }));

    // Also re-validate confirm password if it has a value
    if (passwordData.confirmPassword) {
      const confirmError = validateConfirmPassword(passwordData.confirmPassword, value);
      setPasswordErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // Handle confirm password change with real-time validation
  const handleConfirmPasswordChange = (value: string) => {
    setPasswordData(prev => ({ ...prev, confirmPassword: value }));

    // Validate confirm password
    const confirmError = validateConfirmPassword(value, passwordData.newPassword);
    setPasswordErrors(prev => ({ ...prev, confirmPassword: confirmError }));
  };

  // Final validation before submit
  const validatePasswords = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    const newPassError = validateNewPassword(passwordData.newPassword);
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassError) {
      errors.newPassword = newPassError;
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 5MB.';
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setSelectedFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image first' });
      return;
    }

    setIsAvatarLoading(true);
    setUploadProgress(0);
    setMessage(null);

    // Simulate progress (since fetch doesn't provide upload progress easily)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const response = await uploadAvatar(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        // Refresh user data to get the new avatar
        await refreshUser();
        setTimeout(() => {
          setIsEditingAvatar(false);
          resetAvatarModal();
        }, 500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to upload profile picture' });
      }
    } catch {
      clearInterval(progressInterval);
      setMessage({ type: 'error', text: 'An error occurred during upload' });
    } finally {
      setIsAvatarLoading(false);
      setUploadProgress(0);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    setIsAvatarLoading(true);
    setMessage(null);

    try {
      const response = await removeAvatar();

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile picture removed!' });
        await refreshUser();
        setIsEditingAvatar(false);
        resetAvatarModal();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to remove profile picture' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsAvatarLoading(false);
    }
  };

  // Reset avatar modal state
  const resetAvatarModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setMessage(null); // Clear any messages when resetting modal
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await updateProfile({ name: formData.name.trim() });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate all fields
    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ current: false, new: false, confirm: false });
      } else {
        // Handle specific error for incorrect current password
        if (response.message?.toLowerCase().includes('incorrect') ||
          response.message?.toLowerCase().includes('invalid') ||
          response.message?.toLowerCase().includes('wrong')) {
          setPasswordErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }));
        } else {
          setMessage({ type: 'error', text: response.message || 'Failed to change password' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <AuthBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="group">
              <Logo size="md" />
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Message Banner */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-red-500/10 border border-red-500/30'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <p className={message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                {message.text}
              </p>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-slate-400 hover:text-white"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl overflow-hidden mb-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-indigo-500/30 shadow-2xl shadow-indigo-500/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-500/20 border-4 border-indigo-500/30">
                      {getInitials(user.name)}
                    </div>
                  )}

                  {/* Camera overlay - clickable to edit avatar */}
                  <button
                    onClick={() => {
                      resetAvatarModal();
                      setIsEditingAvatar(true);
                    }}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title="Change profile picture"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>

                  {/* Online indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-slate-900">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-3xl font-bold bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        autoFocus
                        placeholder="Your name"
                        aria-label="Full name"
                      />
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="p-2 bg-indigo-500 rounded-lg hover:bg-indigo-400 transition-colors disabled:opacity-50"
                        title="Save changes"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Save className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ name: user.name });
                        }}
                        className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                        title="Cancel editing"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-all"
                        title="Edit name"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  <p className="text-slate-400 flex items-center gap-2 justify-center md:justify-start mb-4">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pro Member
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-sm">
                      <Shield className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-3 justify-center h-[100px]">
                  {/* <button
                    onClick={() => navigate('/app')}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Sketching
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Sketches', value: '12', icon: Palette, color: 'from-indigo-500 to-purple-500' },
              { label: 'Generated', value: '48', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
              { label: 'Hours Saved', value: '24h', icon: Clock, color: 'from-pink-500 to-rose-500' },
              { label: 'Days Active', value: '7', icon: Calendar, color: 'from-rose-500 to-orange-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 overflow-hidden group hover:border-slate-700/50 transition-all"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <stat.icon className="w-8 h-8 text-slate-500 mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div> */}

          {/* Settings Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Account Settings */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Account Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                  <div>
                    <p className="text-sm text-slate-400">Member Since</p>
                    <p className="text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-slate-500" />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-slate-400">Auth Provider</p>
                    <p className="text-white capitalize">{user.authProvider || 'Email'}</p>
                  </div>
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Security
              </h2>

              {isChangingPassword ? (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value });
                          setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                        }}
                        className={`w-full pl-12 pr-12 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-700'
                          }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        title={showPasswords.current ? 'Hide password' : 'Show password'}
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handleNewPasswordChange(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${passwordErrors.newPassword ? 'border-red-500' : passwordData.newPassword && !passwordErrors.newPassword ? 'border-emerald-500' : 'border-slate-700'
                          }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        title={showPasswords.new ? 'Hide password' : 'Show password'}
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword ? (
                      <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {passwordErrors.newPassword}
                      </p>
                    ) : passwordData.newPassword ? (
                      <p className="mt-1.5 text-sm text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Password meets requirements
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-500">
                        Must be 8+ characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${passwordErrors.confirmPassword ? 'border-red-500' : passwordData.confirmPassword && !passwordErrors.confirmPassword ? 'border-emerald-500' : 'border-slate-700'
                          }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        title={showPasswords.confirm ? 'Hide password' : 'Show password'}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword ? (
                      <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {passwordErrors.confirmPassword}
                      </p>
                    ) : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? (
                      <p className="mt-1.5 text-sm text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Passwords match
                      </p>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 rounded-xl text-white font-medium hover:bg-indigo-400 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Password
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setShowPasswords({ current: false, new: false, confirm: false });
                      }}
                      className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                    <div>
                      <p className="text-white">Password</p>
                      <p className="text-sm text-slate-400">Last changed: Never</p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                    <div>
                      <p className="text-white">Two-Factor Auth</p>
                      <p className="text-sm text-slate-400">Add extra security</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-slate-500 text-sm">
                      Coming Soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white">Active Sessions</p>
                      <p className="text-sm text-slate-400">Manage your devices</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                      1 Active
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Preferences */}
            {/* <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                  <div>
                    <p className="text-white">Theme</p>
                    <p className="text-sm text-slate-400">Dark mode enabled</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white">Default Model</p>
                    <p className="text-sm text-slate-400">GPT-4o selected</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    GPT-4o
                  </span>
                </div>
              </div>
            </div> */}

            {/* Notifications */}
            {/* <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                  <div>
                    <p className="text-white">Email Updates</p>
                    <p className="text-sm text-slate-400">Product news & tips</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white">Generation Complete</p>
                    <p className="text-sm text-slate-400">Browser notifications</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-slate-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </main>

      {/* Avatar Edit Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsEditingAvatar(false);
              resetAvatarModal();
            }}
          />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Change Profile Picture
              </h3>
              <button
                onClick={() => {
                  setIsEditingAvatar(false);
                  resetAvatarModal();
                }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error/Success Message inside Modal */}
            {message && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="flex-1">{message.text}</span>
                <button
                  onClick={() => setMessage(null)}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Current Avatar Preview */}
            <div className="flex justify-center mb-6">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors shadow-lg"
                    title="Remove selected image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-700">
                  {getInitials(user.name)}
                </div>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Upload profile picture"
              />

              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-800'
                  }`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
                </div>

                <div>
                  <p className="text-white font-medium mb-1">
                    {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
                  </p>
                  <p className="text-sm text-slate-400">
                    or <span className="text-indigo-400 hover:text-indigo-300">browse</span> to choose
                  </p>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  JPEG, PNG, GIF, or WebP • Max 5MB
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {isAvatarLoading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Uploading...</span>
                  <span className="text-indigo-400">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUploadAvatar}
                disabled={isAvatarLoading || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 rounded-xl text-white font-medium hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAvatarLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>

              {user.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isAvatarLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  title="Remove current picture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setIsEditingAvatar(false);
                  resetAvatarModal();
                }}
                className="px-4 py-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

