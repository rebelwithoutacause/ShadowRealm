import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Navigate, useNavigate } from 'react-router';
import { Eye, EyeOff, Skull } from 'lucide-react';

export default function Auth() {
  const { user, redirectToLogin, isPending } = useAuth();
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/welcome" replace />;
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (authMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = "The spirits demand your email address...";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "The spirits reject this malformed email...";
      }

      if (!formData.password) {
        newErrors.password = "Your password is too weak for the darkness...";
      } else if (formData.password.length < 6) {
        newErrors.password = "Your soul requires at least 6 characters...";
      }

      if (!isLogin) {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "The void demands confirmation of your secret...";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not align… the void has noticed.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages
        const errorMessage = data.error || "The darkness rejects your presence... try again.";
        setErrors({ general: errorMessage });
        return;
      }

      if (data.success) {
        // Successful authentication - redirect to welcome page
        navigate('/welcome');
      } else {
        setErrors({ general: "Authentication failed. Please try again." });
      }
    } catch (error) {
      console.error('Auth failed:', error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await redirectToLogin();
    } catch (error) {
      console.error('Google login failed:', error);
      setErrors({ general: "The darkness rejects your presence... try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMethod === 'email') {
      await handleEmailAuth();
    } else {
      await handleGoogleAuth();
    }

    // Add shake animation to form if there are errors
    if (Object.keys(errors).length > 0) {
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('error-shake');
      setTimeout(() => form.classList.remove('error-shake'), 300);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Also clear general error when user starts making changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blood-red rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-pale-white rounded-full opacity-50 flicker"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-blood-red rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-40 right-10 w-1 h-1 bg-pale-white rounded-full opacity-60 flicker"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blood-red rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-creepster text-4xl md:text-5xl text-pale-white mb-2 animate-pulse">
              Shadow Realm
            </h1>
            <p className="font-nosifer text-sm text-pale-white/70">
              Enter... if you dare
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 md:p-8">
            {/* Auth Method Selection */}
            <div className="flex mb-6 bg-dark-gray rounded-lg p-1">
              <button
                onClick={() => setAuthMethod('google')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  authMethod === 'google' 
                    ? 'bg-blood-red text-pale-white shadow-md' 
                    : 'text-pale-white/70 hover:text-pale-white glow-red-hover'
                }`}
              >
                Google Soul
              </button>
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  authMethod === 'email' 
                    ? 'bg-blood-red text-pale-white shadow-md' 
                    : 'text-pale-white/70 hover:text-pale-white glow-red-hover'
                }`}
              >
                Email Darkness
              </button>
            </div>

            {/* Login/Register Toggle (only for email) */}
            {authMethod === 'email' && (
              <div className="flex mb-6 bg-dark-gray rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                    isLogin 
                      ? 'bg-blood-red text-pale-white shadow-md' 
                      : 'text-pale-white/70 hover:text-pale-white glow-red-hover'
                  }`}
                >
                  Enter the Realm
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                    !isLogin 
                      ? 'bg-blood-red text-pale-white shadow-md' 
                      : 'text-pale-white/70 hover:text-pale-white glow-red-hover'
                  }`}
                >
                  Join the Darkness
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Google Auth Notice */}
              {authMethod === 'google' && (
                <div className="bg-dark-gray/50 border border-blood-red/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-pale-white/60 text-center">
                    The realm will redirect you to Google for authentication
                  </p>
                </div>
              )}

              {/* Email and Password fields (only show for email auth) */}
              {authMethod === 'email' && (
                <>
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-pale-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-3 bg-dark-gray border rounded-lg text-pale-white placeholder-pale-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-blood-red focus:ring-blood-red glow-red' 
                          : 'border-pale-white/20 focus:border-blood-red focus:ring-blood-red/30'
                      }`}
                      placeholder="your.soul@darkness.com"
                      required
                      disabled={isLoading}
                      autoComplete={isLogin ? "email" : "email"}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-blood-red fade-in shake">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-pale-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-3 bg-dark-gray border rounded-lg text-pale-white placeholder-pale-white/50 focus:outline-none focus:ring-2 transition-all pr-10 ${
                          errors.password 
                            ? 'border-blood-red focus:ring-blood-red glow-red' 
                            : 'border-pale-white/20 focus:border-blood-red focus:ring-blood-red/30'
                        }`}
                        placeholder="Your darkest secret..."
                        required
                        minLength={6}
                        disabled={isLoading}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pale-white/50 hover:text-pale-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-blood-red fade-in shake">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password (Register only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-pale-white mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-3 bg-dark-gray border rounded-lg text-pale-white placeholder-pale-white/50 focus:outline-none focus:ring-2 transition-all ${
                          errors.confirmPassword 
                            ? 'border-blood-red focus:ring-blood-red glow-red' 
                            : 'border-pale-white/20 focus:border-blood-red focus:ring-blood-red/30'
                        }`}
                        placeholder="Confirm your darkness..."
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-blood-red fade-in shake">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="bg-blood-red/10 border border-blood-red/30 rounded-lg p-3">
                  <p className="text-sm text-blood-red fade-in">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-3 px-4 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Skull className="w-5 h-5 mr-2 animate-spin" />
                    Summoning the darkness...
                  </div>
                ) : authMethod === 'google' ? (
                  <>Continue with Google</>
                ) : isLogin ? (
                  <>Enter the Realm</>
                ) : (
                  <>Join the Darkness</>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-pale-white/50">
                By entering, you agree to surrender your soul to the void
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
