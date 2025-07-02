import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wrapper from './components/Wrapper';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import OAuthConsent from './pages/OAuthConsent';
import MailSettings from './pages/MailSettings';
import ReminderControl from './pages/ReminderControl';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Wrapper />}>
            <Route index element={<Home />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="dashboard">
              <Route index element={<Dashboard />} />
              <Route path="new-invoice" element={<CreateInvoice />} />
              <Route path="edit-invoice/:id" element={<CreateInvoice />} />
              <Route path="oauth-consent" element={<OAuthConsent/>} />
              <Route path="mail-settings" element={<MailSettings />} />
              <Route path="reminder-control" element={<ReminderControl />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;