import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../components/Screen";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";
import { getErrorMessage } from "../../utils/errors";
import { loginSchema, LoginForm } from "../../utils/validation";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    setServerError(null);
    try {
      await login(identifier, password);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.logo}>🩸</Text>
        <Text style={styles.title}>Blood Donor Finder</Text>
        <Text style={styles.subtitle}>Find a donor fast, or help someone in need.</Text>
      </View>

      <ErrorBanner message={serverError} />

      <FormInput
        control={control}
        name="identifier"
        label="Email or mobile number"
        placeholder="you@example.com or 07XXXXXXXX"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="Your password"
        secureTextEntry
        autoCapitalize="none"
      />

      <Button title="Log in" onPress={onSubmit} loading={isSubmitting} />

      <Pressable style={styles.link} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>
          New here? <Text style={styles.linkBold}>Create an account</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginVertical: spacing.xl },
  logo: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: "700", color: colors.primary, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.xs, textAlign: "center" },
  link: { alignItems: "center", marginTop: spacing.lg },
  linkText: { color: colors.muted, fontSize: 15 },
  linkBold: { color: colors.primary, fontWeight: "600" },
});
