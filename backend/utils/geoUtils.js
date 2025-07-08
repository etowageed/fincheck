// utils/geoUtils.js
const axios = require('axios');

async function getLocaleFromIP(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      locale: response.data.languages?.split(',')[0] || 'en-US',
      currency: response.data.currency || 'USD',
    };
  } catch (err) {
    console.error(`🌍 Failed to detect locale for IP ${ip}:`, err.message);
    return {
      locale: 'en-US',
      currency: 'USD',
    };
  }
}

module.exports = { getLocaleFromIP };
