import { api } from "./client";
import { DonorFilters, DonorSearchResponse } from "../types";

export const DONORS_PAGE_SIZE = 15;

export async function fetchDonors(filters: DonorFilters, page: number): Promise<DonorSearchResponse> {
  // axios encodes params, so "O+" is sent as O%2B
  const { data } = await api.get<DonorSearchResponse>("/donors", {
    params: { ...filters, page, limit: DONORS_PAGE_SIZE },
  });
  return data;
}
