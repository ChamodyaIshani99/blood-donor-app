import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { usePushRegistration, useNotificationEvents } from "../notifications/useNotifications";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import { navigationRef } from "./navigationRef";
import { colors } from "../theme";

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [navReady, setNavReady] = useState(false);

  usePushRegistration(user?._id);
  useNotificationEvents({ navReady, loggedIn: !!user });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavReady(true)}>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
