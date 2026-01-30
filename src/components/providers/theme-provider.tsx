'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { ThemeConfig, sophisticatedTheme, minimalistTheme, dramaticTheme } from '@/lib/theme'

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  availableThemes: ThemeConfig[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeConfig
}

export function ThemeProvider({ children, initialTheme = sophisticatedTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(initialTheme)
  
  const availableThemes = [sophisticatedTheme, minimalistTheme, dramaticTheme]
  
  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme)
    updateCSSVariables(newTheme)
    console.log('Theme changed to:', newTheme.name)
  }

  // Update CSS custom properties when theme changes
  const updateCSSVariables = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    // Update primary colors
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value)
    })
    
    // Update accent colors
    Object.entries(theme.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value)
    })
    
    // Update neutral colors
    Object.entries(theme.colors.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value)
    })
  }

  // Initialize CSS variables on mount
  useEffect(() => {
    updateCSSVariables(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme utility hooks for easy access to theme values
export function useThemeColors() {
  const { theme } = useTheme()
  return theme.colors
}

export function useThemeTypography() {
  const { theme } = useTheme()
  return theme.typography
}

export function useThemeSpacing() {
  const { theme } = useTheme()
  return theme.spacing
}

export function useThemeAnimations() {
  const { theme } = useTheme()
  return theme.animations
}