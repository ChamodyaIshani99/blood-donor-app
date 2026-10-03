import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../components/Screen";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { FormSwitch } from "../../components/FormSwitch";
import { FormDonationDate } from "../../components/FormDonationDate";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/users";
import { BLOOD_GROUPS, DISTRICTS, DONATION_GAP_DAYS } from "../../config/constants";
import { ProfileStackParamList } from "../../navigation/types";
import { User } from "../../types";
import { addDays, daysAgo, formatISODate } from "../../utils/dates";
import { getErrorMessage } from "../../utils/errors";
import { profileSchema, ProfileForm } from "../../utils/validation";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditProfile">;

// a saved donation older than the waiting period is shown as "not set"
function initialDonationDate(user: User): string {
  if (!user.lastDonationDate) return "";
  const iso = user.lastDonationDate.slice(0, 10);
  const age = daysAgo(iso);
  return age >= 0 && age < DONATION_GAP_DAYS ? iso : "";
}

export default function EditProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: user
      ? {
          name: user.name,
          bloodGroup: user.bloodGroup,
          district: user.district,
          area: user.area,
          lastDonationDate: initialDonationDate(user),
          showPhone: user.showPhone,
        }
      : undefined,
  });

  const lastDonation = useWatch({ control, name: "lastDonationDate" });
  const eligibleOn = lastDonation ? addDays(lastDonation, DONATION_GAP_DAYS) : null;
  const stillWaiting = !!lastDonation && daysAgo(lastDonation) < DONATION_GAP_DAYS;

  const onSubmit = handleSubmit(async ({ lastDonationDate, ...rest }) => {
    setServerError(null);
    try {
      const updated = await updateProfile({ ...rest, lastDonationDate: lastDonationDate || null });
      setUser(updated);
      navigation.goBack();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Screen topInset={false}>
      <ErrorBanner message={serverError} />

      <FormInput control={control} name="name" label="Full name" autoCapitalize="words" />
      <FormSelect control={control} name="bloodGroup" label="Blood group" options={BLOOD_GROUPS} />
      <Text style={styles.warn}>Double-check this: donors and requests are matched by blood group.</Text>
      <FormSelect control={control} name="district" label="District" options={DISTRICTS} />
      <FormInput control={control} name="area" label="Area / town" placeholder="e.g. Maharagama" />

      <FormDonationDate control={control} name="lastDonationDate" label="Last blood donation" />
      <Text style={styles.hint}>
        {stillWaiting && eligibleOn
          ? `You will be hidden from searches until ${formatISODate(eligibleOn)}.`
          : "Set this after you donate so people are not shown a donor who cannot give yet."}
      </Text>

      <View style={{ height: spacing.md }} />
      <FormSwitch
        control={control}
        name="showPhone"
        label="Show my phone number"
        hint="When off, people can find you but cannot see or call your number."
      />

      <View style={styles.readonly}>
        <Text style={styles.readonlyText}>Mobile: {user?.phone}</Text>
        <Text style={styles.readonlyText}>Email: {user?.email}</Text>
      </View>

      <Button title="Save changes" onPress={onSubmit} loading={isSubmitting} disabled={!isDirty} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  warn: { color: colors.muted, fontSize: 13, marginTop: -spacing.sm, marginBottom: spacing.md },
  hint: { color: colors.muted, fontSize: 13 },
  readonly: { marginBottom: spacing.lg, gap: 2 },
  readonlyText: { color: colors.muted, fontSize: 13 },
});
