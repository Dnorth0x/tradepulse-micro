import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function showConfetti() {
  // In a real app, this would use a Lottie animation
  // For demo purposes, we'll just trigger haptic feedback
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  
  console.log("🎉 Confetti animation would show here!");
}