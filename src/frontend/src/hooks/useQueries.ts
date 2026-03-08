import { useQuery } from "@tanstack/react-query";
import type { Category, Fact } from "../backend.d";
import { useActor } from "./useActor";

export function useGetRandomFact(category: Category | null) {
  const { actor } = useActor();
  return useQuery<Fact>({
    queryKey: ["randomFact", category],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getRandomFact(category);
    },
    enabled: false, // manual trigger only
  });
}

export function useGetAllFacts(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Fact[]>({
    queryKey: ["allFacts", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFacts(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export type { Fact, Category };
