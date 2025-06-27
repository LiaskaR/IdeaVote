import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FiltersBar from "@/components/filters-bar";
import IdeaCard from "@/components/idea-card";
import CreateIdeaModal from "@/components/create-idea-modal";
import IdeaDetailModal from "@/components/idea-detail-modal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import type { IdeaWithDetails } from "@shared/schema";

export default function Home() {
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  const { data: ideas = [], isLoading } = useQuery<IdeaWithDetails[]>({
    queryKey: ["/api/ideas", sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
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
            <h1 className="text-2xl font-semibold text-gray-900">CRM Think tank</h1>

          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить идею
          </Button>
        </div>

        <FiltersBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
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
            <div className="text-gray-500 text-lg mb-4">Идеи не найдены</div>
            <p className="text-gray-400 mb-6">Будьте первым, кто предложит идею!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Предложить идею
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={() => setSelectedIdeaId(idea.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdeaId(idea.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <div className="bg-green-50 hover:bg-green-100 flex items-center space-x-1 text-green-600 px-2 py-1 rounded text-sm">
                              <ArrowUp className="w-3 h-3" />
                              <span className="font-medium">{idea.upvotes}</span>
                            </div>
                            <div className="bg-red-50 hover:bg-red-100 flex items-center space-x-1 text-red-600 px-2 py-1 rounded text-sm">
                              <ArrowDown className="w-3 h-3" />
                              <span className="font-medium">{idea.downvotes}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>{idea.commentCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {idea.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{idea.author.username}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}


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
