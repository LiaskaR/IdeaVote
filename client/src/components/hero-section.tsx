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

  return (
    <section className="bg-gradient-to-r from-primary to-purple-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Shape the Future with Your Ideas</h1>
          <p className="text-xl text-purple-100 mb-8">
            Submit, discuss, and vote on innovative ideas that drive our organization forward
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{stats?.totalIdeas || 0}</div>
              <div className="text-purple-100">Ideas Submitted</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{stats?.totalVotes || 0}</div>
              <div className="text-purple-100">Votes Cast</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{stats?.activeUsers || 0}</div>
              <div className="text-purple-100">Active Contributors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
