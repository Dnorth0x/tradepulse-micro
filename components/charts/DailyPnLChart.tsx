import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Canvas, Rect, Group } from "@shopify/react-native-skia";

import { useTheme } from "@/context/ThemeContext";
import { Trade } from "@/types";
import { formatShortDate } from "@/utils/date";

interface DailyPnLChartProps {
  trades: Trade[];
}

export function DailyPnLChart({ trades }: DailyPnLChartProps) {
  const { theme } = useTheme();
  const width = Dimensions.get("window").width - 64; // Accounting for padding
  const height = 200;
  const barPadding = 2;
  
  if (!trades.length) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No trade data available
        </Text>
      </View>
    );
  }
  
  // Group trades by date and calculate daily P&L
  const dailyPnL: Record<string, number> = {};
  
  trades.forEach(trade => {
    const date = new Date(trade.opened_at).toISOString().split("T")[0];
    dailyPnL[date] = (dailyPnL[date] || 0) + (trade.pnl || 0);
  });
  
  // Convert to array and sort by date
  const dailyPnLArray = Object.entries(dailyPnL)
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Take only the last 14 days if there are more
  const displayData = dailyPnLArray.slice(-14);
  
  // Find min and max for scaling
  const values = displayData.map(d => d.pnl);
  const minPnL = Math.min(0, ...values);
  const maxPnL = Math.max(0, ...values);
  const range = maxPnL - minPnL;
  
  // Calculate bar width
  const barWidth = (width / displayData.length) - barPadding;
  
  // Zero line position
  const zeroY = height * (maxPnL / (range || 1));
  
  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        {/* Zero line */}
        <Rect
          x={0}
          y={zeroY}
          width={width}
          height={1}
          color={theme.colors.border}
        />
        
        {/* Bars */}
        <Group>
          {displayData.map((item, index) => {
            const barHeight = Math.abs(item.pnl) / (range || 1) * height;
            const x = index * (barWidth + barPadding);
            const y = item.pnl >= 0 
              ? zeroY - barHeight 
              : zeroY;
            
            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight || 1} // Ensure at least 1px height
                color={item.pnl >= 0 ? theme.colors.success : theme.colors.error}
              />
            );
          })}
        </Group>
      </Canvas>
      
      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {displayData.map((item, index) => (
          <Text 
            key={index}
            style={[
              styles.xAxisLabel, 
              { color: theme.colors.textSecondary, width: barWidth + barPadding }
            ]}
            numberOfLines={1}
          >
            {formatShortDate(item.date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: "center",
  },
});