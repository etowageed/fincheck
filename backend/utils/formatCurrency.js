const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

// Added showDecimals parameter for flexibility in formatting.
const formatCurrency = (amount, user, showDecimals = false) => {
  let locale = DEFAULT_LOCALE;
  let currency = DEFAULT_CURRENCY;

  // Prioritize user's stored preferences
  if (user?.preferredLocale && user?.preferredCurrency) {
    locale = user.preferredLocale;
    currency = user.preferredCurrency;
  }
  // Removed IP lookup logic.

  const options = {
    style: 'currency',
    currency,
  };

  if (showDecimals) {
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 2;
  } else {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  // If amount is not a number, convert 0 to get the symbol correctly formatted.
  const value = typeof amount === 'number' ? amount : 0;

  return new Intl.NumberFormat(locale, options).format(value);
};

module.exports = formatCurrency;
