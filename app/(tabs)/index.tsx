import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { EquityCurve } from "@/components/charts/EquityCurve";
import { DailyPnLChart } from "@/components/charts/DailyPnLChart";
import { StreakBadge } from "@/components/StreakBadge";
import { Card } from "@/components/ui/Card";
import { FAB } from "@/components/ui/FAB";
import { useTheme } from "@/context/ThemeContext";
import { fetchTrades } from "@/services/trades";
import { useAuth } from "@/context/AuthContext";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: trades = [], isLoading, refetch } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: () => fetchTrades(user?.id),
    enabled: !!user?.id,
  });

  const [totalPnL, winRate, streakCount] = useMemo(() => {
    if (!trades.length) return [0, 0, 0];
    
    const total = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = trades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRateCalc = (wins / trades.length) * 100;
    
    // Calculate current streak
    let streak = 0;
    let i = trades.length - 1;
    const isWinning = (trades[i]?.pnl || 0) > 0;
    
    while (i >= 0 && ((trades[i]?.pnl || 0) > 0) === isWinning) {
      streak++;
      i--;
    }
    
    return [total, winRateCalc, streak];
  }, [trades]);

  const handleNewTrade = useCallback(() => {
    router.push("/new-trade");
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Trading Dashboard
          </Text>
          <StreakBadge count={streakCount} isPositive={streakCount > 0} />
        </View>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Performance Summary
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { 
                color: totalPnL >= 0 ? theme.colors.success : theme.colors.error 
              }]}>
                ${totalPnL.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total P&L
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {winRate.toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Win Rate
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {trades.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Trades
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Equity Curve
          </Text>
          <EquityCurve trades={trades} />
        </Card>

        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Daily P&L
          </Text>
          <DailyPnLChart trades={trades} />
        </Card>

        {trades.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No trades recorded yet. Tap the + button to add your first trade.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNewTrade}
            >
              <Text style={[styles.emptyStateButtonText, { color: theme.colors.buttonText }]}>
                Add First Trade
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FAB 
        icon={<Plus color={theme.colors.buttonText} size={24} />}
        onPress={handleNewTrade}
        style={{ bottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 24,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
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