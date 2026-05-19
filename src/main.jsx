import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Indigo Violet
      light: '#c084fc',
      dark: '#6d28d9',
    },
    secondary: {
      main: '#10b981', // Emerald Mint
    },
    error: {
      main: '#f43f5e',
    },
    warning: {
      main: '#fbbf24',
    },
    success: {
      main: '#34d399',
    },
    background: {
      default: '#09090f', // Deep Space Night
      paper: '#111019', // Obsidian Velvet
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 900, letterSpacing: '-1.5px' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-1px' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.5px' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    subtitle1: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    subtitle2: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
