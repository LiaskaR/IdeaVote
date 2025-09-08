import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useToast } from "../hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "../lib/queryClient";
import type { IdeaWithDetails, CommentWithAuthor } from "@shared/schema";
import type { UserData } from './home';

interface IdeaDetailModalProps {
  ideaId: number;
  isOpen: boolean;
  onClose: () => void;
  user?: UserData;
  apiBaseUrl?: string;
  authToken?: string;
}

export default function IdeaDetailModal({ ideaId, isOpen, onClose, user, apiBaseUrl = '', authToken }: IdeaDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUserId = user?.id || 1; // Use authenticated user ID

  const { data: idea, isLoading } = useQuery<IdeaWithDetails>({
    queryKey: ["/api/ideas", ideaId],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/api/ideas/${ideaId}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (!response.ok) throw new Error("Failed to fetch idea");
      return response.json();
    },
    enabled: isOpen && !!ideaId,
  });

  const { data: comments = [] } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/ideas", ideaId, "comments"],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/api/ideas/${ideaId}/comments`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: isOpen && !!ideaId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: 'up' | 'down' }) => {
      const response = await apiRequest("POST", `${apiBaseUrl}/api/ideas/${ideaId}/vote`, {
        type,
      }, authToken);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: () => {
      toast({
        title: t('messages.error'),
        description: t('messages.voteError'),
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `${apiBaseUrl}/api/ideas/${ideaId}/comments`, {
        content,
      }, authToken);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId] });
      setCommentText("");
      toast({
        title: t('messages.ideaCreated'),
        description: t('messages.commentPosted'),
      });
    },
    onError: () => {
      toast({
        title: t('messages.error'),
        description: t('messages.commentError'),
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



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{idea?.title || t('idea.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('idea.createDescription')}
          </DialogDescription>
        </DialogHeader>
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
            <div className="mb-6">
              <span className="text-sm text-gray-500">
                {t('idea.published')} {formatDistanceToNow(new Date(idea.createdAt!), { addSuffix: true })}
              </span>
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
            
            {/* Images Section */}
            {idea.images && idea.images.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('idea.attachedImages')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {idea.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${t('idea.images')} ${index + 1} ${idea.title}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(image, '_blank');
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Voting Section */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div
                  onClick={() => handleVote('up')}
                  className={`bg-gray-100 hover:bg-gray-200 flex items-center space-x-1 text-gray-600 hover:text-gray-700 cursor-pointer px-3 py-1 rounded transition-colors ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-medium text-lg">{idea.upvotes}</span>
                </div>
                <div
                  onClick={() => handleVote('down')}
                  className={`bg-red-100 hover:bg-red-200 flex items-center space-x-1 text-red-600 hover:text-red-700 cursor-pointer px-3 py-1 rounded transition-colors ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="font-medium text-lg">{idea.downvotes}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{idea.upvotes - idea.downvotes}</span> {t('idea.overallRating')} • 
                <span className="font-medium ml-1">{comments.length}</span> {t('idea.comments')}
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t('idea.comments')}
              </h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('idea.noComments')}</p>
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
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit}>
                <Textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('idea.writeComment')}
                  className="mb-3"
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? t('idea.posting') : t('idea.addComment')}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">{t('idea.ideaNotFound')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
