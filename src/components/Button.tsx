import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
}

export function Button({ title, onPress, loading, disabled, variant = "primary" }: Props) {
  const outline = variant === "outline";
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        outline ? styles.outline : styles.primary,
        (pressed || inactive) && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.text, outline && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 50, borderRadius: radius, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: "transparent" },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
