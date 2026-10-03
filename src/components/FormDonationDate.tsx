import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { SelectModal } from "./SelectModal";
import { DONATION_GAP_DAYS } from "../config/constants";
import { pastDates } from "../utils/dates";
import { colors, radius, spacing } from "../theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

const NOT_SET = "Not set / more than 3 months ago";

// stored as "YYYY-MM-DD", or "" when not set. Donations older than the waiting period do not matter,
// so only the last (DONATION_GAP_DAYS - 1) days are offered.
export function FormDonationDate<T extends FieldValues>({ control, name, label }: Props<T>) {
  const { field } = useController({ control, name });
  const [open, setOpen] = useState(false);
  const value = (field.value as string | undefined) ?? "";

  const options = useMemo(() => pastDates(DONATION_GAP_DAYS - 1), []);
  const selected = options.find((o) => o.iso === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.box} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>{selected?.label ?? NOT_SET}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <SelectModal
        visible={open}
        title={label}
        options={options.map((o) => o.label)}
        value={selected?.label}
        clearLabel={NOT_SET}
        onSelect={(picked) => {
          const match = options.find((o) => o.label === picked);
          field.onChange(match ? match.iso : "");
          field.onBlur();
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  box: {
    height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md,
  },
  value: { fontSize: 16, color: colors.text },
  placeholder: { fontSize: 16, color: colors.muted },
  chevron: { color: colors.muted, fontSize: 16 },
});
