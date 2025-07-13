import { useCallback, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { FileText, Upload, Check, AlertCircle } from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { bulkImportTrades } from "@/services/trades";
import { parseCSV } from "@/utils/csvParser";

export default function ImportCSVScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [parsedTrades, setParsedTrades] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const importMutation = useMutation({
    mutationFn: bulkImportTrades,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Import Successful",
        `Successfully imported ${parsedTrades.length} trades.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
  });

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      setFile(result);
      setParseError(null);
      setParsedTrades([]);
      
      // Parse the CSV file
      setIsParsing(true);
      try {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const trades = parseCSV(fileContent);
        
        if (trades.length === 0) {
          setParseError("No valid trades found in the CSV file.");
        } else {
          setParsedTrades(trades);
        }
      } catch (error) {
        setParseError("Failed to parse CSV file. Please check the format.");
        console.error("CSV parse error:", error);
      } finally {
        setIsParsing(false);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Failed to pick document.");
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!user?.id || parsedTrades.length === 0) return;
    
    const tradesWithUserId = parsedTrades.map(trade => ({
      ...trade,
      user_id: user.id
    }));
    
    importMutation.mutate(tradesWithUserId);
  }, [user, parsedTrades, importMutation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Import Trades from CSV
        </Text>
        
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            CSV Format Requirements
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Your CSV file should have the following columns:
          </Text>
          <Text style={[styles.codeBlock, { 
            color: theme.colors.text,
            backgroundColor: theme.colors.inputBackground
          }]}>
            symbol,side,size,entry_price,exit_price,opened_at,closed_at,notes
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Dates should be in ISO format (YYYY-MM-DD HH:MM:SS).
            TopStepX and NinjaTrader exports are automatically supported.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.uploadButton, { 
            backgroundColor: file ? theme.colors.card : theme.colors.primary,
            borderColor: theme.colors.border,
            borderWidth: file ? 1 : 0,
          }]}
          onPress={handlePickDocument}
        >
          {file ? (
            <View style={styles.fileInfo}>
              <FileText size={24} color={theme.colors.primary} />
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                  {file.assets?.[0]?.name || "Selected file"}
                </Text>
                {isParsing ? (
                  <Text style={[styles.fileStatus, { color: theme.colors.textSecondary }]}>
                    Parsing...
                  </Text>
                ) : parseError ? (
                  <Text style={[styles.fileError, { color: theme.colors.error }]}>
                    {parseError}
                  </Text>
                ) : parsedTrades.length > 0 ? (
                  <Text style={[styles.fileStatus, { color: theme.colors.success }]}>
                    {parsedTrades.length} trades found
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <>
              <Upload size={24} color={theme.colors.buttonText} />
              <Text style={[styles.uploadText, { color: theme.colors.buttonText }]}>
                Select CSV File
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {isParsing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Parsing CSV file...
            </Text>
          </View>
        )}
        
        {parsedTrades.length > 0 && (
          <>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                Preview
              </Text>
              <Text style={[styles.previewCount, { color: theme.colors.textSecondary }]}>
                {parsedTrades.length} trades
              </Text>
            </View>
            
            <View style={[styles.previewTable, { borderColor: theme.colors.border }]}>
              <View style={[styles.previewRow, styles.previewHeaderRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.previewHeaderCell, { color: theme.colors.text }]}>Symbol</Text>
                <Text style={[styles.previewHeaderCell, { color: theme.colors.text }]}>Side</Text>
                <Text style={[styles.previewHeaderCell, { color: theme.colors.text }]}>Size</Text>
                <Text style={[styles.previewHeaderCell, { color: theme.colors.text }]}>P&L</Text>
              </View>
              
              {parsedTrades.slice(0, 5).map((trade, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.previewRow, 
                    index < parsedTrades.length - 1 && { borderBottomColor: theme.colors.border }
                  ]}
                >
                  <Text style={[styles.previewCell, { color: theme.colors.text }]}>{trade.symbol}</Text>
                  <Text style={[
                    styles.previewCell, 
                    { color: trade.side === "BUY" ? theme.colors.success : theme.colors.error }
                  ]}>
                    {trade.side}
                  </Text>
                  <Text style={[styles.previewCell, { color: theme.colors.text }]}>{trade.size}</Text>
                  <Text style={[
                    styles.previewCell, 
                    { color: (trade.pnl || 0) >= 0 ? theme.colors.success : theme.colors.error }
                  ]}>
                    ${(trade.pnl || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
              
              {parsedTrades.length > 5 && (
                <View style={styles.previewMore}>
                  <Text style={[styles.previewMoreText, { color: theme.colors.textSecondary }]}>
                    +{parsedTrades.length - 5} more trades
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.importButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleImport}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.buttonText} />
              ) : (
                <>
                  <Check size={20} color={theme.colors.buttonText} />
                  <Text style={[styles.importButtonText, { color: theme.colors.buttonText }]}>
                    Import {parsedTrades.length} Trades
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
        
        {parseError && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorLight }]}>
            <AlertCircle size={20} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {parseError}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    padding: 12,
    borderRadius: 4,
    fontSize: 12,
    marginVertical: 8,
  },
  uploadButton: {
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    flexDirection: "row",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
  },
  fileStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  fileError: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  previewCount: {
    fontSize: 14,
  },
  previewTable: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    overflow: "hidden",
  },
  previewRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  previewHeaderRow: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  previewHeaderCell: {
    flex: 1,
    padding: 12,
    fontWeight: "600",
    fontSize: 14,
  },
  previewCell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  previewMore: {
    padding: 12,
    alignItems: "center",
  },
  previewMoreText: {
    fontSize: 14,
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});