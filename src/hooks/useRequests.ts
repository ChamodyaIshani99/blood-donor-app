import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchMyRequests, fetchRequest, fetchRequests } from "../api/requests";
import { RequestFilters, RequestPage, RequestStatus } from "../types";

const nextPage = (last: RequestPage) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined);

// the open requests feed (everyone's)
export function useRequests(filters: RequestFilters, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ["requests", filters],
    queryFn: ({ pageParam }) => fetchRequests(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled,
  });
  return {
    ...query,
    requests: query.data?.pages.flatMap((p) => p.requests) ?? [],
    total: query.data?.pages[0]?.meta.total ?? 0,
  };
}

// requests posted by the logged-in user
export function useMyRequests(status: RequestStatus | undefined, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ["my-requests", status],
    queryFn: ({ pageParam }) => fetchMyRequests(status, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled,
  });
  return {
    ...query,
    requests: query.data?.pages.flatMap((p) => p.requests) ?? [],
    total: query.data?.pages[0]?.meta.total ?? 0,
  };
}

export function useRequest(id?: string) {
  return useQuery({
    queryKey: ["request", id],
    queryFn: () => fetchRequest(id as string),
    enabled: !!id,
  });
}
