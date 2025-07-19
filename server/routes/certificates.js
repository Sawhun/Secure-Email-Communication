import express from 'express';
import forge from 'node-forge';
import { getDatabase } from '../database.js';
import { verifyCertificate, getCACertificate } from '../crypto/ca.js';

const router = express.Router();

router.get('/ca', (req, res) => {
  try {
    const caCert = getCACertificate();
    res.json({ certificate: caCert });
  } catch (error) {
    console.error('CA certificate error:', error);
    res.status(500).json({ error: 'Failed to get CA certificate' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    console.log('🔍 Certificate verification request received');
    const { certificate } = req.body;
    
    if (!certificate) {
      return res.status(400).json({ 
        error: 'Missing certificate',
        isValid: false,
        message: 'Certificate is required for verification'
      });
    }
    
    console.log('Certificate to verify (first 200 chars):', certificate.substring(0, 200));
    
    const isValid = verifyCertificate(certificate);
    console.log('Certificate verification result:', isValid);
    
    // Check if certificate is revoked
    const db = getDatabase();
    let revokedCert = null;
    
    try {
      const cert = forge.pki.certificateFromPem(certificate);
      revokedCert = await db.get(
        'SELECT * FROM crl_entries WHERE serial_number = ?',
        [cert.serialNumber]
      );
      console.log('Certificate revocation check completed');
    } catch (certError) {
      console.error('❌ Certificate parsing error:', certError);
      return res.json({
        isValid: false,
        isRevoked: false,
        message: `Certificate parsing failed: ${certError.message}`,
        error: certError.message
      });
    }
    
    res.json({
      isValid: isValid && !revokedCert,
      isRevoked: !!revokedCert,
      message: isValid && !revokedCert ? 'Certificate is valid' : 
               !isValid ? 'Certificate validation failed' : 
               'Certificate has been revoked',
      revokedAt: revokedCert?.revoked_at,
      reason: revokedCert?.reason
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify certificate',
      isValid: false,
      message: `Verification failed: ${error.message}`,
      details: error.message
    });
  }
});

router.post('/revoke', async (req, res) => {
  try {
    const { serialNumber, reason = 'unspecified' } = req.body;
    const db = getDatabase();
    
    // Add to CRL
    await db.run(
      'INSERT INTO crl_entries (serial_number, reason) VALUES (?, ?)',
      [serialNumber, reason]
    );
    
    // Update certificate status
    await db.run(
      'UPDATE certificates SET is_revoked = 1, revoked_at = CURRENT_TIMESTAMP, revocation_reason = ? WHERE serial_number = ?',
      [reason, serialNumber]
    );
    
    res.json({ message: 'Certificate revoked successfully' });
  } catch (error) {
    console.error('Certificate revocation error:', error);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

router.get('/crl', async (req, res) => {
  try {
    const db = getDatabase();
    const revokedCerts = await db.all('SELECT * FROM crl_entries ORDER BY revoked_at DESC');
    res.json(revokedCerts);
  } catch (error) {
    console.error('CRL error:', error);
    res.status(500).json({ error: 'Failed to get certificate revocation list' });
  }
});

export { router as certificateRoutes };