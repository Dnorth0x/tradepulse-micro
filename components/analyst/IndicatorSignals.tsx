import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { AiSignal } from "@/types";

interface IndicatorSignalsProps {
  signals: AiSignal | null | undefined;
  isLoading: boolean;
}

export function IndicatorSignals({ signals, isLoading }: IndicatorSignalsProps) {
  const { theme } = useTheme();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading technical signals...
        </Text>
      </View>
    );
  }
  
  if (!signals) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No technical signals available. Tap the refresh button to analyze.
        </Text>
      </View>
    );
  }
  
  // Helper function to determine indicator color
  const getIndicatorColor = (value: number, indicator: "rsi" | "macd" | "stoch"): string => {
    if (indicator === "rsi") {
      if (value > 70) return theme.colors.error;
      if (value < 30) return theme.colors.success;
    } else if (indicator === "macd") {
      if (value > 0) return theme.colors.success;
      if (value < 0) return theme.colors.error;
    } else if (indicator === "stoch") {
      if (value > 80) return theme.colors.error;
      if (value < 20) return theme.colors.success;
    }
    
    return theme.colors.text;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.indicatorsContainer}>
        <View style={[styles.indicatorCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.indicatorName, { color: theme.colors.textSecondary }]}>
            RSI
          </Text>
          <Text style={[
            styles.indicatorValue, 
            { color: getIndicatorColor(signals.rsi, "rsi") }
          ]}>
            {signals.rsi.toFixed(2)}
          </Text>
          <View style={[
            styles.indicatorBar,
            { backgroundColor: theme.colors.border }
          ]}>
            <View 
              style={[
                styles.indicatorFill,
                { 
                  width: `${Math.min(100, signals.rsi)}%`,
                  backgroundColor: getIndicatorColor(signals.rsi, "rsi")
                }
              ]}
            />
          </View>
        </View>
        
        <View style={[styles.indicatorCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.indicatorName, { color: theme.colors.textSecondary }]}>
            MACD
          </Text>
          <Text style={[
            styles.indicatorValue, 
            { color: getIndicatorColor(signals.macd, "macd") }
          ]}>
            {signals.macd.toFixed(2)}
          </Text>
          <View style={[
            styles.indicatorBar,
            { backgroundColor: theme.colors.border }
          ]}>
            <View 
              style={[
                styles.indicatorFill,
                { 
                  width: `${Math.min(100, Math.abs(signals.macd) * 10)}%`,
                  backgroundColor: getIndicatorColor(signals.macd, "macd")
                }
              ]}
            />
          </View>
        </View>
        
        <View style={[styles.indicatorCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.indicatorName, { color: theme.colors.textSecondary }]}>
            Stochastic
          </Text>
          <Text style={[
            styles.indicatorValue, 
            { color: getIndicatorColor(signals.stoch, "stoch") }
          ]}>
            {signals.stoch.toFixed(2)}
          </Text>
          <View style={[
            styles.indicatorBar,
            { backgroundColor: theme.colors.border }
          ]}>
            <View 
              style={[
                styles.indicatorFill,
                { 
                  width: `${Math.min(100, signals.stoch)}%`,
                  backgroundColor: getIndicatorColor(signals.stoch, "stoch")
                }
              ]}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.compositeContainer}>
        <View style={styles.compositeHeader}>
          <Text style={[styles.compositeTitle, { color: theme.colors.text }]}>
            Composite Signal
          </Text>
          <Text style={styles.compositeEmoji}>
            {signals.composite}
          </Text>
        </View>
        
        <Text style={[styles.gptSummary, { color: theme.colors.text }]}>
          {signals.gpt_summary}
        </Text>
        
        <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
          Analysis from {new Date(signals.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
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
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  indicatorCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  indicatorName: {
    fontSize: 12,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  indicatorBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
  },
  indicatorFill: {
    height: 4,
    borderRadius: 2,
  },
  compositeContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)", // Very subtle background
  },
  compositeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  compositeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  compositeEmoji: {
    fontSize: 24,
  },
  gptSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
  },
});