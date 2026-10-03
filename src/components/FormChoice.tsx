import { StyleSheet, Text, View } from "react-native";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { SegmentedControl } from "./SegmentedControl";
import { colors, spacing } from "../theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: readonly string[];
};

export function FormChoice<T extends FieldValues>({ control, name, label, options }: Props<T>) {
  const { field } = useController({ control, name });
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <SegmentedControl options={options} value={field.value as string} onChange={field.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
});
