// tests/shared/integration/auth.test.js
const request = require('supertest');
const express = require('express');
const path = require('path');

// Import backend app setup
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require('../../backend/routes/authRoutes');
const userRoutes = require('../../backend/routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

describe('Authentication Integration', () => {
  it('should register and login a user', async () => {
    // Register
    const userData = {
      displayName: 'Integration Test User',
      email: 'integration@test.com',
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/user')
      .send(userData);

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post('/auth')
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
  });
});