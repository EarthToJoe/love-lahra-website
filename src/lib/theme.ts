// Theme Configuration System for Easy Customization
// This allows Lahra to easily change the entire look and feel of the website

export interface ThemeConfig {
  name: string
  description: string
  colors: {
    primary: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    accent: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    neutral: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
  }
  typography: {
    fontFamily: {
      display: string[]
      body: string[]
    }
    fontSize: {
      hero: string
      heading: string
      body: string
      small: string
    }
  }
  spacing: {
    section: string
    card: string
    element: string
  }
  borderRadius: {
    card: string
    button: string
    input: string
  }
  shadows: {
    elegant: string
    luxury: string
    subtle: string
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      smooth: string
      bounce: string
      sharp: string
    }
  }
}

// Current Theme: Sophisticated Navy & Gold
export const sophisticatedTheme: ThemeConfig = {
  name: "Sophisticated",
  description: "Navy, champagne gold, crisp white - New York elegance meets coastal sophistication",
  colors: {
    primary: {
      50: '#f0f4f8',
      100: '#d9e2ec',
      200: '#bcccdc',
      300: '#9fb3c8',
      400: '#829ab1',
      500: '#627d98', // Main navy
      600: '#486581',
      700: '#334e68',
      800: '#243b53',
      900: '#102a43',
    },
    accent: {
      50: '#fefdf7',
      100: '#fef7e0',
      200: '#fdecc8',
      300: '#fbdfa7',
      400: '#f9d071', // Main champagne gold
      500: '#f7c948',
      600: '#f4b942',
      700: '#e09f3e',
      800: '#cc8b3a',
      900: '#a67c52',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  typography: {
    fontFamily: {
      display: ['Playfair Display', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      hero: '3.75rem', // 60px
      heading: '1.5rem', // 24px
      body: '1rem', // 16px
      small: '0.875rem', // 14px
    }
  },
  spacing: {
    section: '4rem', // 64px
    card: '1.5rem', // 24px
    element: '1rem', // 16px
  },
  borderRadius: {
    card: '0.5rem', // 8px
    button: '0.5rem', // 8px
    input: '0.375rem', // 6px
  },
  shadows: {
    elegant: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    luxury: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      sharp: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  }
}

// Alternative Theme: Minimalist Blush
export const minimalistTheme: ThemeConfig = {
  name: "Minimalist Blush",
  description: "Soft blush tones with clean lines - understated elegance",
  colors: {
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Main blush
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    accent: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Soft gray
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  typography: {
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      hero: '3rem', // 48px - smaller, more minimal
      heading: '1.25rem', // 20px
      body: '0.875rem', // 14px
      small: '0.75rem', // 12px
    }
  },
  spacing: {
    section: '3rem', // 48px - tighter spacing
    card: '1rem', // 16px
    element: '0.75rem', // 12px
  },
  borderRadius: {
    card: '1rem', // 16px - more rounded
    button: '2rem', // 32px - pill buttons
    input: '0.5rem', // 8px
  },
  shadows: {
    elegant: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    luxury: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  animations: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '400ms',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      sharp: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  }
}

// Alternative Theme: Bold & Dramatic
export const dramaticTheme: ThemeConfig = {
  name: "Bold & Dramatic",
  description: "Deep blacks with gold accents - high contrast sophistication",
  colors: {
    primary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b', // Deep black
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Bright gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  typography: {
    fontFamily: {
      display: ['Playfair Display', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      hero: '4.5rem', // 72px - larger, more dramatic
      heading: '1.875rem', // 30px
      body: '1.125rem', // 18px
      small: '1rem', // 16px
    }
  },
  spacing: {
    section: '5rem', // 80px - more spacious
    card: '2rem', // 32px
    element: '1.25rem', // 20px
  },
  borderRadius: {
    card: '0.25rem', // 4px - sharper edges
    button: '0.25rem', // 4px
    input: '0.25rem', // 4px
  },
  shadows: {
    elegant: '0 8px 10px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    subtle: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  },
  animations: {
    duration: {
      fast: '200ms',
      normal: '400ms',
      slow: '600ms',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      sharp: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    }
  }
}

// Current active theme - can be easily switched
export const currentTheme = sophisticatedTheme

// Theme utilities
export const getThemeColor = (colorPath: string) => {
  const path = colorPath.split('.')
  let value: any = currentTheme.colors
  
  for (const key of path) {
    value = value[key]
  }
  
  return value
}

export const getThemeValue = (path: string) => {
  const keys = path.split('.')
  let value: any = currentTheme
  
  for (const key of keys) {
    value = value[key]
  }
  
  return value
}