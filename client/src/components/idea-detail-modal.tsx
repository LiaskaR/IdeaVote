import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, X, MessageCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { IdeaWithDetails, CommentWithAuthor } from "@shared/schema";

const categoryColors = {
  product: "bg-blue-100 text-blue-800",
  process: "bg-green-100 text-green-800", 
  culture: "bg-orange-100 text-orange-800",
  innovation: "bg-purple-100 text-purple-800",
};

interface IdeaDetailModalProps {
  ideaId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function IdeaDetailModal({ ideaId, isOpen, onClose }: IdeaDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = 7; // Default to current user (Andrey Zakharov)

  const { data: idea, isLoading } = useQuery<IdeaWithDetails>({
    queryKey: ["/api/ideas", ideaId],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}`);
      if (!response.ok) throw new Error("Failed to fetch idea");
      return response.json();
    },
    enabled: isOpen && !!ideaId,
  });

  const { data: comments = [] } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/ideas", ideaId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: isOpen && !!ideaId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: 'up' | 'down' }) => {
      const response = await apiRequest("POST", `/api/ideas/${ideaId}/vote`, {
        userId: currentUserId,
        type,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/ideas/${ideaId}/comments`, {
        userId: currentUserId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId] });
      setCommentText("");
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (type: 'up' | 'down') => {
    voteMutation.mutate({ type });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  if (!isOpen) return null;

  const categoryColor = idea ? categoryColors[idea.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800" : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : idea ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Badge className={`${categoryColor} text-xs font-medium`}>
                  {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Posted {formatDistanceToNow(new Date(idea.createdAt!), { addSuffix: true })}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{idea.title}</h2>
            
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {idea.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900">{idea.author.username}</div>
                <div className="text-sm text-gray-500">{idea.author.role || "User"}</div>
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
            </div>
            
            {/* Voting Section */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('up')}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium p-0"
                  disabled={voteMutation.isPending}
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>{idea.upvotes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('down')}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-600 font-medium p-0"
                  disabled={voteMutation.isPending}
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>{idea.downvotes}</span>
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{idea.upvotes - idea.downvotes}</span> net votes • 
                <span className="font-medium ml-1">{comments.length}</span> comments
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments
              </h3>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="mb-3"
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
              
              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author.username}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Idea not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
