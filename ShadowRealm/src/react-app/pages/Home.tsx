import { useAuth } from '@getmocha/users-service/react';
import { Skull, Ghost, Eye, LogOut, Zap } from 'lucide-react';
import { Link } from 'react-router';

export default function Home() {
  const { user, redirectToLogin, isPending, logout } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-12 h-12 text-blood-red" />
        </div>
      </div>
    );
  }

  const handleEnterRealm = async () => {
    try {
      await redirectToLogin();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show authenticated user experience
  if (user) {
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
                Welcome to the dark realm
              </h1>
              <p className="font-nosifer text-lg md:text-xl text-blood-red mb-6">
                Your soul has been accepted
              </p>
              
              <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-dark-gray rounded-full flex items-center justify-center border-2 border-blood-red/50">
                    {user.google_user_data?.picture ? (
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
                  {user.google_user_data?.name || 'Dark Soul'}
                </h2>
                <p className="text-pale-white/70 text-sm">
                  {user.email}
                </p>
                <p className="text-pale-white/50 text-xs mt-2">
                  Joined the darkness: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
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

  // Show login prompt for unauthenticated users
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-12 w-2 h-2 bg-blood-red rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute top-1/4 right-16 w-1 h-1 bg-pale-white rounded-full opacity-50 flicker"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-blood-red rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 right-20 w-1 h-1 bg-pale-white rounded-full opacity-60 flicker"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-blood-red rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pale-white rounded-full opacity-80 flicker" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Main Content */}
        <div className="text-center max-w-4xl">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-form-bg/90 rounded-full border-2 border-blood-red/50 glow-red mb-6">
              <Skull className="w-12 h-12 text-blood-red animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-creepster text-6xl md:text-8xl lg:text-9xl text-pale-white mb-6 animate-pulse">
            Shadow Realm
          </h1>

          {/* Subtitle */}
          <p className="font-nosifer text-lg md:text-2xl text-blood-red mb-8 max-w-2xl mx-auto">
            Where darkness meets digital souls...
          </p>

          {/* Description */}
          <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 md:p-8 mb-8 max-w-2xl mx-auto">
            <p className="text-pale-white/80 text-base md:text-lg leading-relaxed mb-4">
              Step into a realm where the living and digital converge. 
              Here, in the shadows between reality and the void, 
              your journey into the unknown begins.
            </p>
            <div className="flex items-center justify-center space-x-4 text-pale-white/60">
              <Eye className="w-5 h-5 animate-pulse" />
              <span className="text-sm">The darkness watches</span>
              <Eye className="w-5 h-5 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-8">
            <button
              onClick={handleEnterRealm}
              className="bg-dark-gray hover:bg-blood-red text-pale-white font-bold py-4 px-8 md:py-6 md:px-12 rounded-lg text-lg md:text-xl transition-all duration-300 glow-red-hover shake border-2 border-blood-red/50 group"
            >
              <span className="flex items-center space-x-3">
                <Ghost className="w-6 h-6 group-hover:animate-bounce" />
                <span>Enter the Realm</span>
                <Ghost className="w-6 h-6 group-hover:animate-bounce" style={{ animationDelay: '0.2s' }} />
              </span>
            </button>
          </div>

          {/* Warning */}
          <div className="max-w-md mx-auto">
            <p className="text-pale-white/40 text-sm italic">
              "Those who enter may never return... 
              but those who don't will never truly live."
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-16 left-16 animate-bounce">
          <Ghost className="w-6 h-6 text-pale-white/20" />
        </div>
        <div className="absolute top-24 right-24 animate-pulse">
          <Skull className="w-8 h-8 text-blood-red/30" />
        </div>
        <div className="absolute top-1/3 left-8 animate-bounce" style={{ animationDelay: '1s' }}>
          <Eye className="w-5 h-5 text-pale-white/30" />
        </div>
      </div>
    </div>
  );
}
