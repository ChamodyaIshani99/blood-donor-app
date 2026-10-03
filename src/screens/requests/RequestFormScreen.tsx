import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../components/Screen";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { FormChoice } from "../../components/FormChoice";
import { FormDateSelect } from "../../components/FormDateSelect";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { useRequest } from "../../hooks/useRequests";
import { createRequest, updateRequest } from "../../api/requests";
import { BLOOD_GROUPS, DISTRICTS, URGENCY_LEVELS } from "../../config/constants";
import { RequestsStackParamList } from "../../navigation/types";
import { getErrorMessage } from "../../utils/errors";
import { requestSchema, RequestForm } from "../../utils/validation";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<RequestsStackParamList, "RequestForm">;

const UNIT_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function RequestFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const isEdit = !!id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const existing = useRequest(id);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: "",
      units: "1",
      hospital: "",
      district: user?.district,
      urgency: "Normal",
      neededBy: "",
      contactPhone: user?.phone ?? "",
      note: "",
    },
  });

  // edit mode: fill the form once the request is loaded
  useEffect(() => {
    const r = existing.data;
    if (!r) return;
    reset({
      patientName: r.patientName,
      bloodGroup: r.bloodGroup,
      units: String(r.units),
      hospital: r.hospital,
      district: r.district,
      urgency: r.urgency,
      neededBy: r.neededBy.slice(0, 10),
      contactPhone: r.contactPhone,
      note: r.note,
    });
  }, [existing.data, reset]);

  const refreshLists = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["requests"] }),
      queryClient.invalidateQueries({ queryKey: ["my-requests"] }),
    ]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const input = { ...values, units: Number(values.units) };
    try {
      if (isEdit && id) {
        await updateRequest(id, input);
        await queryClient.invalidateQueries({ queryKey: ["request", id] });
        await refreshLists();
        navigation.goBack();
      } else {
        const created = await createRequest(input);
        await refreshLists();
        navigation.replace("RequestDetails", { id: created._id });
      }
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  if (isEdit && existing.isLoading) {
    return (
      <Screen topInset={false} scroll={false}>
        <ActivityIndicator style={styles.center} size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (isEdit && existing.isError) {
    return (
      <Screen topInset={false} scroll={false}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{getErrorMessage(existing.error)}</Text>
          <Button title="Try again" onPress={() => void existing.refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen topInset={false}>
      <ErrorBanner message={serverError} />

      <FormSelect control={control} name="bloodGroup" label="Blood group needed" options={BLOOD_GROUPS} />
      <FormSelect control={control} name="units" label="Units needed" options={UNIT_OPTIONS} />
      <FormChoice control={control} name="urgency" label="Urgency" options={URGENCY_LEVELS} />
      <FormDateSelect control={control} name="neededBy" label="Needed by" />
      <FormInput control={control} name="hospital" label="Hospital" placeholder="e.g. National Hospital, Colombo" />
      <FormSelect control={control} name="district" label="District" options={DISTRICTS} />
      <FormInput
        control={control}
        name="patientName"
        label="Patient name (optional)"
        placeholder="Name of the patient"
        autoCapitalize="words"
      />
      <FormInput
        control={control}
        name="contactPhone"
        label="Contact number"
        placeholder="07XXXXXXXX"
        keyboardType="phone-pad"
        maxLength={10}
      />
      <FormInput
        control={control}
        name="note"
        label="Note (optional)"
        placeholder="Ward number, surgery time, anything donors should know"
        multiline
        numberOfLines={3}
        maxLength={500}
      />

      {!isEdit && (
        <Text style={styles.hint}>
          Compatible donors in this district who are available will get a notification.
        </Text>
      )}

      <Button title={isEdit ? "Save changes" : "Post request"} onPress={onSubmit} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  errorText: { color: colors.error, textAlign: "center", marginBottom: spacing.md },
  hint: { color: colors.muted, fontSize: 13, marginBottom: spacing.md },
});
