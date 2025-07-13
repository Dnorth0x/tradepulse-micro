import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { useRef } from "react";
import { ArrowDown, ArrowUp, Edit, Trash2 } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";

import { useTheme } from "@/context/ThemeContext";
import { formatDate } from "@/utils/date";
import { Trade } from "@/types";

interface TradeItemProps {
  trade: Trade;
  onDelete: () => void;
  onEdit: () => void;
}

export function TradeItem({ trade, onDelete, onEdit }: TradeItemProps) {
  const { theme } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: "clamp",
    });
    
    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              swipeableRef.current?.close();
              onEdit();
            }}
          >
            <Edit size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: theme.colors.error }]}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <View style={styles.symbolContainer}>
            <Text style={[styles.symbol, { color: theme.colors.text }]}>
              {trade.symbol}
            </Text>
            <View style={[
              styles.sideTag, 
              { backgroundColor: trade.side === "BUY" ? theme.colors.successLight : theme.colors.errorLight }
            ]}>
              {trade.side === "BUY" ? (
                <ArrowUp size={12} color={theme.colors.success} />
              ) : (
                <ArrowDown size={12} color={theme.colors.error} />
              )}
              <Text style={[
                styles.sideText, 
                { color: trade.side === "BUY" ? theme.colors.success : theme.colors.error }
              ]}>
                {trade.side}
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.pnl, 
            { color: (trade.pnl || 0) >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {(trade.pnl || 0) >= 0 ? "+" : ""}{(trade.pnl || 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Size
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {trade.size}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Entry
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {trade.entry_price}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Exit
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {trade.exit_price || "-"}
            </Text>
          </View>
        </View>
        
        {trade.notes && (
          <Text 
            style={[styles.notes, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {trade.notes}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {formatDate(trade.opened_at)}
          </Text>
          
          {trade.closed_at && (
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              to {formatDate(trade.closed_at)}
            </Text>
          )}
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  sideTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sideText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  pnl: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailRow: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  notes: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
  },
  rightActions: {
    flexDirection: "row",
    width: 120,
    height: "100%",
  },
  actionButton: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#4c669f",
  },
  deleteButton: {
    backgroundColor: "#dd2c00",
  },
});