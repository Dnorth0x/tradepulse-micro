import { useCallback, useState, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";

import { Card } from "@/components/ui/Card";
import { MarketSnapshot } from "@/components/analyst/MarketSnapshot";
import { MacroDigestList } from "@/components/analyst/MacroDigestList";
import { IndicatorSignals } from "@/components/analyst/IndicatorSignals";
import { SymbolPicker } from "@/components/SymbolPicker";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { fetchSymbols } from "@/services/symbols";
import { fetchMacroDigest, refreshMacroDigest } from "@/services/macroDigest";
import { fetchAiSignals, refreshAiSignals } from "@/services/aiSignals";
import { usePolygonTicker } from "@/hooks/usePolygonTicker";
import { useEdgeFn } from "@/hooks/useEdgeFn";

export default function AnalystScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSymbol, setActiveSymbol] = useState("ES");
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    market: true,
    macro: true,
    signals: true,
  });
  
  const scrollRef = useRef<ScrollView>(null);

  // Fetch user's symbols
  const { data: symbols = [] } = useQuery({
    queryKey: ["symbols", user?.id],
    queryFn: () => fetchSymbols(user?.id),
    enabled: !!user?.id,
  });

  // Fetch macro digest
  const { 
    data: macroDigest = [], 
    isLoading: isLoadingMacro,
    refetch: refetchMacro
  } = useQuery({
    queryKey: ["macroDigest"],
    queryFn: fetchMacroDigest,
  });

  // Fetch AI signals for active symbol
  const { 
    data: aiSignals,
    isLoading: isLoadingSignals,
    refetch: refetchSignals
  } = useQuery({
    queryKey: ["aiSignals", activeSymbol],
    queryFn: () => fetchAiSignals(activeSymbol),
  });

  // Live ticker data
  const { tickerData, isConnected } = usePolygonTicker(activeSymbol);

  // Edge function mutations
  const callEdgeFn = useEdgeFn();
  
  const refreshMacroMutation = useMutation({
    mutationFn: () => callEdgeFn("news_ingest", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["macroDigest"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const refreshSignalsMutation = useMutation({
    mutationFn: () => callEdgeFn("ai_ta", { symbol: activeSymbol }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiSignals", activeSymbol] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleSymbolSelect = useCallback((symbol: string) => {
    setActiveSymbol(symbol);
    setShowSymbolPicker(false);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchMacro();
    refetchSignals();
  }, [refetchMacro, refetchSignals]);

  const handleRefreshMacro = useCallback(() => {
    refreshMacroMutation.mutate();
  }, [refreshMacroMutation]);

  const handleRefreshSignals = useCallback(() => {
    refreshSignalsMutation.mutate();
  }, [refreshSignalsMutation, activeSymbol]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoadingMacro || isLoadingSignals} 
            onRefresh={handleRefresh} 
          />
        }
      >
        {/* Market Snapshot */}
        <Card style={styles.card}>
          <TouchableOpacity 
            style={styles.cardHeader}
            onPress={() => toggleSection("market")}
          >
            <TouchableOpacity 
              style={styles.symbolSelector}
              onPress={() => setShowSymbolPicker(true)}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Market Snapshot: {activeSymbol}
              </Text>
            </TouchableOpacity>
            {expandedSections.market ? 
              <ChevronUp size={20} color={theme.colors.text} /> : 
              <ChevronDown size={20} color={theme.colors.text} />
            }
          </TouchableOpacity>
          
          {expandedSections.market && (
            <MarketSnapshot 
              symbol={activeSymbol}
              tickerData={tickerData}
              isConnected={isConnected}
            />
          )}
        </Card>

        {/* Macro Digest */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity 
              style={styles.headerTitleContainer}
              onPress={() => toggleSection("macro")}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Macro Digest
              </Text>
              {expandedSections.macro ? 
                <ChevronUp size={20} color={theme.colors.text} /> : 
                <ChevronDown size={20} color={theme.colors.text} />
              }
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.refreshButton, { opacity: refreshMacroMutation.isPending ? 0.5 : 1 }]}
              onPress={handleRefreshMacro}
              disabled={refreshMacroMutation.isPending}
            >
              {refreshMacroMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <RefreshCw size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {expandedSections.macro && (
            <MacroDigestList 
              digests={macroDigest}
              isLoading={isLoadingMacro}
            />
          )}
        </Card>

        {/* Indicator Signals */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity 
              style={styles.headerTitleContainer}
              onPress={() => toggleSection("signals")}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Technical Signals: {activeSymbol}
              </Text>
              {expandedSections.signals ? 
                <ChevronUp size={20} color={theme.colors.text} /> : 
                <ChevronDown size={20} color={theme.colors.text} />
              }
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.refreshButton, { opacity: refreshSignalsMutation.isPending ? 0.5 : 1 }]}
              onPress={handleRefreshSignals}
              disabled={refreshSignalsMutation.isPending}
            >
              {refreshSignalsMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <RefreshCw size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {expandedSections.signals && (
            <IndicatorSignals 
              signals={aiSignals}
              isLoading={isLoadingSignals}
            />
          )}
        </Card>
      </ScrollView>

      {showSymbolPicker && (
        <SymbolPicker
          symbols={symbols}
          activeSymbol={activeSymbol}
          onSelect={handleSymbolSelect}
          onClose={() => setShowSymbolPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  symbolSelector: {
    flex: 1,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});