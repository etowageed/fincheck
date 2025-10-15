import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

/**
 * Provides currency and locale for formatting financial amounts.
 * This function handles the logic for retrieving the user's preferred
 * settings and applying the correct Intl.NumberFormat based on those settings.
 */
export function useCurrencyFormatter() {
  const authStore = useAuthStore();

  const preferredCurrency = computed(
    () => authStore.userProfile?.preferredCurrency || "USD"
  );
  const preferredLocale = computed(
    () => authStore.userProfile?.preferredLocale || "en-US"
  );

  /**
   * Formats an amount using the user's preferred currency and locale.
   * @param {number} value The numerical amount to format.
   * @param {boolean} showDecimals Whether to display cents/fractions (default is false for dashboard summaries).
   * @returns {string} The formatted currency string (e.g., "$1,200" or "₦1,200.00").
   */
  const formatCurrency = (value, showDecimals = false) => {
    const currency = preferredCurrency.value;
    const locale = preferredLocale.value;

    if (typeof value !== "number") return "0.00";

    const options = {
      style: "currency",
      currency: currency,
      // 💰 FIX: Use 'narrowSymbol' to prioritize the specific symbol
      // and reduce ambiguity across different locales.
      currencyDisplay: "narrowSymbol",
    };

    // Apply decimal rules based on the passed flag
    if (showDecimals) {
      options.maximumFractionDigits = 2;
      options.minimumFractionDigits = 2;
    } else {
      options.maximumFractionDigits = 0;
      options.minimumFractionDigits = 0;
    }

    return Math.abs(value).toLocaleString(locale, options);
  };

  /**
   * Formats a date using the user's preferred locale.
   * @param {Date|string} dateValue The date to format.
   * @param {string} dateStyle Style for date part ('short', 'medium', 'long').
   * @returns {string} The formatted date string.
   */
  const formatDate = (dateValue, dateStyle = "short") => {
    if (!dateValue) return "No date";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString(preferredLocale.value, {
      month: dateStyle,
      day: "numeric",
      year: "numeric",
    });
  };

  return {
    preferredCurrency,
    preferredLocale,
    formatCurrency,
    formatDate,
  };
}
