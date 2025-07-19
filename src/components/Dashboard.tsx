import React, { useState, useEffect } from 'react';
import { Shield, Mail, Users, AlignCenterVertical as Certificate, CheckCircle, AlertTriangle, Key, Lock } from 'lucide-react';

interface DashboardProps {
  user: any;
  token: string;
}

export default function Dashboard({ user, token }: DashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    emailsSent: 0,
    emailsReceived: 0,
    certificatesActive: 0
  });
  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('http://localhost:3001/api/auth/users');
      const users = await usersResponse.json();
      
      // Fetch inbox
      const inboxResponse = await fetch(`http://localhost:3001/api/emails/inbox/${user.email}`);
      const inboxEmails = await inboxResponse.json();
      
      // Fetch sent emails
      const sentResponse = await fetch(`http://localhost:3001/api/emails/sent/${user.email}`);
      const sentEmails = await sentResponse.json();

      setStats({
        totalUsers: users.length,
        emailsSent: sentEmails.length,
        emailsReceived: inboxEmails.length,
        certificatesActive: users.length
      });

      setRecentEmails(inboxEmails.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const securityFeatures = [
    {
      icon: Key,
      title: 'RSA 2048-bit Encryption',
      description: 'Military-grade asymmetric encryption for all communications',
      status: 'active'
    },
    {
      icon: Certificate,
      title: 'X.509 Digital Certificates',
      description: 'PKI-based identity verification and authentication',
      status: 'active'
    },
    {
      icon: Shield,
      title: 'SHA-256 Digital Signatures',
      description: 'Cryptographic proof of message integrity and authenticity',
      status: 'active'
    },
    {
      icon: Lock,
      title: 'Hybrid AES+RSA Encryption',
      description: 'Optimized encryption combining speed and security',
      status: 'active'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}</h2>
            <p className="text-blue-100 text-lg">
              Your secure email environment is ready for cryptographic communication
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
            <Shield className="h-6 w-6" />
            <span className="font-medium">Certified User</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.emailsSent}</p>
            </div>
            <Mail className="h-12 w-12 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Received</p>
              <p className="text-3xl font-bold text-gray-900">{stats.emailsReceived}</p>
            </div>
            <Mail className="h-12 w-12 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.certificatesActive}</p>
            </div>
            <Certificate className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Security Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Email Activity</h3>
        {recentEmails.length > 0 ? (
          <div className="space-y-3">
            {recentEmails.map((email: any, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{email.subject}</p>
                    <p className="text-sm text-gray-600">From: {email.sender_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Encrypted</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No recent email activity</p>
          </div>
        )}
      </div>
    </div>
  );
}