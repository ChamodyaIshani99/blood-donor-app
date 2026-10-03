import { api } from "./client";
import { BloodRequest, RequestFilters, RequestInput, RequestPage, RequestStatus } from "../types";

export const REQUESTS_PAGE_SIZE = 15;

export async function fetchRequests(filters: RequestFilters, page: number): Promise<RequestPage> {
  const { data } = await api.get<RequestPage>("/requests", {
    params: { ...filters, status: "open", page, limit: REQUESTS_PAGE_SIZE },
  });
  return data;
}

export async function fetchMyRequests(status: RequestStatus | undefined, page: number): Promise<RequestPage> {
  const { data } = await api.get<RequestPage>("/requests/mine", {
    params: { status, page, limit: REQUESTS_PAGE_SIZE },
  });
  return data;
}

export async function fetchRequest(id: string): Promise<BloodRequest> {
  const { data } = await api.get<{ request: BloodRequest }>(`/requests/${id}`);
  return data.request;
}

export async function createRequest(input: RequestInput): Promise<BloodRequest> {
  const { data } = await api.post<{ request: BloodRequest }>("/requests", input);
  return data.request;
}

export async function updateRequest(id: string, input: RequestInput): Promise<BloodRequest> {
  const { data } = await api.put<{ request: BloodRequest }>(`/requests/${id}`, input);
  return data.request;
}

export async function setRequestStatus(id: string, status: "open" | "fulfilled"): Promise<BloodRequest> {
  const { data } = await api.patch<{ request: BloodRequest }>(`/requests/${id}/status`, { status });
  return data.request;
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/requests/${id}`);
}
