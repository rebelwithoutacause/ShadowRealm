import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Navigate } from 'react-router';
import { Skull } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('The darkness rejected your soul... please try again.');
      } finally {
        // Processing complete
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken]);

  // Redirect to home page if authentication successful
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to auth page if there's an error
  if (error) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Skull className="w-16 h-16 text-blood-red mx-auto animate-pulse" />
        </div>
        <h2 className="font-creepster text-2xl text-pale-white mb-4">
          Entering the Shadow Realm...
        </h2>
        <p className="text-pale-white/70 font-nosifer text-sm">
          The spirits are verifying your soul
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blood-red rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blood-red rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blood-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
