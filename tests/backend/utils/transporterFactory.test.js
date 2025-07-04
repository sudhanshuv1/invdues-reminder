// tests/backend/utils/transporterFactory.test.js
const { makeTransport } = require('../../../backend/utils/transporterFactory');
const User = require('../../../backend/models/User');
const MailConfig = require('../../../backend/models/MailConfig');
const { encrypt } = require('../../../backend/utils/encryption');
const { createTestUser, createTestMailConfig } = require('../../utils/testHelpers');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

describe('Transporter Factory', () => {
  let testUser, testMailConfig;

  beforeEach(async () => {
    testUser = await createTestUser(User);
  });

  it('should create SMTP transporter with decrypted password', async () => {
    const testPassword = 'myAppPassword123';
    
    testMailConfig = await createTestMailConfig(MailConfig, testUser._id, {
      pass: encrypt(testPassword) // Ensure password is encrypted
    });

    await User.findByIdAndUpdate(testUser._id, {
      mailConfig: testMailConfig._id
    });

    const transporter = await makeTransport(testUser._id);
    
    expect(transporter).toBeDefined();
    // Verify that the transporter was created (mocked)
    expect(require('nodemailer').createTransporter).toHaveBeenCalled();
  });

  it('should handle Gmail OAuth configuration', async () => {
    testMailConfig = await MailConfig.create({
      userId: testUser._id,
      provider: 'gmail',
      user: 'test@gmail.com',
      refreshToken: 'test-refresh-token',
      accessToken: 'test-access-token',
      isConfigured: true
    });

    await User.findByIdAndUpdate(testUser._id, {
      mailConfig: testMailConfig._id
    });

    const transporter = await makeTransport(testUser._id);
    
    expect(transporter).toBeDefined();
  });

  it('should throw error when mail config not found', async () => {
    await expect(makeTransport(testUser._id)).rejects.toThrow(
      'Mail configuration not found or not configured'
    );
  });
});