import { useCallback, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Filter, Plus, Search } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { TradeItem } from "@/components/TradeItem";
import { FAB } from "@/components/ui/FAB";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { fetchTrades, deleteTrade } from "@/services/trades";
import { Trade } from "@/types";

export default function JournalScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, pnl-high, pnl-low

  const { data: trades = [], isLoading, refetch } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: () => fetchTrades(user?.id),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleNewTrade = useCallback(() => {
    router.push("/new-trade");
  }, [router]);

  const handleImportCSV = useCallback(() => {
    router.push("/import-csv");
  }, [router]);

  const handleDeleteTrade = useCallback((id: string) => {
    Alert.alert(
      "Delete Trade",
      "Are you sure you want to delete this trade?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(id);
          }
        }
      ]
    );
  }, [deleteMutation]);

  const handleEditTrade = useCallback((trade: Trade) => {
    router.push({
      pathname: "/new-trade",
      params: { tradeId: trade.id }
    });
  }, [router]);

  const filteredTrades = useCallback(() => {
    let filtered = [...trades];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(query) || 
        (trade.notes && trade.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply date filter
    const now = new Date();
    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(trade => new Date(trade.opened_at) >= today);
    } else if (dateFilter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filtered = filtered.filter(trade => new Date(trade.opened_at) >= weekStart);
    } else if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(trade => new Date(trade.opened_at) >= monthStart);
    }
    
    // Apply sorting
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());
    } else if (sortOrder === "pnl-high") {
      filtered.sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    } else if (sortOrder === "pnl-low") {
      filtered.sort((a, b) => (a.pnl || 0) - (b.pnl || 0));
    }
    
    return filtered;
  }, [trades, searchQuery, dateFilter, sortOrder]);

  const renderFilterOptions = () => {
    if (!showFilters) return null;
    
    return (
      <View style={[styles.filtersContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Date Range</Text>
          <View style={styles.filterOptions}>
            {["all", "today", "week", "month"].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  dateFilter === option && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setDateFilter(option)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: dateFilter === option ? theme.colors.buttonText : theme.colors.text }
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Sort By</Text>
          <View style={styles.filterOptions}>
            {[
              { id: "newest", label: "Newest" },
              { id: "oldest", label: "Oldest" },
              { id: "pnl-high", label: "P&L ↓" },
              { id: "pnl-low", label: "P&L ↑" }
            ].map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  sortOrder === option.id && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSortOrder(option.id)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: sortOrder === option.id ? theme.colors.buttonText : theme.colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search by symbol or notes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: theme.colors.card }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? theme.colors.primary : theme.colors.text} />
        </TouchableOpacity>
      </View>

      {renderFilterOptions()}

      <FlatList
        data={filteredTrades()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TradeItem 
            trade={item} 
            onDelete={() => handleDeleteTrade(item.id)}
            onEdit={() => handleEditTrade(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              {searchQuery 
                ? "No trades match your search criteria" 
                : "No trades recorded yet. Tap the + button to add your first trade."}
            </Text>
            {!searchQuery && (
              <View style={styles.emptyStateActions}>
                <TouchableOpacity 
                  style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleNewTrade}
                >
                  <Text style={[styles.emptyStateButtonText, { color: theme.colors.buttonText }]}>
                    Add Trade
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.emptyStateButton, { backgroundColor: theme.colors.card }]}
                  onPress={handleImportCSV}
                >
                  <Text style={[styles.emptyStateButtonText, { color: theme.colors.text }]}>
                    Import CSV
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      <FAB 
        icon={<Plus color={theme.colors.buttonText} size={24} />}
        onPress={handleNewTrade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterOptionText: {
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateActions: {
    flexDirection: "row",
    gap: 12,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});