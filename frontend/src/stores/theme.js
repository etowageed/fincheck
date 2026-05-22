import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'plete-theme';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false);

  /**
   * Initialize theme from localStorage or OS preference.
   * Must be called after Pinia is installed but before app.mount().
   */
  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'dark' || stored === 'light') {
      isDark.value = stored === 'dark';
    } else {
      // First visit — respect OS preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    applyClass();

    // Listen for OS preference changes (only matters when no explicit choice is stored)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        isDark.value = e.matches;
        applyClass();
      }
    });
  }

  /**
   * Toggle between dark and light mode.
   */
  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
    applyClass();
  }

  /**
   * Explicitly set theme to 'dark' or 'light'.
   */
  function setTheme(mode) {
    isDark.value = mode === 'dark';
    localStorage.setItem(STORAGE_KEY, mode);
    applyClass();
  }

  /**
   * Apply or remove the .dark class on <html>.
   */
  function applyClass() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return { isDark, initTheme, toggle, setTheme };
});
