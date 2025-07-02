import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.jsx';
import { selectCurrentTheme } from './features/themeSlice';

// Theme initializer component
const ThemeInitializer = ({ children }) => {
  const theme = useSelector(selectCurrentTheme);
  
  useEffect(() => {
    console.log('Theme changed to:', theme); // Debug log
    // Apply theme on app startup and theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return children;
};

// Initialize theme on first load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initialTheme = savedTheme || systemTheme;
  
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme before React renders
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeInitializer>
        <App />
      </ThemeInitializer>
    </Provider>
  </StrictMode>
);