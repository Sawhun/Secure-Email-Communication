import React, { useState, useEffect } from 'react';
import { AlignCenterVertical as Certificate, Shield, AlertTriangle, CheckCircle, Users, Key } from 'lucide-react';

interface CertificateManagerProps {
  user: any;
  token: string;
}

export default function CertificateManager({ user, token }: CertificateManagerProps) {
  const [certificates, setCertificates] = useState([]);
  const [caCertificate, setCaCertificate] = useState('');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchCertificates();
    fetchCACertificate();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ca/certificates');
      const certs = await response.json();
      setCertificates(certs);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  const fetchCACertificate = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ca/certificate');
      const data = await response.json();
      setCaCertificate(data.certificate);
    } catch (error) {
      console.error('Failed to fetch CA certificate:', error);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!selectedCert || !revokeReason) return;

    try {
      const response = await fetch('http://localhost:3001/api/certificates/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: selectedCert.serial_number,
          reason: revokeReason
        })
      });

      if (response.ok) {
        await fetchCertificates();
        setShowRevoke(false);
        setSelectedCert(null);
        setRevokeReason('');
      }
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
    }
  };

  const formatCertificate = (cert: string) => {
    return cert.replace(/(.{64})/g, '$1\n').trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Certificate className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Certificate Management</h2>
            <p className="text-sm text-gray-600">Manage digital certificates and PKI infrastructure</p>
          </div>
        </div>

        {/* Your Certificate */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Your Certificate</h3>
              <p className="text-sm text-blue-800 mb-2">Issued to: {user.name} ({user.email})</p>
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-700 hover:text-blue-800">
                  View Certificate Details
                </summary>
                <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto">
                  {formatCertificate(user.certificate)}
                </pre>
              </details>
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Valid</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Certificates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All User Certificates</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {certificates.map((cert: any) => (
            <div key={cert.serial_number} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{cert.subject_name}</p>
                      <p className="text-sm text-gray-600">{cert.subject_email}</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Serial:</span> {cert.serial_number.substring(0, 16)}...
                    </div>
                    <div>
                      <span className="font-medium">Issued:</span> {new Date(cert.issued_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {new Date(cert.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {cert.is_revoked ? (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm font-medium">Revoked</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Valid</span>
                    </div>
                  )}
                  {!cert.is_revoked && cert.subject_email !== user.email && (
                    <button
                      onClick={() => {
                        setSelectedCert(cert);
                        setShowRevoke(true);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CA Certificate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Certificate Authority</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-3">
            Root CA certificate used to sign all user certificates in this system.
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer text-amber-700 hover:text-amber-800 font-medium">
              View CA Certificate
            </summary>
            {caCertificate && (
              <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto">
                {formatCertificate(caCertificate)}
              </pre>
            )}
          </details>
        </div>
      </div>

      {/* Revoke Certificate Modal */}
      {showRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revoke Certificate</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to revoke the certificate for <strong>{selectedCert?.subject_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revocation Reason
              </label>
              <select
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason...</option>
                <option value="compromised">Key Compromised</option>
                <option value="superseded">Certificate Superseded</option>
                <option value="cessation">Cessation of Operation</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRevoke(false);
                  setSelectedCert(null);
                  setRevokeReason('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeCertificate}
                disabled={!revokeReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Revoke Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}