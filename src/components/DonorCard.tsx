import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Donor } from "../types";
import { colors, radius, spacing } from "../theme";

export function DonorCard({ donor }: { donor: Donor }) {
  const call = async () => {
    if (!donor.phone) return;
    try {
      await Linking.openURL(`tel:${donor.phone}`);
    } catch {
      Alert.alert("Cannot place call", "Your device could not open the phone app.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{donor.bloodGroup}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{donor.name}</Text>
        <Text style={styles.place} numberOfLines={1}>
          {donor.area ? `${donor.area}, ` : ""}
          {donor.district}
        </Text>
        <Text style={styles.phone}>{donor.phone ?? "Phone number hidden by donor"}</Text>
      </View>

      {donor.phone && (
        <Pressable
          onPress={call}
          style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.7 }]}
          accessibilityLabel={`Call ${donor.name}`}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  badge: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  info: { flex: 1, marginHorizontal: spacing.md },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  place: { fontSize: 13, color: colors.muted, marginTop: 2 },
  phone: { fontSize: 13, color: colors.text, marginTop: 2 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.success,
    alignItems: "center", justifyContent: "center",
  },
});
