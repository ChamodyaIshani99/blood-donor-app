import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tag } from "./Tag";
import { BloodRequest } from "../types";
import { formatISODate } from "../utils/dates";
import { capitalize, statusColor, urgencyColor } from "../utils/requests";
import { colors, radius, spacing } from "../theme";

interface Props {
  request: BloodRequest;
  showStatus?: boolean;
  onPress: () => void;
}

export function RequestCard({ request, showStatus, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{request.bloodGroup}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.hospital} numberOfLines={1}>{request.hospital}</Text>
        <Text style={styles.meta}>
          {request.units} unit{request.units === 1 ? "" : "s"} · {request.district}
        </Text>
        <Text style={styles.meta}>Needed by {formatISODate(request.neededBy)}</Text>
      </View>

      <View style={styles.tags}>
        <Tag label={request.urgency} color={urgencyColor(request.urgency)} />
        {showStatus && request.status !== "open" && (
          <Tag label={capitalize(request.status)} color={statusColor(request.status)} />
        )}
      </View>
    </Pressable>
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
    width: 52, height: 52, borderRadius: radius, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  info: { flex: 1, marginHorizontal: spacing.md },
  hospital: { fontSize: 16, fontWeight: "600", color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  tags: { gap: spacing.xs, alignItems: "flex-end" },
});
