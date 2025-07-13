import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Flame } from "lucide-react-native";

interface StreakBadgeProps {
  count: number;
  isPositive: boolean;
}

export function StreakBadge({ count, isPositive }: StreakBadgeProps) {
  const { theme } = useTheme();
  
  if (count === 0) return null;
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isPositive ? theme.colors.successLight : theme.colors.errorLight,
        borderColor: isPositive ? theme.colors.success : theme.colors.error,
      }
    ]}>
      <Flame 
        size={16} 
        color={isPositive ? theme.colors.success : theme.colors.error} 
      />
      <Text style={[
        styles.text, 
        { color: isPositive ? theme.colors.success : theme.colors.error }
      ]}>
        {count} {isPositive ? "Win" : "Loss"} Streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});