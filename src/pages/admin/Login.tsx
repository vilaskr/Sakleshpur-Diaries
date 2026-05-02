import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/internal-error') {
        setError('Login pop-up was blocked or cancelled. If you are in a preview iframe, please open the app in a new tab using the button in the top right to sign in.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] px-6">
      <div className="bg-white p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2">Admin Portal</h1>
        <p className="text-gray-500 text-center mb-8">Sign in to manage the application.</p>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-100">
            <p className="font-bold mb-1">Notice:</p>
            {error}
            <button 
              onClick={handleOpenInNewTab}
              className="mt-3 w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Open in New Tab
            </button>
          </div>
        )}
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-brand-green text-white py-4 rounded-xl font-bold hover:bg-brand-green/90 transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <p className="mt-8 text-center text-gray-400 text-xs">
          If the login popup doesn't appear, try opening the app in a new tab.
        </p>
      </div>
    </div>
  );
}

