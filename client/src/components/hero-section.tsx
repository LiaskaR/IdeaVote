import { useQuery } from "@tanstack/react-query";

interface Stats {
  totalIdeas: number;
  totalVotes: number;
  activeUsers: number;
}

export default function HeroSection() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return null;
}
