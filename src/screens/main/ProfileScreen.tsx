import { useCallback, useState } from "react";
import { Alert, Linking, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useAvailabilityToggle } from "../../hooks/useAvailabilityToggle";
import { getPermissionStatus, PushPermission, registerAndSyncPush } from "../../notifications/push";
import { ProfileStackParamList } from "../../navigation/types";
import { formatISODate } from "../../utils/dates";
import { colors, radius, spacing } from "../../theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileMain">;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { toggle: toggleAvailability, saving } = useAvailabilityToggle();
  const [pushStatus, setPushStatus] = useState<PushPermission>("undetermined");

  // re-check when the tab is shown (the user may have changed it in system settings)
  useFocusEffect(
    useCallback(() => {
      void getPermissionStatus().then(setPushStatus);
    }, [])
  );

  if (!user) return null;

  const enableNotifications = async () => {
    await registerAndSyncPush(true);
    setPushStatus(await getPermissionStatus());
  };

  const confirmLogout = () =>
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => void logout() },
    ]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.bloodGroup}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.sub}>
          {user.area ? `${user.area}, ` : ""}
          {user.district}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Available to donate</Text>
            <Text style={styles.switchHint}>
              {user.isAvailable ? "People can find you in searches." : "You are hidden from searches."}
            </Text>
          </View>
          <Switch
            value={user.isAvailable}
            onValueChange={toggleAvailability}
            disabled={saving}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {!user.isEligible && (
          <Text style={styles.warning}>
            You donated recently, so you will not appear in searches until you are eligible again.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.switchTitle}>Request alerts</Text>
        {pushStatus === "granted" && (
          <Text style={styles.switchHint}>
            On. You will be notified when someone in your district needs your blood group.
          </Text>
        )}
        {pushStatus === "undetermined" && (
          <>
            <Text style={styles.switchHint}>Turn on notifications to get urgent blood requests near you.</Text>
            <View style={styles.cardButton}>
              <Button title="Enable notifications" onPress={() => void enableNotifications()} />
            </View>
          </>
        )}
        {pushStatus === "denied" && (
          <>
            <Text style={styles.switchHint}>Notifications are turned off for this app.</Text>
            <View style={styles.cardButton}>
              <Button title="Open settings" variant="outline" onPress={() => void Linking.openSettings()} />
            </View>
          </>
        )}
        {pushStatus === "unsupported" && (
          <Text style={styles.switchHint}>
            Push notifications need a development build. They are not available in Expo Go on Android.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Row label="Mobile" value={user.phone} />
        <Row label="Email" value={user.email} />
        <Row label="Phone visible to others" value={user.showPhone ? "Yes" : "No"} />
        <Row
          label="Last donation"
          value={user.lastDonationDate ? formatISODate(user.lastDonationDate) : "Not set"}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Edit profile" onPress={() => navigation.navigate("EditProfile")} />
        <Button title="Log out" variant="outline" onPress={confirmLogout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginVertical: spacing.lg },
  badge: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: spacing.md },
  sub: { color: colors.muted, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius, padding: spacing.md, marginBottom: spacing.md },
  switchRow: { flexDirection: "row", alignItems: "center" },
  switchTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  switchHint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  warning: { marginTop: spacing.md, color: colors.error, fontSize: 13 },
  cardButton: { marginTop: spacing.md },
  actions: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.text, fontWeight: "500" },
});
