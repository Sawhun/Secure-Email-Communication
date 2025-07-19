import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Key } from 'lucide-react';

interface AuthFormProps {
  onLogin: (user: any, token: string) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPrivateKeyDownload, setShowPrivateKeyDownload] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadPrivateKey = () => {
    if (!registrationData?.privateKey) return;
    
    const element = document.createElement('a');
    const file = new Blob([registrationData.privateKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${registrationData.email}-private-key.pem`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleContinueToLogin = () => {
    setShowPrivateKeyDownload(false);
    setRegistrationData(null);
    setIsLogin(true);
    setFormData({ email: '', name: '', password: '' });
    setError('');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log(`Attempting ${isLogin ? 'login' : 'registration'} for:`, formData.email);
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Auth response:', {
        success: response.ok,
        hasUser: !!data.user,
        hasToken: !!data.token,
        hasPrivateKey: !!data.user?.privateKey,
        privateKeyLength: data.user?.privateKey?.length || 0
      });

      if (response.ok) {
        if (isLogin) {
          // For login, don't include private key in user data
          const userWithoutPrivateKey = { ...data.user };
          delete userWithoutPrivateKey.privateKey;
          console.log('✅ Login successful');
          onLogin(userWithoutPrivateKey, data.token);
        } else {
          // For registration, show private key download
          if (!data.user.privateKey) {
            console.error('❌ Private key missing from registration response');
            setError('Registration failed: Private key not generated');
            return;
          }
          console.log('✅ Registration successful, showing private key download');
          setRegistrationData(data.user);
          setShowPrivateKeyDownload(true);
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Network error during auth:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (showPrivateKeyDownload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Registration Successful!</h1>
            <p className="text-gray-600 mt-2">
              Your account has been created and your private key is ready for download
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important Security Notice:</p>
                  <ul className="space-y-1">
                    <li>• Download and save your private key securely</li>
                    <li>• You will need this key to send encrypted emails</li>
                    <li>• Keep it safe - it cannot be recovered if lost</li>
                    <li>• Never share your private key with anyone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Account created for: <strong>{registrationData?.name}</strong> ({registrationData?.email})
                </p>
              </div>

              <button
                onClick={downloadPrivateKey}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Download Private Key</span>
                </div>
              </button>

              <button
                onClick={handleContinueToLogin}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Secure Email PKI Communication</h1>
          <p className="text-gray-600 mt-2">
            Enterprise-grade cryptographic email communication
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-l-lg transition-colors ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-r-lg transition-colors ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </div>
              )}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Registration</p>
                  <p className="mt-1">
                    A new RSA key pair and digital certificate will be generated for your account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}