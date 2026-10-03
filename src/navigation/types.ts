import { NavigatorScreenParams } from "@react-navigation/native";
import { BloodGroup, District } from "../types";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  // ts changes on every quick search so the same filters can be applied again
  Donors: { bloodGroup?: BloodGroup; district?: District; ts?: number } | undefined;
  Requests: NavigatorScreenParams<RequestsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RequestsStackParamList = {
  RequestsList: undefined;
  RequestDetails: { id: string };
  RequestForm: { id?: string } | undefined; // id = edit that request
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};
