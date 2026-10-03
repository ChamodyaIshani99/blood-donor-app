import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { colors, radius, spacing } from "../theme";

type Props<T extends FieldValues> = Omit<TextInputProps, "value" | "onChangeText"> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

export function FormInput<T extends FieldValues>({ control, name, label, secureTextEntry, ...rest }: Props<T>) {
  const { field, fieldState } = useController({ control, name });
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const error = fieldState.error?.message;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !!error && styles.inputError]}>
        <TextInput
          {...rest}
          style={styles.input}
          value={(field.value as string | undefined) ?? ""}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          secureTextEntry={hidden}
          placeholderTextColor={colors.muted}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Text style={styles.toggle}>{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, height: 48, fontSize: 16, color: colors.text },
  toggle: { color: colors.primary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.xs },
});
