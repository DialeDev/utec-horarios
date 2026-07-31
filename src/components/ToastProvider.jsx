import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  return (
    <Toaster
      position="bottom-right"
      theme={isDark ? 'dark' : 'light'}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      }}
    />
  );
}