import { StyleSheet, Text, View, FlatList } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { MacroDigest } from "@/types";
import { formatDate } from "@/utils/date";

interface MacroDigestListProps {
  digests: MacroDigest[];
  isLoading: boolean;
}

export function MacroDigestList({ digests, isLoading }: MacroDigestListProps) {
  const { theme } = useTheme();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading market digest...
        </Text>
      </View>
    );
  }
  
  if (digests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No market digest available. Pull to refresh or tap the refresh button.
        </Text>
      </View>
    );
  }
  
  // Helper function to determine sentiment emoji
  const getSentimentEmoji = (digest: string): string => {
    const lowerDigest = digest.toLowerCase();
    
    if (
      lowerDigest.includes("bullish") || 
      lowerDigest.includes("positive") || 
      lowerDigest.includes("gains") ||
      lowerDigest.includes("rally") ||
      lowerDigest.includes("uptrend")
    ) {
      return "📈";
    } else if (
      lowerDigest.includes("bearish") || 
      lowerDigest.includes("negative") || 
      lowerDigest.includes("losses") ||
      lowerDigest.includes("decline") ||
      lowerDigest.includes("downtrend")
    ) {
      return "📉";
    }
    
    return "➖";
  };
  
  return (
    <FlatList
      data={digests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.digestItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.digestHeader}>
            <Text style={[styles.digestDate, { color: theme.colors.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
            <Text style={styles.sentimentEmoji}>
              {getSentimentEmoji(item.digest)}
            </Text>
          </View>
          <Text style={[styles.digestText, { color: theme.colors.text }]}>
            {item.digest}
          </Text>
        </View>
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  digestItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  digestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  digestDate: {
    fontSize: 12,
  },
  sentimentEmoji: {
    fontSize: 16,
  },
  digestText: {
    fontSize: 14,
    lineHeight: 20,
  },
});