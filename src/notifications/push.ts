import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { api } from "../api/client";

export const CHANNEL_ID = "blood-requests"; // must match channelId sent by the API

// Remote push is not available in Expo Go on Android (SDK 53+): a development build is needed.
export const pushSupported = !(Platform.OS === "android" && Constants.executionEnvironment === ExecutionEnvironment.StoreClient);

if (pushSupported) {
  // show notifications as a banner even while the app is open
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PushPermission = "granted" | "denied" | "undetermined" | "unsupported";

export async function getPermissionStatus(): Promise<PushPermission> {
  if (!pushSupported) return "unsupported";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return "unsupported";
  }
}

// asks for permission (if allowed) and returns the Expo push token, or null if not possible
export async function registerForPushAsync(ask = true): Promise<string | null> {
  if (!pushSupported || !Device.isDevice) return null; // push only works on a physical device

  try {
    if (Platform.OS === "android") {
      // the channel must exist before a token is requested
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Blood requests",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C62828",
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted" && ask) {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn("Push: no EAS projectId found. Run `eas init` and build a development build.");
      return null;
    }
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (error) {
    console.warn("Push registration failed:", error);
    return null;
  }
}

// gets the token and saves it on the server for the logged-in user. Returns true if saved.
export async function registerAndSyncPush(ask = true): Promise<boolean> {
  const token = await registerForPushAsync(ask);
  if (!token) return false;
  try {
    await api.post("/users/me/push-token", { token });
    return true;
  } catch (error) {
    console.warn("Could not save push token:", error);
    return false;
  }
}
