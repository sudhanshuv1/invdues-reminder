// tests/backend/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables for testing
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock environment variables including ENCRYPTION_KEY
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.GOOGLE_EMAIL_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_EMAIL_CLIENT_SECRET = 'test-client-secret';
process.env.ENCRYPTION_KEY = '2122b6597e796c01ab9e142cb3af14a64d362aa0633b5b88bcf47792e639a3e3'; 