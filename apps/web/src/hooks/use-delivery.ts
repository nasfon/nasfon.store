"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { DeliveryLocation } from "@/types";

export function useDeliveryLocations() {
  return useQuery({
    queryKey: ["delivery-locations"],
    queryFn: () => api.get<DeliveryLocation[]>("/delivery-locations"),
  });
}
