import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme";

interface Props<T extends string> {
  options: readonly T[];
  value?: T;
  onChange: (value: T | undefined) => void;
  allLabel?: string; // adds a first chip that clears the selection
  renderLabel?: (value: T) => string;
}

export function ChipRow<T extends string>({ options, value, onChange, allLabel = "All", renderLabel }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label={allLabel} active={value === undefined} onPress={() => onChange(undefined)} />
      {options.map((o) => (
        <Chip key={o} label={renderLabel ? renderLabel(o) : o} active={value === o} onPress={() => onChange(o)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
});
