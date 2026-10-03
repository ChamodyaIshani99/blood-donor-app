import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Tag } from "../../components/Tag";
import { useAuth } from "../../context/AuthContext";
import { useRequest } from "../../hooks/useRequests";
import { deleteRequest, setRequestStatus } from "../../api/requests";
import { RequestsStackParamList } from "../../navigation/types";
import { formatISODate } from "../../utils/dates";
import { getErrorMessage } from "../../utils/errors";
import { callNumber, capitalize, requesterId, requesterName, statusColor, urgencyColor } from "../../utils/requests";
import { colors, radius, spacing } from "../../theme";

type Props = NativeStackScreenProps<RequestsStackParamList, "RequestDetails">;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function RequestDetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useRequest(id);

  const refreshLists = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["requests"] }),
      queryClient.invalidateQueries({ queryKey: ["my-requests"] }),
    ]);

  const fulfilled = useMutation({
    mutationFn: () => setRequestStatus(id, "fulfilled"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["request", id] });
      await refreshLists();
    },
    onError: (e) => Alert.alert("Could not update", getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: () => deleteRequest(id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["request", id] });
      await refreshLists();
      navigation.goBack();
    },
    onError: (e) => Alert.alert("Could not delete", getErrorMessage(e)),
  });

  if (query.isLoading) {
    return (
      <Screen topInset={false} scroll={false}>
        <ActivityIndicator style={styles.center} size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen topInset={false} scroll={false}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{getErrorMessage(query.error)}</Text>
          <Button title="Try again" onPress={() => void query.refetch()} />
        </View>
      </Screen>
    );
  }

  const r = query.data;
  const isOwner = !!user && requesterId(r) === user._id;
  const isOpen = r.status === "open";
  const poster = requesterName(r);

  const confirmFulfilled = () =>
    Alert.alert("Mark as fulfilled", "Did you get the blood you needed? The request will be closed.", [
      { text: "Not yet", style: "cancel" },
      { text: "Yes, fulfilled", onPress: () => fulfilled.mutate() },
    ]);

  const confirmDelete = () =>
    Alert.alert("Delete request", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate() },
    ]);

  return (
    <Screen topInset={false}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{r.bloodGroup}</Text>
        </View>
        <View style={styles.tags}>
          <Tag label={r.urgency} color={urgencyColor(r.urgency)} />
          {!isOpen && <Tag label={capitalize(r.status)} color={statusColor(r.status)} />}
        </View>
        <Text style={styles.hospital}>{r.hospital}</Text>
        <Text style={styles.sub}>{r.district}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Units needed" value={String(r.units)} />
        <Row label="Needed by" value={formatISODate(r.neededBy)} />
        {!!r.patientName && <Row label="Patient" value={r.patientName} />}
        {poster && <Row label="Posted by" value={isOwner ? `${poster} (you)` : poster} />}
      </View>

      {!!r.note && (
        <View style={styles.card}>
          <Text style={styles.noteLabel}>Note</Text>
          <Text style={styles.note}>{r.note}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.noteLabel}>Contact</Text>
        <Text style={styles.phone}>{r.contactPhone}</Text>
        {isOpen && (
          <View style={{ marginTop: spacing.md }}>
            <Button title={`Call ${r.contactPhone}`} onPress={() => void callNumber(r.contactPhone)} />
          </View>
        )}
      </View>

      {isOwner && (
        <View style={styles.actions}>
          {isOpen && (
            <>
              <Button title="Mark as fulfilled" onPress={confirmFulfilled} loading={fulfilled.isPending} />
              <Button title="Edit request" variant="outline" onPress={() => navigation.navigate("RequestForm", { id })} />
            </>
          )}
          <Button title="Delete request" variant="outline" onPress={confirmDelete} loading={remove.isPending} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  errorText: { color: colors.error, textAlign: "center", marginBottom: spacing.md },
  header: { alignItems: "center", marginBottom: spacing.lg },
  badge: {
    width: 84, height: 84, borderRadius: radius * 2, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  tags: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  hospital: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: spacing.md, textAlign: "center" },
  sub: { color: colors.muted, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius, padding: spacing.md, marginBottom: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.text, fontWeight: "500", flexShrink: 1, textAlign: "right" },
  noteLabel: { color: colors.muted, marginBottom: spacing.xs },
  note: { color: colors.text, fontSize: 15 },
  phone: { color: colors.text, fontSize: 18, fontWeight: "600" },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
