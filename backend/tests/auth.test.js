jest.setTimeout(20000); // 20 seconds for full test suite
jest.mock('../utils/emails');
const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');

describe('Auth API', () => {
  it('should sign up a user', async () => {
    console.log('Signup test started');
    const res = await request(app).post('/api/v1/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
      confirmPassword: 'testpassword',
    });
    console.log('Signup response received', res.body);

    expect(res.statusCode).toBe(201);
  }, 15000);

  it('should not sign up with mismatched passwords', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({
      name: 'Bad User',
      email: 'bad@example.com',
      password: '12345678',
      confirmPassword: '87654321',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/passwords do not match/i);
  });

  it('should log in a user', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
