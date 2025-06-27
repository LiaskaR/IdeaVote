import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIdeaSchema, insertVoteSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all ideas with optional filtering and sorting
  app.get("/api/ideas", async (req, res) => {
    try {
      const { category, sortBy } = req.query;
      const ideas = await storage.getIdeas(
        category as string, 
        sortBy as string
      );
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  // Get a single idea by ID
  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      res.json(idea);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  // Create a new idea
  app.post("/api/ideas", async (req, res) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const idea = await storage.createIdea(validatedData);
      res.status(201).json(idea);
    } catch (error) {
      res.status(400).json({ message: "Invalid idea data" });
    }
  });

  // Update an idea
  app.patch("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIdeaSchema.partial().parse(req.body);
      const idea = await storage.updateIdea(id, validatedData);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      res.json(idea);
    } catch (error) {
      res.status(400).json({ message: "Invalid idea data" });
    }
  });

  // Delete an idea
  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteIdea(id);
      if (!deleted) {
        return res.status(404).json({ message: "Idea not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete idea" });
    }
  });

  // Vote on an idea
  app.post("/api/ideas/:id/vote", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const { userId, type } = req.body;
      
      if (!userId || !type || !['up', 'down'].includes(type)) {
        return res.status(400).json({ message: "Invalid vote data" });
      }

      const existingVote = await storage.getUserVote(ideaId, userId);
      
      if (existingVote && existingVote.type === type) {
        // Remove vote if clicking the same vote type
        await storage.deleteVote(ideaId, userId);
      } else {
        // Create or update vote
        const voteData = { ideaId, userId, type };
        await storage.createOrUpdateVote(voteData);
      }

      const votes = await storage.getIdeaVotes(ideaId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to process vote" });
    }
  });

  // Get comments for an idea
  app.get("/api/ideas/:id/comments", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const comments = await storage.getIdeaComments(ideaId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add a comment to an idea
  app.post("/api/ideas/:id/comments", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const { userId, content } = req.body;
      
      if (!userId || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const commentData = { ideaId, userId, content };
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
