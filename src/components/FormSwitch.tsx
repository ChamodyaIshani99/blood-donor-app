import { StyleSheet, Switch, Text, View } from "react-native";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { colors, radius, spacing } from "../theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
};

export function FormSwitch<T extends FieldValues>({ control, name, label, hint }: Props<T>) {
  const { field } = useController({ control, name });
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {!!hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <Switch value={!!field.value} onValueChange={field.onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: { fontSize: 16, fontWeight: "500", color: colors.text },
  hint: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
