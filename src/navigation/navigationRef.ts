import { createNavigationContainerRef } from "@react-navigation/native";
import { MainTabParamList } from "./types";

// lets code outside a screen (e.g. a notification tap) navigate
export const navigationRef = createNavigationContainerRef<MainTabParamList>();
