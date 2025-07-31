import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  useGetUserProfileQuery, 
  useUpdateUserProfileMutation, 
  useChangePasswordMutation,
  useDeleteUserAccountMutation,
  useGetUserStatsQuery,
  useGetCurrentSubscriptionQuery 
} from '../features/apiSlice';
import { selectCurrentUser } from '../features/authSlice';
import { logout as logoutAction } from '../features/authSlice';
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState([]);
  const [profileForm, setProfileForm] = useState({ displayName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API hooks
  const { data: userProfile, isLoading: loadingProfile, error: profileError, refetch: refetchProfile } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });
  const { data: userStats, isLoading: loadingStats, error: statsError, refetch: refetchStats } = useGetUserStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });
  const { data: subscriptionData, isLoading: loadingSubscription } = useGetCurrentSubscriptionQuery();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateUserProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: deletingAccount }] = useDeleteUserAccountMutation();

  // Initialize form data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || '',
        email: userProfile.email || ''
      });
    }
  }, [userProfile]);

  // Refetch data on component mount
  useEffect(() => {
    refetchProfile();
    refetchStats();
  }, [refetchProfile, refetchStats]);

  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm).unwrap();
      addNotification('Profile updated successfully!');
      // Refetch both profile and stats after successful update
      refetchProfile();
      refetchStats();
    } catch (error) {
      addNotification(`Failed to update profile: ${error.data?.message || 'Unknown error'}`, 'error');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }).unwrap();
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addNotification('Password changed successfully!');
    } catch (error) {
      addNotification(`Failed to change password: ${error.data?.message || 'Invalid current password'}`, 'error');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addNotification('Please type "DELETE" to confirm', 'error');
      return;
    }

    try {
      await deleteAccount().unwrap();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      addNotification(`Failed to delete account: ${error.data?.message || 'Unknown error'}`, 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loadingProfile || loadingStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (profileError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load your profile information.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-lg border-l-4 ${
                  notification.type === 'error' 
                    ? 'bg-red-50 border-red-500 text-red-700' 
                    : 'bg-green-50 border-green-500 text-green-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{notification.message}</span>
                  <button onClick={() => removeNotification(notification.id)} className="ml-4 text-lg font-bold">×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-6 space-y-6 overflow-scroll">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30">
              {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{userProfile?.displayName || 'User'}</h1>
              <p className="text-blue-100 text-lg">{userProfile?.email}</p>
              <p className="text-blue-200 text-sm">
                Member since {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats?.totalInvoices ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{(userStats?.totalRevenue ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mail Config</p>
                <p className={`text-2xl font-bold ${userStats?.hasMailConfig ? 'text-green-600' : 'text-red-600'}`}>
                  {userStats?.hasMailConfig ? 'Active' : 'NA'}
                </p>
              </div>
              <div className={`p-3 ${userStats?.hasMailConfig ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg`}>
                <svg className={`w-8 h-8 ${userStats?.hasMailConfig ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Plan</p>
                <p className={`text-2xl font-bold ${
                  subscriptionData?.plan === 'free' ? 'text-gray-600' :
                  subscriptionData?.plan === 'pro' ? 'text-blue-600' :
                  'text-purple-600'
                }`}>
                  {subscriptionData?.plan ? subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1) : 'Free'}
                </p>
              </div>
              <div className={`p-3 ${
                subscriptionData?.plan === 'free' ? 'bg-gray-100 dark:bg-gray-900' :
                subscriptionData?.plan === 'pro' ? 'bg-blue-100 dark:bg-blue-900' :
                'bg-purple-100 dark:bg-purple-900'
              } rounded-lg`}>
                <svg className={`w-8 h-8 ${
                  subscriptionData?.plan === 'free' ? 'text-gray-600 dark:text-gray-400' :
                  subscriptionData?.plan === 'pro' ? 'text-blue-600 dark:text-blue-400' :
                  'text-purple-600 dark:text-purple-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {['profile', 'security', 'subscription', 'preferences'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Profile Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
                      placeholder="Enter your display name"
                      required
                    />
                  </div>
                    {!userProfile?.googleId && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                        </label>
                        <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
                        placeholder="Enter your email address"
                        required
                        />
                    </div>
                    )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    {updatingProfile && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{updatingProfile ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Password Change Section */}
                {!userProfile?.googleId && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Enter new password"
                            minLength={6}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Confirm new password"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          {changingPassword && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Account Deletion Section */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4">
                    This action cannot be undone. This will permanently delete your account and all associated data.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Subscription Management
                </h3>
                
                {loadingSubscription ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Plan Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {subscriptionData?.plan ? subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1) : 'Free'} Plan
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {subscriptionData?.status === 'active' && subscriptionData?.currentPeriodEnd && (
                              `Active until ${new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}`
                            )}
                            {subscriptionData?.status === 'trialing' && subscriptionData?.trialEnd && (
                              `Trial ends on ${new Date(subscriptionData.trialEnd).toLocaleDateString()}`
                            )}
                            {(!subscriptionData || subscriptionData?.plan === 'free') && 'Free plan with basic features'}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscriptionData?.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          subscriptionData?.status === 'trialing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {subscriptionData?.status ? subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1) : 'Free'}
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    {subscriptionData && subscriptionData.plan !== 'free' && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Billing Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Billing Period</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {subscriptionData.billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}
                            </p>
                          </div>
                          {subscriptionData.amount && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                ₹{subscriptionData.amount / 100} / {subscriptionData.billingPeriod === 'monthly' ? 'month' : 'year'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions</h4>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => navigate('/pricing')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          {(!subscriptionData || subscriptionData.plan === 'free') ? 'Upgrade Plan' : 'Change Plan'}
                        </button>
                        
                        {subscriptionData && subscriptionData.plan !== 'free' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
                                // TODO: Implement cancel subscription
                                toast.info('Subscription cancellation will be available soon');
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Cancel Subscription
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Mail Settings', icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/dashboard/mail-settings', color: 'blue' },
                    { title: 'Reminders', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', path: '/dashboard/reminder-control', color: 'green' },
                    { title: 'New Invoice', icon: 'M12 4v16m8-8H4', path: '/dashboard/new-invoice', color: 'purple' },
                    { title: 'View Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', path: '/pricing', color: 'yellow' }
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className={`p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 hover:bg-${item.color}-100 dark:hover:bg-${item.color}-900/30 border border-${item.color}-200 dark:border-${item.color}-800 rounded-lg transition-colors duration-200 group`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg`}>
                          <svg className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300`}>
                          {item.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Confirm Account Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Type <strong>DELETE</strong> to confirm permanent deletion of your account and all data.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 mb-4"
                placeholder="Type DELETE"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {deletingAccount && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{deletingAccount ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
