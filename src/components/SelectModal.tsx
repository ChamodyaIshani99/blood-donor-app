import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

interface Props {
  visible: boolean;
  title: string;
  options: readonly string[];
  value?: string;
  clearLabel?: string; // when set, shows an extra first option that clears the selection
  onSelect: (value: string | undefined) => void;
  onClose: () => void;
}

export function SelectModal({ visible, title, options, value, clearLabel, onSelect, onClose }: Props) {
  const data: (string | null)[] = clearLabel ? [null, ...options] : [...options];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item ?? "__all__"}
          renderItem={({ item }) => {
            const selected = item === null ? value === undefined : item === value;
            return (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onSelect(item ?? undefined);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, selected && styles.selected]}>{item ?? clearLabel}</Text>
                {selected && <Text style={styles.selected}>✓</Text>}
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "600", color: colors.text },
  close: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { fontSize: 16, color: colors.text },
  selected: { color: colors.primary, fontWeight: "600" },
});
