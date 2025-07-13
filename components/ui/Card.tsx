import { StyleSheet, View, ViewProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export function Card({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        },
        style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});