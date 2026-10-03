import { StyleSheet, Text, View } from "react-native";

export function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" },
  text: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
