import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FiltersBar from "@/components/filters-bar";
import IdeaCard from "@/components/idea-card";
import CreateIdeaModal from "@/components/create-idea-modal";
import IdeaDetailModal from "@/components/idea-detail-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { IdeaWithDetails } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  const { data: ideas = [], isLoading } = useQuery<IdeaWithDetails[]>({
    queryKey: ["/api/ideas", selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (sortBy !== "popular") params.append("sortBy", sortBy);
      
      const response = await fetch(`/api/ideas?${params}`);
      if (!response.ok) throw new Error("Failed to fetch ideas");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Задачи</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Просроченные: 5 730</span>
              <span>Активные: 6 984</span>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить задачу
          </Button>
        </div>

        <FiltersBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No ideas found</div>
            <p className="text-gray-400 mb-6">Be the first to submit an idea!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Submit Your Idea
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => setSelectedIdeaId(idea.id)}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" className="px-6 py-3">
                Load More Ideas
              </Button>
            </div>
          </>
        )}
      </main>

      <CreateIdeaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedIdeaId && (
        <IdeaDetailModal
          ideaId={selectedIdeaId}
          isOpen={!!selectedIdeaId}
          onClose={() => setSelectedIdeaId(null)}
        />
      )}
    </div>
  );
}
