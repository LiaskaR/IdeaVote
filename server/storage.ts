import { users, ideas, votes, comments, type User, type InsertUser, type Idea, type InsertIdea, type Vote, type InsertVote, type Comment, type InsertComment, type IdeaWithDetails, type CommentWithAuthor } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;

  // Ideas
  getIdeas(sortBy?: string): Promise<IdeaWithDetails[]>;
  getIdea(id: number): Promise<IdeaWithDetails | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<boolean>;

  // Votes
  getUserVote(ideaId: number, userId: number): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;
  deleteVote(ideaId: number, userId: number): Promise<boolean>;
  getIdeaVotes(ideaId: number): Promise<{ upvotes: number; downvotes: number }>;

  // Comments
  getIdeaComments(ideaId: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Stats
  getStats(): Promise<{ totalIdeas: number; totalVotes: number; activeUsers: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIdeas(sortBy?: string): Promise<IdeaWithDetails[]> {
    let query = db
      .select({
        id: ideas.id,
        title: ideas.title,
        description: ideas.description,
        tags: ideas.tags,
        images: ideas.images,
        authorId: ideas.authorId,
        createdAt: ideas.createdAt,
        author: users,
        upvotes: sql<number>`COALESCE((SELECT COUNT(*) FROM votes WHERE idea_id = ${ideas.id} AND type = 'up'), 0)`,
        downvotes: sql<number>`COALESCE((SELECT COUNT(*) FROM votes WHERE idea_id = ${ideas.id} AND type = 'down'), 0)`,
        commentCount: sql<number>`COALESCE((SELECT COUNT(*) FROM comments WHERE idea_id = ${ideas.id}), 0)`
      })
      .from(ideas)
      .innerJoin(users, eq(ideas.authorId, users.id));

    const baseQuery = query;

    let result;
    switch (sortBy) {
      case 'newest':
        result = await baseQuery.orderBy(desc(ideas.createdAt));
        break;
      case 'oldest':
        result = await baseQuery.orderBy(asc(ideas.createdAt));
        break;
      case 'discussed':
        result = await baseQuery.orderBy(desc(sql`(SELECT COUNT(*) FROM comments WHERE idea_id = ${ideas.id})`));
        break;
      default: // most popular
        result = await baseQuery.orderBy(desc(sql`(SELECT COUNT(*) FROM votes WHERE idea_id = ${ideas.id} AND type = 'up') - (SELECT COUNT(*) FROM votes WHERE idea_id = ${ideas.id} AND type = 'down')`));
    }

    return result
  }

  async getIdea(id: number): Promise<IdeaWithDetails | undefined> {
    const result = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        description: ideas.description,
        tags: ideas.tags,
        images: ideas.images,
        authorId: ideas.authorId,
        createdAt: ideas.createdAt,
        author: users,
        upvotes: sql<number>`COALESCE(${sql`(SELECT COUNT(*) FROM ${votes} WHERE ${votes.ideaId} = ${ideas.id} AND ${votes.type} = 'up')`}, 0)`,
        downvotes: sql<number>`COALESCE(${sql`(SELECT COUNT(*) FROM ${votes} WHERE ${votes.ideaId} = ${ideas.id} AND ${votes.type} = 'down')`}, 0)`,
        commentCount: sql<number>`COALESCE(${sql`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.ideaId} = ${ideas.id})`}, 0)`
      })
      .from(ideas)
      .innerJoin(users, eq(ideas.authorId, users.id))
      .where(eq(ideas.id, id));

    const [row] = result;
    if (!row) return undefined;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      tags: row.tags,
      images: row.images,
      authorId: row.authorId,
      createdAt: row.createdAt,
      author: row.author,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      commentCount: row.commentCount
    };
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const [idea] = await db
      .insert(ideas)
      .values(insertIdea)
      .returning();
    return idea;
  }

  async updateIdea(id: number, updateData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [idea] = await db
      .update(ideas)
      .set(updateData)
      .where(eq(ideas.id, id))
      .returning();
    return idea || undefined;
  }

  async deleteIdea(id: number): Promise<boolean> {
    const result = await db.delete(ideas).where(eq(ideas.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserVote(ideaId: number, userId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(sql`${votes.ideaId} = ${ideaId} AND ${votes.userId} = ${userId}`);
    return vote || undefined;
  }

  async createOrUpdateVote(insertVote: InsertVote): Promise<Vote> {
    const existingVote = await this.getUserVote(insertVote.ideaId, insertVote.userId);
    
    if (existingVote) {
      const [vote] = await db
        .update(votes)
        .set({ type: insertVote.type })
        .where(eq(votes.id, existingVote.id))
        .returning();
      return vote;
    } else {
      const [vote] = await db
        .insert(votes)
        .values(insertVote)
        .returning();
      return vote;
    }
  }

  async deleteVote(ideaId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(votes)
      .where(sql`${votes.ideaId} = ${ideaId} AND ${votes.userId} = ${userId}`);
    return (result.rowCount || 0) > 0;
  }

  async getIdeaVotes(ideaId: number): Promise<{ upvotes: number; downvotes: number }> {
    const upvotesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(votes)
      .where(eq(votes.ideaId, ideaId) && eq(votes.type, 'up'));
    
    const downvotesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(votes)
      .where(eq(votes.ideaId, ideaId) && eq(votes.type, 'down'));

    return {
      upvotes: upvotesResult[0]?.count || 0,
      downvotes: downvotesResult[0]?.count || 0
    };
  }

  async getIdeaComments(ideaId: number): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        id: comments.id,
        ideaId: comments.ideaId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        author: users
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.ideaId, ideaId))
      .orderBy(asc(comments.createdAt));

    return result.map(row => ({
      id: row.id,
      ideaId: row.ideaId,
      userId: row.userId,
      content: row.content,
      createdAt: row.createdAt,
      author: row.author
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getStats(): Promise<{ totalIdeas: number; totalVotes: number; activeUsers: number }> {
    const [ideasCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(ideas);
    const [votesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(votes);
    const [usersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);

    return {
      totalIdeas: ideasCount.count || 0,
      totalVotes: votesCount.count || 0,
      activeUsers: usersCount.count || 0
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ideas: Map<number, Idea>;
  private votes: Map<string, Vote>; // key: `${ideaId}-${userId}`
  private comments: Map<number, Comment>;
  private currentUserId: number;
  private currentIdeaId: number;
  private currentVoteId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.votes = new Map();
    this.comments = new Map();
    this.currentUserId = 1;
    this.currentIdeaId = 1;
    this.currentVoteId = 1;
    this.currentCommentId = 1;

    this.seedData();
  }

  private seedData() {
    // Create sample users
    const users = [
      { id: 1, username: "sarah_chen", email: "sarah@example.com", password: "password", avatar: null, role: "Product Manager", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, username: "mike_johnson", email: "mike@example.com", password: "password", avatar: null, role: "Developer", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, username: "lisa_park", email: "lisa@example.com", password: "password", avatar: null, role: "Designer", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, username: "david_kim", email: "david@example.com", password: "password", avatar: null, role: "Manager", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, username: "alex_rodriguez", email: "alex@example.com", password: "password", avatar: null, role: "Developer", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, username: "emily_watson", email: "emily@example.com", password: "password", avatar: null, role: "QA Engineer", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, username: "andrey_zakharov", email: "andrey@example.com", password: "password", avatar: null, role: "Admin", isActive: "true", lastLogin: null, createdAt: new Date(), updatedAt: new Date() },
    ];

    users.forEach(user => {
      this.users.set(user.id, user);
    });
    this.currentUserId = users.length + 1;

    // Create sample ideas with English content
    const ideas: any[] = [
      {
        id: 1,
        title: "AI-Powered Customer Support Chatbot",
        description: "Implement an intelligent chatbot that can handle 80% of customer inquiries automatically. This would reduce response time from hours to seconds and free up our support team for complex issues.",
        tags: ["AI", "customer service", "automation"],
        images: null,
        authorId: 1,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: 2,
        title: "Mobile App Dark Mode Implementation",
        description: "Add dark mode support to our mobile application. Recent user surveys show 75% of users prefer dark mode for better battery life and reduced eye strain during evening usage.",
        tags: ["mobile", "UI/UX", "accessibility"],
        images: null,
        authorId: 2,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 3,
        title: "Automated Code Review System",
        description: "Set up automated code quality checks using GitHub Actions. This will catch common issues before manual review and ensure consistent coding standards across the team.",
        tags: ["DevOps", "code quality", "automation"],
        images: null,
        authorId: 3,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 4,
        title: "Real-time Collaboration Features",
        description: "Add real-time collaborative editing similar to Google Docs. Users can see each other's cursors and changes instantly, improving team productivity.",
        tags: ["collaboration", "real-time", "productivity"],
        images: null,
        authorId: 4,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 5,
        title: "Performance Analytics Dashboard",
        description: "Create a comprehensive dashboard showing app performance metrics, user engagement, and system health. This will help us make data-driven decisions.",
        tags: ["analytics", "dashboard", "performance"],
        images: null,
        authorId: 5,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      }
    ];

    ideas.forEach(idea => {
      this.ideas.set(idea.id, idea);
    });
    this.currentIdeaId = ideas.length + 1;

    // No sample votes or comments
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      avatar: insertUser.avatar || null,
      role: insertUser.role || "user",
      isActive: "true",
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getIdeas(sortBy?: string): Promise<IdeaWithDetails[]> {
    let ideas = Array.from(this.ideas.values());

    const ideasWithDetails: IdeaWithDetails[] = [];
    
    for (const idea of ideas) {
      const author = await this.getUser(idea.authorId);
      if (!author) continue;
      
      const { upvotes, downvotes } = await this.getIdeaVotes(idea.id);
      const comments = await this.getIdeaComments(idea.id);
      
      ideasWithDetails.push({
        ...idea,
        author,
        upvotes,
        downvotes,
        commentCount: comments.length,
      });
    }

    // Sort ideas
    switch (sortBy) {
      case 'newest':
        ideasWithDetails.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
      case 'oldest':
        ideasWithDetails.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
        break;
      case 'discussed':
        ideasWithDetails.sort((a, b) => b.commentCount - a.commentCount);
        break;
      default: // most popular
        ideasWithDetails.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    return ideasWithDetails;
  }

  async getIdea(id: number): Promise<IdeaWithDetails | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const author = await this.getUser(idea.authorId);
    if (!author) return undefined;

    const { upvotes, downvotes } = await this.getIdeaVotes(id);
    const comments = await this.getIdeaComments(id);

    return {
      ...idea,
      author,
      upvotes,
      downvotes,
      commentCount: comments.length,
    };
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const id = this.currentIdeaId++;
    const idea: Idea = { 
      ...insertIdea,
      tags: insertIdea.tags || null,
      images: insertIdea.images || null,
      id, 
      createdAt: new Date() 
    };
    this.ideas.set(id, idea);
    return idea;
  }

  async updateIdea(id: number, updateData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const updatedIdea = { ...idea, ...updateData };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    return this.ideas.delete(id);
  }

  async getUserVote(ideaId: number, userId: number): Promise<Vote | undefined> {
    return this.votes.get(`${ideaId}-${userId}`);
  }

  async createOrUpdateVote(insertVote: InsertVote): Promise<Vote> {
    const key = `${insertVote.ideaId}-${insertVote.userId}`;
    const existingVote = this.votes.get(key);
    
    if (existingVote) {
      const updatedVote = { ...existingVote, type: insertVote.type };
      this.votes.set(key, updatedVote);
      return updatedVote;
    } else {
      const id = this.currentVoteId++;
      const vote: Vote = { ...insertVote, id };
      this.votes.set(key, vote);
      return vote;
    }
  }

  async deleteVote(ideaId: number, userId: number): Promise<boolean> {
    return this.votes.delete(`${ideaId}-${userId}`);
  }

  async getIdeaVotes(ideaId: number): Promise<{ upvotes: number; downvotes: number }> {
    const votes = Array.from(this.votes.values()).filter(vote => vote.ideaId === ideaId);
    const upvotes = votes.filter(vote => vote.type === 'up').length;
    const downvotes = votes.filter(vote => vote.type === 'down').length;
    return { upvotes, downvotes };
  }

  async getIdeaComments(ideaId: number): Promise<CommentWithAuthor[]> {
    const comments = Array.from(this.comments.values()).filter(comment => comment.ideaId === ideaId);
    const commentsWithAuthor: CommentWithAuthor[] = [];
    
    for (const comment of comments) {
      const author = await this.getUser(comment.userId);
      if (author) {
        commentsWithAuthor.push({ ...comment, author });
      }
    }
    
    return commentsWithAuthor.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getStats(): Promise<{ totalIdeas: number; totalVotes: number; activeUsers: number }> {
    return {
      totalIdeas: this.ideas.size,
      totalVotes: this.votes.size,
      activeUsers: this.users.size,
    };
  }
}

export const storage = new DatabaseStorage();
