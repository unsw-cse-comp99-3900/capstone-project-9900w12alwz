import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';

const ThemeSwitcher = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const buttonRef = useRef(null); // A null ref used to remove focus

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
  }, []);

  const applyDarkTheme = () => {
    document.getElementById('theme-link').href = '/themes/viva-dark/theme.css';
    localStorage.setItem('theme', 'dark');
    setIsDarkTheme(true);
    buttonRef.current.blur(); // Remove focus
  };

  const applyLightTheme = () => {
    document.getElementById('theme-link').href = '/themes/viva-light/theme.css';
    localStorage.setItem('theme', 'light');
    setIsDarkTheme(false);
    buttonRef.current.blur(); // Remove focus
  };

  const toggleTheme = () => {
    if (isDarkTheme) {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }
  };

  return (
    <Button
      ref={buttonRef}
      icon={isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'}
      className="p-button-icon-only theme-switcher"
      onClick={toggleTheme}
    />
  );
};

export default ThemeSwitcher;
