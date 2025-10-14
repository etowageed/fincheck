const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

const formatCurrency = (amount, user) => {
  let locale = DEFAULT_LOCALE;
  let currency = DEFAULT_CURRENCY;

  // Prioritize user's stored preferences
  if (user?.preferredLocale && user?.preferredCurrency) {
    locale = user.preferredLocale;
    currency = user.preferredCurrency;
  }
  // Removed IP lookup logic.

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

module.exports = formatCurrency;
