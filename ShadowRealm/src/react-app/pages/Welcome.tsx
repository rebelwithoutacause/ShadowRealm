import { useAuth } from '@getmocha/users-service/react';
import { Navigate, Link } from 'react-router';
import { LogOut, Skull, Ghost, Zap } from 'lucide-react';

export default function Welcome() {
  const { user, logout, isPending } = useAuth();

  // Redirect to auth page if not authenticated
  if (!isPending && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-12 h-12 text-blood-red" />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-16 w-3 h-3 bg-blood-red rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-pale-white rounded-full opacity-40 flicker"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-blood-red rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 right-16 w-2 h-2 bg-pale-white rounded-full opacity-50 flicker"></div>
        <div className="absolute top-1/3 left-1/5 w-3 h-3 bg-blood-red rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pale-white rounded-full opacity-70 flicker" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="absolute top-8 right-8">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-2 px-4 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Escape</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-2xl">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="font-creepster text-5xl md:text-7xl text-pale-white mb-4 animate-pulse">
              Welcome...
            </h1>
            <p className="font-nosifer text-lg md:text-xl text-blood-red mb-6">
              You've entered the unknown
            </p>
            
            {user && (
              <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-dark-gray rounded-full flex items-center justify-center border-2 border-blood-red/50">
                    {user.google_user_data.picture ? (
                      <img 
                        src={user.google_user_data.picture} 
                        alt="Profile" 
                        className="w-14 h-14 rounded-full"
                      />
                    ) : (
                      <Ghost className="w-8 h-8 text-pale-white" />
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-medium text-pale-white mb-2">
                  {user.google_user_data.name || 'Lost Soul'}
                </h2>
                <p className="text-pale-white/70 text-sm">
                  {user.email}
                </p>
                <p className="text-pale-white/50 text-xs mt-2">
                  Joined the darkness: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              to="/explore"
              className="bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-4 px-6 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30 flex items-center justify-center space-x-2"
            >
              <Skull className="w-5 h-5" />
              <span>Horror Facts</span>
            </Link>
            
            <Link
              to="/game"
              className="bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-4 px-6 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30 flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Spirit Runner</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12">
            <p className="text-pale-white/40 text-sm font-nosifer">
              "In the shadows, we find our true selves..."
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 animate-bounce">
          <Ghost className="w-8 h-8 text-pale-white/30" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse">
          <Skull className="w-6 h-6 text-blood-red/50" />
        </div>
      </div>
    </div>
  );
}
