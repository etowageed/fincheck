import { ref, watch } from "vue";

const isDark = ref(false);

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    updateTheme();
  };

  const setDarkMode = (value) => {
    isDark.value = value;
    updateTheme();
  };

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      isDark.value = true;
    } else {
      isDark.value = false;
    }
    updateTheme();
  };

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    initTheme,
  };
}
