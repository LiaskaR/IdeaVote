import { ArrowUp, ArrowDown, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { IdeaWithDetails } from "@shared/schema";

const categoryColors = {
  product: "bg-blue-100 text-blue-800",
  process: "bg-green-100 text-green-800", 
  culture: "bg-orange-100 text-orange-800",
  innovation: "bg-purple-100 text-purple-800",
};

interface IdeaCardProps {
  idea: IdeaWithDetails;
  onClick: () => void;
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const categoryColor = categoryColors[idea.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800";
  
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <Badge className={`${categoryColor} text-xs font-medium`}>
            {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(idea.createdAt!), { addSuffix: true })}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{idea.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Handle upvote
              }}
            >
              <ArrowUp className="w-4 h-4" />
              <span className="font-medium">{idea.upvotes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1 text-red-500 hover:text-red-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Handle downvote
              }}
            >
              <ArrowDown className="w-4 h-4" />
              <span className="font-medium">{idea.downvotes}</span>
            </Button>
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
