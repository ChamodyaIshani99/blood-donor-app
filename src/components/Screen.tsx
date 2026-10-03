import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

interface Props {
  children: ReactNode;
  scroll?: boolean;
  topInset?: boolean; // false when a navigation header already handles the top safe area
}

export function Screen({ children, scroll = true, topInset = true }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={topInset ? ["top"] : []}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={topInset ? 0 : 90}
      >
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <>{children}</>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
});
