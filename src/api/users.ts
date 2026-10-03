import { api } from "./client";
import { BloodGroup, District, User } from "../types";

export interface ProfileInput {
  name: string;
  bloodGroup: BloodGroup;
  district: District;
  area: string;
  showPhone: boolean;
  lastDonationDate: string | null; // YYYY-MM-DD
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const { data } = await api.put<{ user: User }>("/users/me", input);
  return data.user;
}
