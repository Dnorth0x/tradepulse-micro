import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

export function FAB({ icon, onPress, style }: FABProps) {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.fab, 
        { 
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.shadow,
        },
        style
      ]} 
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});