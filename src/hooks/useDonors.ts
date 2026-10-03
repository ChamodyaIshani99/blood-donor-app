import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDonors } from "../api/donors";
import { DonorFilters } from "../types";

export function useDonors(filters: DonorFilters) {
  const query = useInfiniteQuery({
    queryKey: ["donors", filters],
    queryFn: ({ pageParam }) => fetchDonors(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
  });

  return {
    ...query,
    donors: query.data?.pages.flatMap((p) => p.donors) ?? [],
    total: query.data?.pages[0]?.meta.total ?? 0,
  };
}
