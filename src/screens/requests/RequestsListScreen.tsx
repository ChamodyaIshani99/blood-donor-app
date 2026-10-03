import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { ChipRow } from "../../components/ChipRow";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SelectModal } from "../../components/SelectModal";
import { RequestCard } from "../../components/RequestCard";
import { useRequests, useMyRequests } from "../../hooks/useRequests";
import { BLOOD_GROUPS, DISTRICTS, REQUEST_STATUSES } from "../../config/constants";
import { RequestsStackParamList } from "../../navigation/types";
import { BloodGroup, District, RequestStatus } from "../../types";
import { capitalize } from "../../utils/requests";
import { getErrorMessage } from "../../utils/errors";
import { colors, radius, spacing } from "../../theme";

type Props = NativeStackScreenProps<RequestsStackParamList, "RequestsList">;
type Mode = "all" | "mine";

export default function RequestsListScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>("all");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>();
  const [district, setDistrict] = useState<District | undefined>();
  const [status, setStatus] = useState<RequestStatus | undefined>();
  const [districtOpen, setDistrictOpen] = useState(false);

  // only the visible list fetches
  const feed = useRequests({ bloodGroup, district }, mode === "all");
  const mine = useMyRequests(status, mode === "mine");
  const list = mode === "all" ? feed : mine;

  const loadMore = () => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  };

  const renderBody = () => {
    if (list.isLoading) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;
    if (list.isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{getErrorMessage(list.error)}</Text>
          <Button title="Try again" onPress={() => void list.refetch()} />
        </View>
      );
    }
    return (
      <FlatList
        data={list.requests}
        keyExtractor={(r) => r._id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            showStatus={mode === "mine"}
            onPress={() => navigation.navigate("RequestDetails", { id: item._id })}
          />
        )}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching && !list.isFetchingNextPage}
            onRefresh={() => void list.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>
            {list.total} request{list.total === 1 ? "" : "s"}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{mode === "all" ? "No open requests" : "You have no requests yet"}</Text>
            <Text style={styles.emptyText}>
              {mode === "all"
                ? "Try removing a filter, or post a request if you need blood."
                : "Tap “Post request” when you need blood for someone."}
            </Text>
          </View>
        }
        ListFooterComponent={
          list.isFetchingNextPage ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.primary} /> : null
        }
      />
    );
  };

  return (
    <Screen scroll={false}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.heading}>Blood Requests</Text>
          <Pressable style={styles.postBtn} onPress={() => navigation.navigate("RequestForm")}>
            <Text style={styles.postText}>+ Post request</Text>
          </Pressable>
        </View>

        <SegmentedControl
          options={["all", "mine"] as const}
          value={mode}
          onChange={setMode}
          renderLabel={(m) => (m === "all" ? "All requests" : "My requests")}
        />

        {mode === "all" ? (
          <>
            <View style={{ marginTop: spacing.sm }}>
              <ChipRow options={BLOOD_GROUPS} value={bloodGroup} onChange={setBloodGroup} />
            </View>
            <Pressable style={styles.box} onPress={() => setDistrictOpen(true)}>
              <Text style={district ? styles.boxValue : styles.boxPlaceholder}>{district ?? "All districts"}</Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
          </>
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            <ChipRow options={REQUEST_STATUSES} value={status} onChange={setStatus} renderLabel={capitalize} />
          </View>
        )}
      </View>

      {renderBody()}

      <SelectModal
        visible={districtOpen}
        title="District"
        options={DISTRICTS}
        value={district}
        clearLabel="All districts"
        onSelect={(v) => setDistrict(v as District | undefined)}
        onClose={() => setDistrictOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  heading: { fontSize: 22, fontWeight: "700", color: colors.text },
  postBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  postText: { color: "#fff", fontWeight: "600" },
  box: {
    height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md, marginTop: spacing.sm,
  },
  boxValue: { fontSize: 15, color: colors.text },
  boxPlaceholder: { fontSize: 15, color: colors.muted },
  chevron: { color: colors.muted },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  count: { color: colors.muted, marginVertical: spacing.sm },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  errorText: { color: colors.error, textAlign: "center", marginBottom: spacing.md },
  empty: { alignItems: "center", padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: spacing.sm },
  emptyText: { color: colors.muted, textAlign: "center" },
});
