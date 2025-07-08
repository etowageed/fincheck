const { getLocaleFromIP } = require('./geoUtils');

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

const formatCurrency = async (amount, user) => {
  let locale = DEFAULT_LOCALE;
  let currency = DEFAULT_CURRENCY;

  try {
    if (user?.preferredLocale && user?.preferredCurrency) {
      locale = user.preferredLocale;
      currency = user.preferredCurrency;
    } else if (user?.lastKnownIP) {
      const geo = await getLocaleFromIP(user.lastKnownIP);
      locale = geo.locale;
      currency = geo.currency;
    }
  } catch (err) {
    console.error('🌍 Currency formatting fallback:', err.message);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

module.exports = formatCurrency;
