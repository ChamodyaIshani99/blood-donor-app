import { useEffect, useState } from "react";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from "react-native";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { ChipRow } from "../../components/ChipRow";
import { DonorCard } from "../../components/DonorCard";
import { SelectModal } from "../../components/SelectModal";
import { useDonors } from "../../hooks/useDonors";
import { useDebounce } from "../../hooks/useDebounce";
import { BLOOD_GROUPS, DISTRICTS } from "../../config/constants";
import { MainTabParamList } from "../../navigation/types";
import { BloodGroup, District } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { colors, radius, spacing } from "../../theme";

type Props = BottomTabScreenProps<MainTabParamList, "Donors">;

export default function DonorsScreen({ route }: Props) {
  const preset = route.params;
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>(preset?.bloodGroup);
  const [district, setDistrict] = useState<District | undefined>(preset?.district);
  const [area, setArea] = useState("");

  // filters sent from the Home quick search (ts is new on every search)
  useEffect(() => {
    if (!preset?.ts) return;
    setBloodGroup(preset.bloodGroup);
    setDistrict(preset.district);
    setArea("");
  }, [preset?.ts]); // eslint-disable-line react-hooks/exhaustive-deps
  const [districtOpen, setDistrictOpen] = useState(false);

  const debouncedArea = useDebounce(area.trim(), 400);
  const query = useDonors({ bloodGroup, district, area: debouncedArea || undefined });

  const hasFilters = !!bloodGroup || !!district || area.length > 0;
  const resetFilters = () => {
    setBloodGroup(undefined);
    setDistrict(undefined);
    setArea("");
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
  };

  const renderBody = () => {
    if (query.isLoading) {
      return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;
    }
    if (query.isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{getErrorMessage(query.error)}</Text>
          <Button title="Try again" onPress={() => void query.refetch()} />
        </View>
      );
    }
    return (
      <FlatList
        data={query.donors}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => <DonorCard donor={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => void query.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>
            {query.total} donor{query.total === 1 ? "" : "s"} found
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No donors found</Text>
            <Text style={styles.emptyText}>
              Try a different district or remove some filters. Only donors who are available and
              eligible are shown.
            </Text>
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.primary} /> : null
        }
      />
    );
  };

  return (
    <Screen scroll={false}>
      <View style={styles.filters}>
        <Text style={styles.heading}>Find Donors</Text>

        <ChipRow options={BLOOD_GROUPS} value={bloodGroup} onChange={setBloodGroup} />

        <View style={styles.row}>
          <Pressable style={[styles.box, { flex: 1 }]} onPress={() => setDistrictOpen(true)}>
            <Text style={district ? styles.boxValue : styles.boxPlaceholder} numberOfLines={1}>
              {district ?? "All districts"}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>
          <TextInput
            style={[styles.box, styles.areaInput]}
            placeholder="Area / town"
            placeholderTextColor={colors.muted}
            value={area}
            onChangeText={setArea}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {hasFilters && (
          <Pressable onPress={resetFilters} hitSlop={8}>
            <Text style={styles.reset}>Clear filters</Text>
          </Pressable>
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
  filters: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  heading: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  box: {
    height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md,
  },
  areaInput: { flex: 1, fontSize: 15, color: colors.text },
  boxValue: { fontSize: 15, color: colors.text, flexShrink: 1 },
  boxPlaceholder: { fontSize: 15, color: colors.muted },
  chevron: { color: colors.muted },
  reset: { color: colors.primary, fontWeight: "600", marginTop: spacing.sm },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  count: { color: colors.muted, marginVertical: spacing.sm },
  center: { flex: 1, alignItems: "stretch", justifyContent: "center", padding: spacing.lg },
  errorText: { color: colors.error, textAlign: "center", marginBottom: spacing.md },
  empty: { alignItems: "center", padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: spacing.sm },
  emptyText: { color: colors.muted, textAlign: "center" },
});
