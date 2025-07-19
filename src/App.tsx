import React, { useState, useEffect } from 'react';
import { Shield, Mail, Key, AlignCenterVertical as Certificate, Users, Settings } from 'lucide-react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import EmailComposer from './components/EmailComposer';
import EmailViewer from './components/EmailViewer';
import CertificateManager from './components/CertificateManager';
import SecurityTests from './components/SecurityTests';

interface User {
  id: number;
  email: string;
  name: string;
  certificate: string;
  publicKey: string;
  privateKey?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Loading saved user:', {
          email: parsedUser.email,
          hasPrivateKey: false // Private key is not stored
        });
        
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData: any, authToken: string) => {
    console.log('App.handleLogin called with:', {
      email: userData.email,
      hasPrivateKey: false // Private key is not stored after login
    });
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ User logged in successfully');
  };

  const handleLogout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('dashboard');
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'compose', label: 'Compose Email', icon: Mail },
    { id: 'emails', label: 'View Emails', icon: Mail },
    { id: 'certificates', label: 'Certificates', icon: Certificate },
    { id: 'security', label: 'Security Tests', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'compose':
        return <EmailComposer user={user} token={token} />;
      case 'emails':
        return <EmailViewer user={user} token={token} />;
      case 'certificates':
        return <CertificateManager user={user} token={token} />;
      case 'security':
        return <SecurityTests user={user} token={token} />;
      default:
        return <Dashboard user={user} token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* <Shield className="h-8 w-8 text-blue-600" /> */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Secure Email PKI</h1>
                <p className="text-sm text-gray-500">Enterprise Cryptographic Communication</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Authenticated
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white rounded-lg shadow-sm p-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;