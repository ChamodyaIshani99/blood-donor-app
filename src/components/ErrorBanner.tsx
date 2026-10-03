import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  text: { color: colors.error, fontSize: 14 },
});
