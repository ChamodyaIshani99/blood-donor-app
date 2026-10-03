import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/main/ProfileScreen";
import EditProfileScreen from "../screens/main/EditProfileScreen";
import { ProfileStackParamList } from "./types";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerBackTitle: "Back" }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit profile" }} />
    </Stack.Navigator>
  );
}
