import { useCallback, useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ArrowDown, ArrowUp } from "lucide-react-native";

import { SymbolPicker } from "@/components/SymbolPicker";
import { DateTimePicker } from "@/components/DateTimePicker";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { fetchSymbols } from "@/services/symbols";
import { fetchTrade, createTrade, updateTrade } from "@/services/trades";
import { showConfetti } from "@/utils/confetti";

export default function NewTradeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ tradeId?: string }>();
  const isEditing = !!params.tradeId;

  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [size, setSize] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [pnl, setPnl] = useState<number | null>(null);
  const [openedAt, setOpenedAt] = useState(new Date());
  const [closedAt, setClosedAt] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  // Fetch user's symbols
  const { data: symbols = [] } = useQuery({
    queryKey: ["symbols", user?.id],
    queryFn: () => fetchSymbols(user?.id),
    enabled: !!user?.id,
  });

  // Fetch trade if editing
  const { data: tradeData } = useQuery({
    queryKey: ["trade", params.tradeId],
    queryFn: () => fetchTrade(params.tradeId!),
    enabled: !!params.tradeId,
  });

  // Populate form with trade data if editing
  useEffect(() => {
    if (tradeData) {
      setSymbol(tradeData.symbol);
      setSide(tradeData.side);
      setSize(tradeData.size.toString());
      setEntryPrice(tradeData.entry_price.toString());
      setExitPrice(tradeData.exit_price?.toString() || "");
      setPnl(tradeData.pnl);
      setOpenedAt(new Date(tradeData.opened_at));
      setClosedAt(tradeData.closed_at ? new Date(tradeData.closed_at) : new Date());
      setNotes(tradeData.notes || "");
    }
  }, [tradeData]);

  // Calculate PnL when values change
  useEffect(() => {
    if (entryPrice && exitPrice && size) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const sizeNum = parseFloat(size);
      
      if (!isNaN(entry) && !isNaN(exit) && !isNaN(sizeNum)) {
        const multiplier = side === "BUY" ? 1 : -1;
        const calculatedPnl = (exit - entry) * sizeNum * multiplier;
        setPnl(calculatedPnl);
      }
    }
  }, [entryPrice, exitPrice, size, side]);

  const createTradeMutation = useMutation({
    mutationFn: createTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show confetti if trade is profitable
      if (pnl && pnl > 0) {
        showConfetti();
      }
      
      router.back();
    },
  });

  const updateTradeMutation = useMutation({
    mutationFn: updateTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade", params.tradeId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const handleSave = useCallback(() => {
    if (!user?.id) {
      Alert.alert("Error", "You must be signed in to save trades.");
      return;
    }
    
    if (!symbol || !entryPrice || !size) {
      Alert.alert("Error", "Symbol, entry price, and size are required.");
      return;
    }
    
    const tradeData = {
      user_id: user.id,
      symbol,
      side,
      size: parseFloat(size),
      entry_price: parseFloat(entryPrice),
      exit_price: exitPrice ? parseFloat(exitPrice) : null,
      pnl,
      opened_at: openedAt.toISOString(),
      closed_at: exitPrice ? closedAt.toISOString() : null,
      notes,
    };
    
    if (isEditing && params.tradeId) {
      updateTradeMutation.mutate({
        id: params.tradeId,
        ...tradeData
      });
    } else {
      createTradeMutation.mutate(tradeData);
    }
  }, [
    user, symbol, side, size, entryPrice, exitPrice, 
    pnl, openedAt, closedAt, notes, isEditing, params.tradeId
  ]);

  const handleSymbolSelect = useCallback((selected: string) => {
    setSymbol(selected);
    setShowSymbolPicker(false);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {isEditing ? "Edit Trade" : "New Trade"}
        </Text>

        {/* Symbol Selection */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Symbol</Text>
          <TouchableOpacity 
            style={[styles.symbolButton, { 
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }]}
            onPress={() => setShowSymbolPicker(true)}
          >
            <Text style={[
              styles.symbolButtonText, 
              { color: symbol ? theme.colors.text : theme.colors.textSecondary }
            ]}>
              {symbol || "Select Symbol"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trade Direction */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Direction</Text>
          <View style={styles.directionContainer}>
            <TouchableOpacity 
              style={[
                styles.directionButton, 
                side === "BUY" && { backgroundColor: theme.colors.success },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSide("BUY")}
            >
              <ArrowUp size={20} color={side === "BUY" ? "white" : theme.colors.success} />
              <Text style={[
                styles.directionText, 
                { color: side === "BUY" ? "white" : theme.colors.success }
              ]}>
                BUY / LONG
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.directionButton, 
                side === "SELL" && { backgroundColor: theme.colors.error },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSide("SELL")}
            >
              <ArrowDown size={20} color={side === "SELL" ? "white" : theme.colors.error} />
              <Text style={[
                styles.directionText, 
                { color: side === "SELL" ? "white" : theme.colors.error }
              ]}>
                SELL / SHORT
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Size */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Size / Contracts</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }]}
            value={size}
            onChangeText={setSize}
            placeholder="Enter size"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* Entry & Exit Price */}
        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Entry Price</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border
              }]}
              value={entryPrice}
              onChangeText={setEntryPrice}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Exit Price</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border
              }]}
              value={exitPrice}
              onChangeText={setExitPrice}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* P&L Display */}
        {pnl !== null && (
          <View style={[styles.pnlContainer, { 
            backgroundColor: pnl >= 0 ? theme.colors.successLight : theme.colors.errorLight 
          }]}>
            <Text style={[styles.pnlLabel, { color: theme.colors.text }]}>
              Profit/Loss:
            </Text>
            <Text style={[styles.pnlValue, { 
              color: pnl >= 0 ? theme.colors.success : theme.colors.error 
            }]}>
              ${pnl.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Trade Dates */}
        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Open Date/Time</Text>
            <DateTimePicker
              value={openedAt}
              onChange={setOpenedAt}
              theme={theme}
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Close Date/Time</Text>
            <DateTimePicker
              value={closedAt}
              onChange={setClosedAt}
              theme={theme}
              disabled={!exitPrice}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your trade strategy, emotions, or market conditions..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={createTradeMutation.isPending || updateTradeMutation.isPending}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.buttonText }]}>
            {createTradeMutation.isPending || updateTradeMutation.isPending
              ? "Saving..."
              : isEditing ? "Update Trade" : "Save Trade"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showSymbolPicker && (
        <SymbolPicker
          symbols={symbols}
          activeSymbol={symbol}
          onSelect={handleSymbolSelect}
          onClose={() => setShowSymbolPicker(false)}
          allowAddNew
        />
      )}
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 100,
  },
  rowContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  symbolButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  symbolButtonText: {
    fontSize: 16,
  },
  directionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  directionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  directionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  pnlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  pnlLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  pnlValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});