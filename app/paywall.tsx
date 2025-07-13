import { useCallback, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Check, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { purchaseSubscription } from "@/services/subscription";

export default function PaywallScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseMutation = useMutation({
    mutationFn: purchaseSubscription,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Subscription Activated",
        "Thank you for subscribing to TradePulse Micro Premium!",
        [{ text: "Continue", onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      console.error("Purchase error:", error);
      Alert.alert(
        "Purchase Failed",
        "There was an error processing your payment. Please try again later.",
        [{ text: "OK" }]
      );
    },
  });

  const handleSubscribe = useCallback(() => {
    if (!user?.id) {
      Alert.alert("Error", "You must be signed in to subscribe.");
      return;
    }
    
    // TODO: In production, this would use Stripe SDK or expo-in-app-purchases
    // For now, we'll simulate the purchase process
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show confirmation dialog
      Alert.alert(
        "Confirm Purchase",
        "Subscribe to TradePulse Micro Premium for $4.99/month?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Subscribe", 
            onPress: () => {
              purchaseMutation.mutate({ userId: user.id });
            }
          }
        ]
      );
    }, 1000);
  }, [user, purchaseMutation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.header}
        >
          <Lock size={40} color="white" />
          <Text style={styles.headerTitle}>TradePulse Micro</Text>
          <Text style={styles.headerSubtitle}>Premium</Text>
        </LinearGradient>
        
        <View style={styles.pricingContainer}>
          <Text style={[styles.price, { color: theme.colors.text }]}>
            $4.99
            <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>
              /month
            </Text>
          </Text>
          <Text style={[styles.pricingSubtext, { color: theme.colors.textSecondary }]}>
            Cancel anytime
          </Text>
        </View>
        
        <View style={[styles.featuresContainer, { borderColor: theme.colors.border }]}>
          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
            Premium Features
          </Text>
          
          {[
            "Real-time market data for all symbols",
            "Advanced AI market analysis",
            "Unlimited trade history",
            "CSV import/export",
            "Custom technical indicators",
            "Priority customer support"
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={20} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.subscribeButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubscribe}
          disabled={isProcessing || purchaseMutation.isPending}
        >
          {isProcessing || purchaseMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.colors.buttonText} />
          ) : (
            <Text style={[styles.subscribeButtonText, { color: theme.colors.buttonText }]}>
              Subscribe Now
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
          Your subscription will automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage your subscription in your App Store account settings.
        </Text>
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
            Maybe Later
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 0,
    paddingBottom: 40,
  },
  header: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 20,
    color: "white",
    opacity: 0.9,
  },
  pricingContainer: {
    alignItems: "center",
    padding: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: "bold",
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "normal",
  },
  pricingSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  featuresContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginLeft: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  subscribeButton: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 24,
    lineHeight: 18,
  },
  cancelText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});