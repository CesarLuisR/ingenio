import { createGlobalStyle, type DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  mode: 'light',
  colors: {
    background: '#f8fafc',
    card: '#ffffff',
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      tertiary: '#94a3b8',
    },
    border: '#e2e8f0',
    accent: {
      primary: '#0066ff',
      hover: '#0052cc',
      text: '#ffffff',
    },
    status: {
      ok: '#16a34a',
      warning: '#eab308',
      critical: '#dc2626',
      neutral: '#94a3b8',
    },
    chart: {
      grid: '#e2e8f0',
      tooltip: '#ffffff',
    }
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1200px',
  }
};

export const darkTheme: DefaultTheme = {
  mode: 'dark',
  colors: {
    background: '#0f172a',
    card: '#1e293b',
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    border: '#334155',
    accent: {
      primary: '#3b82f6',
      hover: '#2563eb',
      text: '#ffffff',
    },
    status: {
      ok: '#22c55e',
      warning: '#facc15',
      critical: '#ef4444',
      neutral: '#64748b',
    },
    chart: {
      grid: '#334155',
      tooltip: '#1e293b',
    }
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1200px',
  },
};

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg-color: ${({ theme }) => theme.colors.background};
    --card-bg: ${({ theme }) => theme.colors.card};
    --text-color: ${({ theme }) => theme.colors.text.primary};
    --accent: ${({ theme }) => theme.colors.accent.primary};
    --border-color: ${({ theme }) => theme.colors.border};
  }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  a {
    color: ${({ theme }) => theme.colors.accent.primary};
  }

  input, select, textarea {
    background-color: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border};
  }

  /* Scrollbar styles for dark mode */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#f1f1f1'}; 
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#c1c1c1'}; 
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#475569' : '#a8a8a8'}; 
  }
`;
