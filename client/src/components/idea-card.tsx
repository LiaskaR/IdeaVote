import React from "react";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { IdeaWithDetails } from "@shared/schema";

interface IdeaCardProps {
  idea: IdeaWithDetails;
  onClick: () => void;
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = 7; // Default to current user (Andrey Zakharov)

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: 'up' | 'down' }) => {
      const response = await apiRequest("POST", `/api/ideas/${idea.id}/vote`, {
        userId: currentUserId,
        type
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch ideas list to get updated vote counts
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea.id] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось проголосовать. Попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (type: 'up' | 'down') => {
    voteMutation.mutate({ type });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col" onClick={onClick}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{idea.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3">
            {/* Voting System */}
            <div className="flex items-center space-x-1">
              <div 
                className={`bg-green-50 hover:bg-green-100 flex items-center space-x-1 text-green-600 hover:text-green-700 cursor-pointer px-2 py-1 rounded transition-colors ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!voteMutation.isPending) {
                    handleVote('up');
                  }
                }}
              >
                <ArrowUp className="w-3 h-3" />
                <span className="font-medium text-sm">{idea.upvotes}</span>
              </div>
              
              <div 
                className={`bg-red-50 hover:bg-red-100 px-2 py-1 rounded cursor-pointer transition-colors ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!voteMutation.isPending) {
                    handleVote('down');
                  }
                }}
              >
                <div className="flex items-center space-x-1 text-red-600">
                  <ArrowDown className="w-3 h-3" />
                  <span className="font-medium text-sm">{idea.downvotes}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500">
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
    </article>
  );
}
