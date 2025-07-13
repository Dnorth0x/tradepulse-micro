import { useCallback, useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  TextInput
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { 
  CreditCard, 
  LogOut, 
  Moon, 
  Key, 
  User, 
  ChevronRight,
  Shield
} from "lucide-react-native";

import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, updateApiKeys } from "@/services/user";
import { checkSubscriptionStatus } from "@/services/subscription";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  
  const [polygonKey, setPolygonKey] = useState("");
  const [finnhubKey, setFinnhubKey] = useState("");
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Load API keys and subscription status
  useEffect(() => {
    if (user?.id) {
      // In a real app, these would be fetched from Supabase
      setPolygonKey("pk_*****");
      setFinnhubKey("fh_*****");
      
      // Check if user has agreed to disclaimer
      setHasAgreedToDisclaimer(!!user.disclaimer_agreed_at);
      
      // Check subscription status
      checkSubscriptionStatus(user.id).then(status => {
        setIsPremium(status.isActive);
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Your profile has been updated.");
    },
  });

  const updateApiKeysMutation = useMutation({
    mutationFn: updateApiKeys,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Your API keys have been updated.");
    },
  });

  const handleSignOut = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          onPress: () => {
            signOut();
          }
        }
      ]
    );
  }, [signOut]);

  const handleToggleTheme = useCallback(() => {
    Haptics.selectionAsync();
    toggleTheme();
  }, [toggleTheme]);

  const handleSaveApiKeys = useCallback(() => {
    if (!user?.id) return;
    
    updateApiKeysMutation.mutate({
      userId: user.id,
      polygonKey,
      finnhubKey
    });
  }, [user, polygonKey, finnhubKey, updateApiKeysMutation]);

  const handleShowDisclaimer = useCallback(() => {
    Alert.alert(
      "Trading Disclaimer",
      "TradePulse Micro is for educational purposes only and not financial advice. Past performance is not indicative of future results. Trading involves risk of loss.",
      [
        { 
          text: "I Agree", 
          onPress: () => {
            if (user?.id) {
              updateProfileMutation.mutate({
                userId: user.id,
                disclaimerAgreedAt: new Date().toISOString()
              });
              setHasAgreedToDisclaimer(true);
            }
          }
        }
      ]
    );
  }, [user, updateProfileMutation]);

  const handleGoPremium = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* User Profile Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Profile
          </Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileEmail, { color: theme.colors.text }]}>
            {user?.email || "Not signed in"}
          </Text>
          <Text style={[styles.profileStatus, { color: theme.colors.textSecondary }]}>
            {isPremium ? "Premium Member" : "Free Account"}
          </Text>
        </View>
      </Card>

      {/* Subscription Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Subscription
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={handleGoPremium}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {isPremium ? "Manage Subscription" : "Go Premium"}
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {isPremium 
                ? "View or change your subscription" 
                : "Unlock all features for $4.99/month"}
            </Text>
          </View>
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* API Keys Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Key size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            API Keys
          </Text>
        </View>
        
        <View style={styles.apiKeyContainer}>
          <Text style={[styles.apiKeyLabel, { color: theme.colors.text }]}>
            Polygon.io API Key
          </Text>
          <TextInput
            style={[styles.apiKeyInput, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }]}
            value={polygonKey}
            onChangeText={setPolygonKey}
            placeholder="Enter Polygon.io API key"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>
        
        <View style={styles.apiKeyContainer}>
          <Text style={[styles.apiKeyLabel, { color: theme.colors.text }]}>
            Finnhub API Key
          </Text>
          <TextInput
            style={[styles.apiKeyInput, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }]}
            value={finnhubKey}
            onChangeText={setFinnhubKey}
            placeholder="Enter Finnhub API key"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSaveApiKeys}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.buttonText }]}>
            Save API Keys
          </Text>
        </TouchableOpacity>
      </Card>

      {/* App Settings Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Moon size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            App Settings
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Dark Theme
          </Text>
          <Switch
            value={isDark}
            onValueChange={handleToggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.card}
          />
        </View>
      </Card>

      {/* Legal Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Legal
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={handleShowDisclaimer}
        >
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Trading Disclaimer
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {hasAgreedToDisclaimer ? "Agreed" : "Review and agree"}
            </Text>
          </View>
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button */}
      <TouchableOpacity 
        style={[styles.signOutButton, { borderColor: theme.colors.error }]}
        onPress={handleSignOut}
      >
        <LogOut size={20} color={theme.colors.error} />
        <Text style={[styles.signOutText, { color: theme.colors.error }]}>
          Sign Out
        </Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
        TradePulse Micro v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  profileInfo: {
    padding: 16,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  apiKeyContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  apiKeyLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  apiKeyInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  saveButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
});