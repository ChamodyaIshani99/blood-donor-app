import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestsListScreen from "../screens/requests/RequestsListScreen";
import RequestDetailsScreen from "../screens/requests/RequestDetailsScreen";
import RequestFormScreen from "../screens/requests/RequestFormScreen";
import { RequestsStackParamList } from "./types";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<RequestsStackParamList>();

export default function RequestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerBackTitle: "Back" }}>
      <Stack.Screen name="RequestsList" component={RequestsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} options={{ title: "Request details" }} />
      <Stack.Screen
        name="RequestForm"
        component={RequestFormScreen}
        options={({ route }) => ({ title: route.params?.id ? "Edit request" : "Post a request" })}
      />
    </Stack.Navigator>
  );
}
