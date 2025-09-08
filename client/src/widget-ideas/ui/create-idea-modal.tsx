import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { useToast } from "../hooks/use-toast";
import { insertIdeaSchema, type InsertIdea } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import type { UserData } from './home';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserData;
  apiBaseUrl?: string;
}

export default function CreateIdeaModal({ isOpen, onClose, user, apiBaseUrl = '' }: CreateIdeaModalProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InsertIdea>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      images: [],
      authorId: user?.id || 1, // Use authenticated user ID
    },
  });

  // Handle image file uploads
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, imageUrl]);
          const currentImages = form.getValues('images') || [];
          form.setValue('images', [...currentImages, imageUrl]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue('images', newImages);
  };

  const createIdeaMutation = useMutation({
    mutationFn: async (data: InsertIdea) => {
      const response = await apiRequest("POST", `${apiBaseUrl}/api/ideas`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: t('messages.ideaCreated'),
        description: t('messages.ideaCreatedSuccess'),
      });
      form.reset();
      setUploadedImages([]);
      onClose();
    },
    onError: () => {
      toast({
        title: t('messages.error'),
        description: t('messages.createIdeaError'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertIdea) => {
    // Parse tags from comma-separated string
    const formData = {
      ...data,
      tags: data.tags && Array.isArray(data.tags) ? data.tags : [],
    };
    createIdeaMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('idea.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('idea.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('idea.title')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('idea.titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('idea.description')} *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t('idea.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Section */}
            <div className="space-y-4">
              <FormLabel>{t('idea.images')}</FormLabel>
              
              {/* File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              {/* Upload Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 py-6 bg-transparent hover:bg-gray-100 hover:text-gray-700"
              >
                <Upload className="w-5 h-5 mr-2" />
                {t('idea.addImages')}
              </Button>
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-50 hover:text-gray-900">
                {t('actions.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={createIdeaMutation.isPending}
              >
                {createIdeaMutation.isPending ? t('idea.creating') : t('idea.addIdea')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
