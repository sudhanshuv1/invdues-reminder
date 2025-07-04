// tests/backend/utils/encryption.test.js
const { encrypt, decrypt } = require('../../../backend/utils/encryption');

describe('Encryption Utility', () => {
  const testPassword = 'mySecretPassword123!';
  
  it('should encrypt and decrypt a password correctly', () => {
    const encrypted = encrypt(testPassword);
    const decrypted = decrypt(encrypted);
    
    expect(encrypted).not.toBe(testPassword); // Should be different
    expect(decrypted).toBe(testPassword); // Should match original
  });
  
  it('should produce different encrypted values for same input', () => {
    const encrypted1 = encrypt(testPassword);
    const encrypted2 = encrypt(testPassword);
    
    // Should be different due to random IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to same value
    expect(decrypt(encrypted1)).toBe(testPassword);
    expect(decrypt(encrypted2)).toBe(testPassword);
  });
  
  it('should handle empty strings', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe('');
  });
  
  it('should handle special characters', () => {
    const specialPassword = 'p@ssw0rd!#$%^&*()';
    const encrypted = encrypt(specialPassword);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(specialPassword);
  });
  
  it('should throw error for invalid encrypted data', () => {
    expect(() => {
      decrypt('invalid-encrypted-data');
    }).toThrow();
  });
});