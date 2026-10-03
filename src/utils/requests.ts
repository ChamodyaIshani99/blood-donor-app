import { Alert, Linking } from "react-native";
import { COMPATIBLE_DONORS } from "../config/constants";
import { BloodGroup, BloodRequest, RequestStatus, Urgency } from "../types";
import { colors } from "../theme";

export const requesterId = (r: BloodRequest) => (typeof r.requester === "string" ? r.requester : r.requester._id);

export const requesterName = (r: BloodRequest) => (typeof r.requester === "string" ? null : r.requester.name);

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const urgencyColor = (u: Urgency) =>
  u === "Critical" ? colors.primary : u === "Urgent" ? colors.warning : colors.neutral;

export const statusColor = (s: RequestStatus) => (s === "fulfilled" ? colors.success : colors.neutral);

export async function callNumber(phone: string) {
  try {
    await Linking.openURL(`tel:${phone}`);
  } catch {
    Alert.alert("Cannot place call", "Your device could not open the phone app.");
  }
}

// can a donor with `donor` blood give to a patient who needs `patient`?
export const canDonateTo = (donor: BloodGroup, patient: BloodGroup) => COMPATIBLE_DONORS[patient].includes(donor);
