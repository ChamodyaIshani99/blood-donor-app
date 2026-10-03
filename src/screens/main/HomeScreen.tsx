import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { ChipRow } from "../../components/ChipRow";
import { RequestCard } from "../../components/RequestCard";
import { SelectModal } from "../../components/SelectModal";
import { useAuth } from "../../context/AuthContext";
import { useAvailabilityToggle } from "../../hooks/useAvailabilityToggle";
import { useRequests } from "../../hooks/useRequests";
import { BLOOD_GROUPS, DISTRICTS } from "../../config/constants";
import { MainTabParamList } from "../../navigation/types";
import { BloodGroup, District } from "../../types";
import { canDonateTo, requesterId } from "../../utils/requests";
import { colors, radius, spacing } from "../../theme";

type Props = BottomTabScreenProps<MainTabParamList, "Home">;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { toggle, saving } = useAvailabilityToggle();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>();
  const [district, setDistrict] = useState<District | undefined>(user?.district);
  const [districtOpen, setDistrictOpen] = useState(false);

  // open requests in the user's district (API returns Critical first)
  const feed = useRequests({ district: user?.district }, !!user);

  // requests this user's blood can actually help with (same rule the push notifications use)
  const helpRequests = useMemo(() => {
    if (!user) return [];
    return feed.requests
      .filter((r) => canDonateTo(user.bloodGroup, r.bloodGroup) && requesterId(r) !== user._id)
      .slice(0, 3);
  }, [feed.requests, user]);

  if (!user) return null;

  const openRequest = (id: string) =>
    navigation.navigate("Requests", { screen: "RequestDetails", params: { id }, initial: false });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching}
            onRefresh={() => void feed.refetch()}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.greeting}>
          {greeting()}, {user.name.split(" ")[0]}
        </Text>
        <Text style={styles.subtitle}>Blood group {user.bloodGroup} · {user.district}</Text>

        {/* availability */}
        <View style={[styles.card, styles.availRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {user.isAvailable ? "You are available to donate" : "You are hidden from searches"}
            </Text>
            {!user.isEligible && (
              <Text style={styles.warning}>You donated recently, so you are not shown until you are eligible again.</Text>
            )}
          </View>
          <Switch
            value={user.isAvailable}
            onValueChange={toggle}
            disabled={saving}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {/* quick search */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need blood?</Text>
          <ChipRow options={BLOOD_GROUPS} value={bloodGroup} onChange={setBloodGroup} allLabel="Any" />
          <Pressable style={styles.box} onPress={() => setDistrictOpen(true)}>
            <Text style={district ? styles.boxValue : styles.boxPlaceholder}>{district ?? "All districts"}</Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>
          <View style={styles.buttons}>
            <Button
              title="Search donors"
              onPress={() => navigation.navigate("Donors", { bloodGroup, district, ts: Date.now() })}
            />
            <Button
              title="Post a blood request"
              variant="outline"
              onPress={() => navigation.navigate("Requests", { screen: "RequestForm", initial: false })}
            />
          </View>
        </View>

        {/* requests the user can help with */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Needs your help in {user.district}</Text>
          <Pressable onPress={() => navigation.navigate("Requests", { screen: "RequestsList" })} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {feed.isLoading ? (
          <ActivityIndicator style={{ margin: spacing.lg }} color={colors.primary} />
        ) : feed.isError ? (
          <Pressable onPress={() => void feed.refetch()}>
            <Text style={styles.errorText}>Could not load requests. Tap to try again.</Text>
          </Pressable>
        ) : helpRequests.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No open requests in {user.district} that match your blood group right now. Thank you for being ready to help.
            </Text>
          </View>
        ) : (
          helpRequests.map((r) => <RequestCard key={r._id} request={r} onPress={() => openRequest(r._id)} />)
        )}
      </ScrollView>

      <SelectModal
        visible={districtOpen}
        title="District"
        options={DISTRICTS}
        value={district}
        clearLabel="All districts"
        onSelect={(v) => setDistrict(v as District | undefined)}
        onClose={() => setDistrictOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  greeting: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius, padding: spacing.md, marginBottom: spacing.lg },
  availRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  warning: { color: colors.error, fontSize: 13, marginTop: spacing.xs },
  box: {
    height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: colors.border, borderRadius: radius,
    backgroundColor: colors.bg, paddingHorizontal: spacing.md, marginTop: spacing.sm,
  },
  boxValue: { fontSize: 15, color: colors.text },
  boxPlaceholder: { fontSize: 15, color: colors.muted },
  chevron: { color: colors.muted },
  buttons: { gap: spacing.sm, marginTop: spacing.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text, flex: 1 },
  seeAll: { color: colors.primary, fontWeight: "600" },
  errorText: { color: colors.error, textAlign: "center", marginVertical: spacing.md },
  empty: { backgroundColor: colors.surface, borderRadius: radius, padding: spacing.md },
  emptyText: { color: colors.muted },
});
