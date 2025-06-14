import { useLocation, useNavigate } from 'react-router-dom';
import { useOauthLoginCallbackMutation } from '../features/apiSlice';

const OAuthConsent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [oauthLoginCallback] = useOauthLoginCallbackMutation();

  // Extract query parameters (redirect_uri and state)
  const queryParams = new URLSearchParams(location.search);
  const redirect_uri = queryParams.get('redirect_uri');
  const state = queryParams.get('state');

  if (!redirect_uri) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Missing redirect URI information.</p>
      </div>
    );
  }

  // Handler when user clicks "Continue"
  const handleAllow = async () => {
    try {
      // Call the OAuth login callback via your API slice.
      // The body includes the authenticated user's ID, the redirect_uri, and state.
      const result = await oauthLoginCallback({ redirect_uri, state }).unwrap();
      // The server is expected to return JSON { redirect: "<final redirect URL>" }
      if (result.redirect) {
        window.location.href = result.redirect;
      } else {
        alert('No redirect URL received from the server.');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Error during authorization. Please try again.');
    }
  };

  // Handler when user clicks "No"
  const handleDeny = () => {
    // Simply redirect to a safe route (e.g., Dashboard)
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Authorization Request</h2>
        <p className="mb-6">Do you allow Zapier to access your account?</p>
        <div className="flex justify-around">
          <button
            onClick={handleAllow}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Continue
          </button>
          <button
            onClick={handleDeny}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
