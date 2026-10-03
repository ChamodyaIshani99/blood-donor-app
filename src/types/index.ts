import { BLOOD_GROUPS, DISTRICTS, URGENCY_LEVELS, REQUEST_STATUSES } from "../config/constants";

export type BloodGroup = (typeof BLOOD_GROUPS)[number];
export type District = (typeof DISTRICTS)[number];

export interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  district: District;
  area: string;
  isAvailable: boolean;
  isEligible: boolean;
  lastDonationDate: string | null;
  showPhone: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  district: District;
  area: string;
  phone: string | null; // null when the donor hides their number
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DonorSearchResponse {
  donors: Donor[];
  meta: PageMeta;
}

export interface DonorFilters {
  bloodGroup?: BloodGroup;
  district?: District;
  area?: string;
}

export type Urgency = (typeof URGENCY_LEVELS)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface BloodRequest {
  _id: string;
  // populated ({ _id, name }) in the feed and details, a plain id in "my requests"
  requester: string | { _id: string; name: string };
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  district: District;
  urgency: Urgency;
  neededBy: string;
  contactPhone: string;
  note: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestPage {
  requests: BloodRequest[];
  meta: PageMeta;
}

export interface RequestFilters {
  bloodGroup?: BloodGroup;
  district?: District;
}

export interface RequestInput {
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  district: District;
  urgency: Urgency;
  neededBy: string;
  contactPhone: string;
  note: string;
}
