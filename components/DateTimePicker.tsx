import { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform, 
  Modal
} from "react-native";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native";

import { formatDate, formatTime } from "@/utils/date";
import { Theme } from "@/types";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  theme: Theme;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, theme, disabled = false }: DateTimePickerProps) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  
  const showDatepicker = () => {
    if (disabled) return;
    setMode("date");
    setShow(true);
  };

  const showTimepicker = () => {
    if (disabled) return;
    setMode("time");
    setShow(true);
  };

  const handleChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleDone = () => {
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.dateButton, 
          { 
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
            opacity: disabled ? 0.5 : 1
          }
        ]}
        onPress={showDatepicker}
        disabled={disabled}
      >
        <Calendar size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.timeButton, 
          { 
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
            opacity: disabled ? 0.5 : 1
          }
        ]}
        onPress={showTimepicker}
        disabled={disabled}
      >
        <Clock size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.timeText, { color: theme.colors.text }]}>
          {formatTime(value)}
        </Text>
      </TouchableOpacity>
      
      {Platform.OS === "ios" ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={show}
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: theme.colors.card }]}>
              <RNDateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                style={styles.picker}
              />
              
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleDone}
              >
                <Text style={[styles.doneButtonText, { color: theme.colors.buttonText }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : show ? (
        <RNDateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
  },
  timeButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  timeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  picker: {
    width: "100%",
  },
  doneButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});