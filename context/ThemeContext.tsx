import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { lightTheme, darkTheme } from "@/constants/theme";
import { Theme } from "@/types";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  
  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setIsDark(savedTheme === "dark");
        } else {
          // Use system preference if no saved theme
          setIsDark(colorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };
    
    loadTheme();
  }, [colorScheme]);
  
  // Save theme preference when it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (error) {
        console.error("Failed to save theme:", error);
      }
    };
    
    saveTheme();
  }, [isDark]);
  
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  
  const setTheme = (theme: "light" | "dark") => {
    setIsDark(theme === "dark");
  };
  
  const theme = isDark ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}