import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wrapper from './components/Wrapper';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import OAuthConsent from './pages/OAuthConsent';
import MailSettings from './pages/MailSettings';
import ReminderControl from './pages/ReminderControl';
import EmailTemplateSettings from './pages/EmailTemplateSettings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Wrapper />}>
            <Route index element={<Home />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={
              <a
                href="https://sudhanshu-tiwari.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                sudhanshu-tiwari.netlify.app
              </a>
            } />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
            </Route>
            
            <Route path="dashboard/new-invoice" element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/edit-invoice/:id" element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/oauth-consent" element={
              <ProtectedRoute>
                <OAuthConsent />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/mail-settings" element={
              <ProtectedRoute>
                <MailSettings />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/reminder-control" element={
              <ProtectedRoute>
                <ReminderControl />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/email-templates" element={
              <ProtectedRoute>
                <EmailTemplateSettings />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;