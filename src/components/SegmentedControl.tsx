import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

interface Props<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  renderLabel?: (value: T) => string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, renderLabel }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} style={[styles.item, active && styles.itemActive]} onPress={() => onChange(o)}>
            <Text style={[styles.text, active && styles.textActive]}>{renderLabel ? renderLabel(o) : o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius, padding: 3 },
  item: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: radius - 2 },
  itemActive: { backgroundColor: colors.primary },
  text: { color: colors.text, fontWeight: "500" },
  textActive: { color: "#fff", fontWeight: "600" },
});
