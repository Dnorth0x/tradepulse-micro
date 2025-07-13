import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Canvas, Path, LinearGradient, vec } from "@shopify/react-native-skia";

import { useTheme } from "@/context/ThemeContext";
import { Trade } from "@/types";

interface EquityCurveProps {
  trades: Trade[];
}

export function EquityCurve({ trades }: EquityCurveProps) {
  const { theme } = useTheme();
  const width = Dimensions.get("window").width - 64; // Accounting for padding
  const height = 200;
  
  if (!trades.length) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No trade data available
        </Text>
      </View>
    );
  }
  
  // Calculate cumulative P&L for equity curve
  const cumulativePnL: number[] = [];
  let runningTotal = 0;
  
  // Sort trades by date
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
  );
  
  sortedTrades.forEach(trade => {
    runningTotal += (trade.pnl || 0);
    cumulativePnL.push(runningTotal);
  });
  
  // Find min and max for scaling
  const minPnL = Math.min(0, ...cumulativePnL);
  const maxPnL = Math.max(0, ...cumulativePnL);
  const range = maxPnL - minPnL;
  
  // Create path for the line
  let path = "";
  
  cumulativePnL.forEach((pnl, index) => {
    const x = (index / (cumulativePnL.length - 1 || 1)) * width;
    // Invert Y coordinate (0 is at the top in canvas)
    const y = height - ((pnl - minPnL) / (range || 1)) * height;
    
    if (index === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  });
  
  // Add points to close the path for gradient fill
  if (cumulativePnL.length > 0) {
    path += `L ${width} ${height} L 0 ${height} Z`;
  }
  
  const isPositive = cumulativePnL[cumulativePnL.length - 1] >= 0;
  
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <Path
          path={path}
          style="fill"
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[
              isPositive ? theme.colors.successLight : theme.colors.errorLight,
              "transparent"
            ]}
          />
        </Path>
        <Path
          path={path.split("Z")[0]} // Remove the closing part of the path
          style="stroke"
          strokeWidth={2}
          color={isPositive ? theme.colors.success : theme.colors.error}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});