// tests/shared/integration/mailConfig.test.js
const request = require('supertest');
const app = require('../../../backend/index');
const User = require('../../../backend/models/User');
const MailConfig = require('../../../backend/models/MailConfig');
const { encrypt, decrypt } = require('../../../backend/utils/encryption');

describe('Mail Configuration Integration', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create and authenticate user
    testUser = await User.create({
      displayName: 'Integration Test User',
      email: 'integration@test.com',
      password: await require('bcrypt').hash('password123', 10)
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/auth')
      .send({
        email: 'integration@test.com',
        password: 'password123'
      });

    authToken = loginResponse.body.accessToken;
  });

  it('should configure SMTP with encrypted password end-to-end', async () => {
    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: '587',
      secure: 'false',
      user: 'test@gmail.com',
      pass: 'secretAppPassword'
    };

    // Configure SMTP
    const response = await request(app)
      .post('/mail-config/smtp')
      .set('Authorization', `Bearer ${authToken}`)
      .send(smtpConfig)
      .expect(200);

    expect(response.body.configured).toBe(true);

    // Verify password is encrypted in database
    const mailConfig = await MailConfig.findOne({ userId: testUser._id });
    expect(mailConfig.pass).not.toBe('secretAppPassword');
    
    // Verify password can be decrypted
    const decryptedPassword = decrypt(mailConfig.pass);
    expect(decryptedPassword).toBe('secretAppPassword');
  });
});