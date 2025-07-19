import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';

// Simulated CA private key and certificate
let caPrivateKey;
let caCertificate;

// Initialize CA
export function initializeCA() {
  // Generate CA key pair
  const caKeyPair = forge.pki.rsa.generateKeyPair(2048);
  caPrivateKey = caKeyPair.privateKey;
  
  // Create CA certificate
  const caCert = forge.pki.createCertificate();
  caCert.publicKey = caKeyPair.publicKey;
  caCert.serialNumber = '01';
  caCert.validity.notBefore = new Date();
  caCert.validity.notAfter = new Date();
  caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);

  const caAttrs = [{
    name: 'commonName',
    value: 'Secure Email CA'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    name: 'stateOrProvinceName',
    value: 'CA'
  }, {
    name: 'organizationName',
    value: 'Secure Email PKI System'
  }];

  caCert.setSubject(caAttrs);
  caCert.setIssuer(caAttrs);
  caCert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }]);

  caCert.sign(caPrivateKey);
  caCertificate = caCert;

  console.log('🏛️ Certificate Authority initialized');
}

export function issueCertificate(publicKeyPem, email, name) {
  if (!caPrivateKey || !caCertificate) {
    initializeCA();
  }

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const cert = forge.pki.createCertificate();
  
  cert.publicKey = publicKey;
  cert.serialNumber = uuidv4().replace(/-/g, '');
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: name
  }, {
    name: 'emailAddress',
    value: email
  }, {
    name: 'organizationName',
    value: 'Secure Email System'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(caCertificate.subject.attributes);
  
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: false
  }, {
    name: 'keyUsage',
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: false,
    clientAuth: true,
    codeSigning: false,
    emailProtection: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 1, // email
      value: email
    }]
  }]);

  cert.sign(caPrivateKey);

  return {
    certificate: forge.pki.certificateToPem(cert),
    serialNumber: cert.serialNumber,
    expiresAt: cert.validity.notAfter
  };
}

export function verifyCertificate(certificatePem) {
  try {
    console.log('🔍 Starting certificate verification...');
    
    if (!caCertificate) {
      console.log('⚠️ CA certificate not found, initializing...');
      initializeCA();
    }

    if (!certificatePem || typeof certificatePem !== 'string') {
      console.error('❌ Invalid certificate format');
      return false;
    }

    if (!certificatePem.includes('-----BEGIN CERTIFICATE-----')) {
      console.error('❌ Certificate missing PEM headers');
      return false;
    }

    console.log('Certificate PEM format check passed');

    const cert = forge.pki.certificateFromPem(certificatePem);
    console.log('✅ Certificate parsed successfully');
    console.log('Certificate subject:', cert.subject.getField('CN')?.value || 'Unknown');
    console.log('Certificate serial:', cert.serialNumber);
    
    const caStore = forge.pki.createCaStore([caCertificate]);
    console.log('✅ CA store created');
    
    const isValid = forge.pki.verifyCertificateChain(caStore, [cert]);
    console.log('✅ Certificate chain verification result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Certificate verification failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

export function getCACertificate() {
  if (!caCertificate) {
    initializeCA();
  }
  return forge.pki.certificateToPem(caCertificate);
}

export function revokeCertificate(serialNumber, reason = 'unspecified') {
  // In a real implementation, this would add to CRL
  console.log(`📜 Certificate ${serialNumber} revoked: ${reason}`);
  return true;
}