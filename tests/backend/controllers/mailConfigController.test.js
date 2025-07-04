// tests/backend/controllers/mailConfigController.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');

// Import from backend
const mailConfigController = require('../../../backend/controllers/mailConfigController');
const User = require('../../../backend/models/User');
const MailConfig = require('../../../backend/models/MailConfig');
const { encrypt, decrypt } = require('../../../backend/utils/encryption'); // Add this import

const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'testUserId123' };
  next();
};

app.use('/mail-config', mockAuth);
app.get('/mail-config', mailConfigController.getMailConfig);
app.post('/mail-config/smtp', mailConfigController.configureSMTP);

describe('MailConfig Controller', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      displayName: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10)
    });
  });

  describe('GET /mail-config', () => {
    it('should return configured: false when no mail config exists', async () => {
      const response = await request(app)
        .get('/mail-config')
        .expect(200);

      expect(response.body).toEqual({ configured: false });
    });

    it('should return mail configuration when it exists', async () => {
      // Use encrypted password in test data
      const testPassword = 'testAppPassword';
      const encryptedPassword = encrypt(testPassword);
      
      const mailConfig = await MailConfig.create({
        userId: testUser._id,
        provider: 'smtp',
        user: 'test@example.com',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        pass: encryptedPassword, // Use encrypted password
        isConfigured: true
      });

      await User.findByIdAndUpdate(testUser._id, {
        mailConfig: mailConfig._id
      });

      const response = await request(app)
        .get('/mail-config')
        .expect(200);

      expect(response.body).toEqual({
        configured: true,
        provider: 'smtp',
        user: 'test@example.com'
      });
    });
  });

  describe('POST /mail-config/smtp', () => {
    it('should configure SMTP successfully and encrypt password', async () => {
      const smtpData = {
        host: 'smtp.gmail.com',
        port: '587',
        secure: 'false',
        user: 'test@gmail.com',
        pass: 'appPassword123'
      };

      const response = await request(app)
        .post('/mail-config/smtp')
        .send(smtpData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Email configured successfully',
        configured: true,
        provider: 'gmail',
        user: 'test@gmail.com'
      });

      // Verify password is encrypted and can be decrypted
      const mailConfig = await MailConfig.findOne({ userId: testUser._id });
      expect(mailConfig.pass).not.toBe('appPassword123'); // Should be encrypted
      
      // Test decryption
      const decryptedPassword = decrypt(mailConfig.pass);
      expect(decryptedPassword).toBe('appPassword123'); // Should decrypt correctly
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/mail-config/smtp')
        .send({
          host: 'smtp.gmail.com',
          port: '587'
          // missing user and pass
        })
        .expect(400);

      expect(response.body.message).toBe('All SMTP fields are required');
    });
  });
});