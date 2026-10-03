import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { navigationRef } from "../navigation/navigationRef";
import { pushSupported, registerAndSyncPush } from "./push";

// register this device for push whenever a user logs in / the app opens with a saved session
export function usePushRegistration(userId?: string) {
  useEffect(() => {
    if (!userId) return;
    void registerAndSyncPush(true);
  }, [userId]);
}

// - refresh the requests feed when a notification arrives while the app is open
// - open the request when a notification is tapped (also when it launched the app)
export function useNotificationEvents({ navReady, loggedIn }: { navReady: boolean; loggedIn: boolean }) {
  const queryClient = useQueryClient();
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!pushSupported) return;

    const take = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification.request.content.data;
      if (data?.type === "blood_request" && typeof data.requestId === "string") {
        setPendingRequestId(data.requestId);
      }
    };

    Notifications.getLastNotificationResponseAsync().then(take).catch(() => undefined);

    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    });
    const tapped = Notifications.addNotificationResponseReceivedListener(take);

    return () => {
      received.remove();
      tapped.remove();
    };
  }, [queryClient]);

  // wait until the user is logged in and the navigator is ready, then open the request
  useEffect(() => {
    if (!pendingRequestId || !navReady || !loggedIn || !navigationRef.isReady()) return;
    navigationRef.navigate("Requests", { screen: "RequestDetails", params: { id: pendingRequestId }, initial: false });
    setPendingRequestId(null);
  }, [pendingRequestId, navReady, loggedIn]);
}
