import React, { useState, useEffect } from 'react';
import { 
  useGetMailConfigQuery, 
  useConfigureGmailMutation, 
  useConfigureSMTPMutation, 
  useRemoveMailConfigMutation 
} from '../features/apiSlice';
import DashboardLayout from '../components/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';

const MailSettings = () => {
  const { data: mailConfig, isLoading, refetch } = useGetMailConfigQuery();
  const [configureGmail] = useConfigureGmailMutation();
  const [configureSMTP] = useConfigureSMTPMutation();
  const [removeConfig] = useRemoveMailConfigMutation();
  const [showPassword, setShowPassword] = useState(false);
  
  const [showSMTPForm, setShowSMTPForm] = useState(false);
  const [smtpData, setSMTPData] = useState({
    host: '',
    port: '587',
    secure: 'true',
    user: '',
    pass: ''
  });

  const handleGmailConnect = () => {
    try {
      const redirectUri = `${window.location.origin}/dashboard/mail-settings`;
      const scope = 'https://www.googleapis.com/auth/gmail.send';
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      console.log('Gmail connect - Client ID:', clientId);
      console.log('Gmail connect - Redirect URI:', redirectUri);
      
      if (!clientId) {
        alert('Google Client ID is not configured. Please check your environment variables.');
        return;
      }
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      
      console.log('Redirecting to Gmail OAuth:', googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Error initiating Gmail OAuth:', error);
      alert('Error starting Gmail connection. Please try again.');
    }
  };

  const handleSMTPSubmit = async (e) => {
    e.preventDefault();
    try {
      await configureSMTP(smtpData).unwrap();
      alert('SMTP configured successfully!');
      setShowSMTPForm(false);
      refetch();
    } catch (error) {
      alert('Error configuring SMTP: ' + error.message);
    }
  };

  const handleRemoveConfig = async () => {
    if (window.confirm('Are you sure you want to remove mail configuration?')) {
      try {
        await removeConfig().unwrap();
        alert('Mail configuration removed successfully!');
        refetch();
      } catch (error) {
        alert('Error removing configuration: ' + error.message);
      }
    }
  };

  const closeSMTPForm = () => {
    setShowSMTPForm(false);
    setSMTPData({
      host: '',
      port: '587',
      secure: 'true',
      user: '',
      pass: ''
    });
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      configureGmail({ code }).unwrap()
        .then(() => {
          alert('Gmail configured successfully!');
          refetch();
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          alert('Error configuring Gmail: ' + error.message);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">Email Settings</h1>
          <p className="dark:text-gray-300 text-gray-600 mt-1">Configure your email service for sending reminders</p>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto dark:bg-gray-800 dark:text-gray-200">
            {mailConfig?.configured ? (
              <div className="flex justify-between bg-green-50 dark:bg-green-900 dark:border dark:border-green-800 dark:rounded-lg border border-green-200 p-4 rounded-lg">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold dark:text-gray-300 text-green-800">Mail Configured</h2>
                  <p className="text-green-600 dark:text-gray-200">
                    Provider: {mailConfig.provider} <br />
                    Email: {mailConfig.user}
                  </p>
                </div>
                
                <button
                  onClick={handleRemoveConfig}
                  className="mt-9 mb-1 bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 dark:text-gray-200 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove Configuration
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-gray-800 dark:border-gray-600 border border-blue-200 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3">Configure Mail Service</h2>
                  <p className="mb-4">Choose how you want to send reminder emails:</p>
                  
                  <div className="space-y-3 flex">
                    {/* Hide gmail configuration for now */}
                    <button
                      onClick={handleGmailConnect}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 hidden"
                    >
                      Connect Gmail (Recommended)
                    </button>
                    
                    <button
                      onClick={() => setShowSMTPForm(true)}
                      className="w-1/2 bg-white active:bg-gray-200 m-auto border border-lime-300 hover:shadow-lime-300 hover:shadow-sm dark:text-white dark:bg-gray-600 dark:active:bg-gray-800 text-gray-800 py-2 px-4 rounded"
                    >
                      Configure Custom SMTP
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SMTP Form Popup Modal */}
        {showSMTPForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">SMTP Configuration</h3>
                <button
                  onClick={closeSMTPForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSMTPSubmit} className="p-4 dark:bg-gray-800 dark:text-gray-200 space-y-4">
                <input
                  type="text"
                  placeholder="SMTP Host (e.g., smtp.gmail.com)"
                  value={smtpData.host}
                  onChange={(e) => setSMTPData({...smtpData, host: e.target.value})}
                  className="w-full p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border rounded"
                  required
                />
                
                <input
                  type="number"
                  placeholder="Port (587 for TLS, 465 for SSL)"
                  value={smtpData.port}
                  onChange={(e) => setSMTPData({...smtpData, port: e.target.value})}
                  className="w-full p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border rounded"
                  required
                />
                
                <select
                  value={smtpData.secure}
                  onChange={(e) => setSMTPData({...smtpData, secure: e.target.value})}
                  className="w-full p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border rounded"
                >
                  <option value="true">SSL (Port 465)</option>
                  <option value="false">TLS (Port 587)</option>
                </select>
                
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={smtpData.user}
                  onChange={(e) => setSMTPData({...smtpData, user: e.target.value})}
                  className="w-full p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border rounded"
                  required
                />
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="App Password (not your regular password)"
                    value={smtpData.pass}
                    onChange={(e) => setSMTPData({...smtpData, pass: e.target.value})}
                    className="w-full p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border rounded pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Save SMTP Configuration
                  </button>
                  <button
                    type="button"
                    onClick={closeSMTPForm}
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MailSettings;