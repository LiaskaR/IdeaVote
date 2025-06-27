import { ArrowUp, ArrowDown, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { formatDistanceToNow } from "date-fns";
import type { IdeaWithDetails } from "@shared/schema";

interface IdeaCardProps {
  idea: IdeaWithDetails;
  onClick: () => void;
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(idea.createdAt!), { addSuffix: true })}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{idea.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Voting System */}
            <div className="flex items-center space-x-2">
              <div 
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 cursor-pointer px-2 py-1 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Handle upvote
                }}
              >
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium text-lg">{idea.upvotes}</span>
              </div>
              
              <div 
                className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Handle downvote
                }}
              >
                <div className="flex items-center space-x-1 text-red-600">
                  <ArrowDown className="w-4 h-4" />
                  <span className="font-medium text-lg">{idea.downvotes}</span>
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
