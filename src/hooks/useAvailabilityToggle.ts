import { useState } from "react";
import { Alert } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { User } from "../types";
import { getErrorMessage } from "../utils/errors";

export function useAvailabilityToggle() {
  const { setUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const toggle = async (isAvailable: boolean) => {
    setSaving(true);
    try {
      const { data } = await api.patch<{ user: User }>("/users/me/availability", { isAvailable });
      setUser(data.user);
    } catch (error) {
      Alert.alert("Could not update", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return { toggle, saving };
}
