import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { SelectModal } from "./SelectModal";
import { formatISODate, upcomingDates } from "../utils/dates";
import { colors, radius, spacing } from "../theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
};

// value is stored as "YYYY-MM-DD"; the list shows today + the next 30 days
export function FormDateSelect<T extends FieldValues>({ control, name, label, placeholder = "Select date" }: Props<T>) {
  const { field, fieldState } = useController({ control, name });
  const [open, setOpen] = useState(false);
  const error = fieldState.error?.message;
  const value = field.value as string | undefined;

  const options = useMemo(() => {
    const list = upcomingDates(30);
    // when editing, keep a saved date that is outside the next 30 days
    if (value && !list.some((o) => o.iso === value)) list.push({ iso: value, label: formatISODate(value) });
    return list;
  }, [value]);

  const selected = options.find((o) => o.iso === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.box, !!error && styles.boxError]} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>{selected?.label ?? placeholder}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <SelectModal
        visible={open}
        title={label}
        options={options.map((o) => o.label)}
        value={selected?.label}
        onSelect={(picked) => {
          const match = options.find((o) => o.label === picked);
          if (match) field.onChange(match.iso);
          field.onBlur();
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  box: {
    height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md,
  },
  boxError: { borderColor: colors.error },
  value: { fontSize: 16, color: colors.text },
  placeholder: { fontSize: 16, color: colors.muted },
  chevron: { color: colors.muted, fontSize: 16 },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.xs },
});
