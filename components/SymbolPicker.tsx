import { useCallback, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Modal,
  Alert
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Search } from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { createSymbol } from "@/services/symbols";
import { Symbol } from "@/types";

interface SymbolPickerProps {
  symbols: Symbol[];
  activeSymbol: string;
  onSelect: (symbol: string) => void;
  onClose: () => void;
  allowAddNew?: boolean;
}

export function SymbolPicker({ 
  symbols, 
  activeSymbol, 
  onSelect, 
  onClose,
  allowAddNew = false
}: SymbolPickerProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newMarket, setNewMarket] = useState("FUT");

  const createSymbolMutation = useMutation({
    mutationFn: createSymbol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symbols"] });
      setNewSymbol("");
      setShowAddNew(false);
    },
  });

  const handleAddSymbol = useCallback(() => {
    if (!user?.id) return;
    if (!newSymbol.trim()) {
      Alert.alert("Error", "Symbol cannot be empty");
      return;
    }
    
    createSymbolMutation.mutate({
      user_id: user.id,
      ticker: newSymbol.toUpperCase().trim(),
      market: newMarket,
      is_active: true
    });
  }, [user, newSymbol, newMarket, createSymbolMutation]);

  const filteredSymbols = symbols.filter(symbol => 
    symbol.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markets = ["FUT", "CRYPTO", "STOCK", "FOREX"];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Select Symbol
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search symbols..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
          </View>
          
          {showAddNew ? (
            <View style={styles.addNewContainer}>
              <Text style={[styles.addNewTitle, { color: theme.colors.text }]}>
                Add New Symbol
              </Text>
              
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border
                }]}
                placeholder="Symbol (e.g. ES, BTC, AAPL)"
                placeholderTextColor={theme.colors.textSecondary}
                value={newSymbol}
                onChangeText={setNewSymbol}
                autoCapitalize="characters"
              />
              
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Market
              </Text>
              
              <View style={styles.marketButtons}>
                {markets.map(market => (
                  <TouchableOpacity
                    key={market}
                    style={[
                      styles.marketButton,
                      newMarket === market && { backgroundColor: theme.colors.primary },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setNewMarket(market)}
                  >
                    <Text style={[
                      styles.marketButtonText,
                      { color: newMarket === market ? theme.colors.buttonText : theme.colors.text }
                    ]}>
                      {market}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.addNewActions}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowAddNew(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddSymbol}
                  disabled={createSymbolMutation.isPending}
                >
                  <Text style={[styles.addButtonText, { color: theme.colors.buttonText }]}>
                    {createSymbolMutation.isPending ? "Adding..." : "Add Symbol"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <FlatList
              data={filteredSymbols}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.symbolItem, 
                    activeSymbol === item.ticker && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => onSelect(item.ticker)}
                >
                  <Text style={[styles.symbolText, { color: theme.colors.text }]}>
                    {item.ticker}
                  </Text>
                  <View style={[styles.marketTag, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.marketTagText, { color: theme.colors.textSecondary }]}>
                      {item.market}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    {searchQuery 
                      ? `No symbols matching "${searchQuery}"`
                      : "No symbols found. Add your first symbol."}
                  </Text>
                </View>
              }
            />
          )}
          
          {allowAddNew && !showAddNew && (
            <TouchableOpacity 
              style={[styles.addNewButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAddNew(true)}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={[styles.addNewButtonText, { color: theme.colors.primary }]}>
                Add New Symbol
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    height: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  symbolItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  symbolText: {
    fontSize: 16,
    fontWeight: "500",
  },
  marketTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  marketTagText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  addNewContainer: {
    padding: 16,
  },
  addNewTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  marketButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  marketButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  marketButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addNewActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  addButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});