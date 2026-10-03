import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../components/Screen";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { BLOOD_GROUPS, DISTRICTS } from "../../config/constants";
import { AuthStackParamList } from "../../navigation/types";
import { getErrorMessage } from "../../utils/errors";
import { registerSchema, RegisterForm } from "../../utils/validation";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", email: "", password: "", confirmPassword: "", area: "" },
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _ignored, ...data }) => {
    setServerError(null);
    try {
      await register(data);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Screen>
      <Text style={styles.title}>Become a donor</Text>
      <Text style={styles.subtitle}>Create your account so people can find you when blood is needed.</Text>

      <ErrorBanner message={serverError} />

      <FormInput control={control} name="name" label="Full name" placeholder="Your name" autoCapitalize="words" />
      <FormInput
        control={control}
        name="phone"
        label="Mobile number"
        placeholder="07XXXXXXXX"
        keyboardType="phone-pad"
        maxLength={10}
      />
      <FormInput
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FormSelect control={control} name="bloodGroup" label="Blood group" options={BLOOD_GROUPS} />
      <FormSelect control={control} name="district" label="District" options={DISTRICTS} />
      <FormInput control={control} name="area" label="Area / town (optional)" placeholder="e.g. Maharagama" />
      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        autoCapitalize="none"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm password"
        placeholder="Re-enter password"
        secureTextEntry
        autoCapitalize="none"
      />

      <Button title="Create account" onPress={onSubmit} loading={isSubmitting} />

      <Pressable style={styles.link} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkBold}>Log in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  link: { alignItems: "center", marginTop: spacing.lg },
  linkText: { color: colors.muted, fontSize: 15 },
  linkBold: { color: colors.primary, fontWeight: "600" },
});
