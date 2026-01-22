// src/utils/polar.js
const { Polar } = require('@polar-sh/sdk');

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox', // Use sandbox for testing
});

module.exports = polar;
