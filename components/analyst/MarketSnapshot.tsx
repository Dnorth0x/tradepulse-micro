import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Canvas, Path, Circle } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";

import { useTheme } from "@/context/ThemeContext";
import { TickerData } from "@/types";

interface MarketSnapshotProps {
  symbol: string;
  tickerData: TickerData | null;
  isConnected: boolean;
}

export function MarketSnapshot({ symbol, tickerData, isConnected }: MarketSnapshotProps) {
  const { theme } = useTheme();
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const width = Dimensions.get("window").width - 64; // Accounting for padding
  const height = 100;
  
  // Update price history when new ticker data arrives
  useEffect(() => {
    if (tickerData?.price) {
      setPriceHistory(prev => {
        const newHistory = [...prev, tickerData.price];
        // Keep only the last 60 data points (1 minute at 1 update/sec)
        return newHistory.slice(-60);
      });
    }
  }, [tickerData]);
  
  // Calculate price change
  const priceChange = tickerData && tickerData.prevClose
    ? tickerData.price - tickerData.prevClose
    : 0;
  
  const percentChange = tickerData && tickerData.prevClose
    ? (priceChange / tickerData.prevClose) * 100
    : 0;
  
  const isPositive = priceChange >= 0;
  
  // Create sparkline path
  let path = "";
  if (priceHistory.length > 1) {
    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = max - min || 1; // Avoid division by zero
    
    priceHistory.forEach((price, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      // Invert Y coordinate (0 is at the top in canvas)
      const y = height - ((price - min) / range) * height;
      
      if (index === 0) {
        path += `M ${x} ${y} `;
      } else {
        path += `L ${x} ${y} `;
      }
    });
  }
  
  return (
    <View style={styles.container}>
      {!tickerData ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {isConnected ? "Waiting for data..." : "Connecting to market data..."}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.colors.text }]}>
              {tickerData.price.toFixed(2)}
            </Text>
            <View style={styles.changeContainer}>
              <Text style={[
                styles.change, 
                { color: isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                {isPositive ? "+" : ""}{priceChange.toFixed(2)} 
              </Text>
              <Text style={[
                styles.changePercent, 
                { color: isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                ({isPositive ? "+" : ""}{percentChange.toFixed(2)}%)
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Volume
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {tickerData.volume?.toLocaleString() || "N/A"}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                High
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {tickerData.high?.toFixed(2) || "N/A"}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Low
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {tickerData.low?.toFixed(2) || "N/A"}
              </Text>
            </View>
          </View>
          
          <View style={styles.sparklineContainer}>
            <Canvas style={{ width, height }}>
              {path && (
                <Path
                  path={path}
                  style="stroke"
                  strokeWidth={2}
                  color={isPositive ? theme.colors.success : theme.colors.error}
                />
              )}
              {priceHistory.length > 0 && (
                <Circle
                  cx={width}
                  cy={height - ((priceHistory[priceHistory.length - 1] - Math.min(...priceHistory)) / 
                      (Math.max(...priceHistory) - Math.min(...priceHistory) || 1)) * height}
                  r={4}
                  color={isPositive ? theme.colors.success : theme.colors.error}
                />
              )}
            </Canvas>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.updateTime, { color: theme.colors.textSecondary }]}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
            <View style={[
              styles.connectionStatus, 
              { backgroundColor: isConnected ? theme.colors.successLight : theme.colors.errorLight }
            ]}>
              <Text style={[
                styles.connectionStatusText, 
                { color: isConnected ? theme.colors.success : theme.colors.error }
              ]}>
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  change: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 4,
  },
  changePercent: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  sparklineContainer: {
    height: 100,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updateTime: {
    fontSize: 12,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});