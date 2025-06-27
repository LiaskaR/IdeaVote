import { users, ideas, votes, comments, type User, type InsertUser, type Idea, type InsertIdea, type Vote, type InsertVote, type Comment, type InsertComment, type IdeaWithDetails, type CommentWithAuthor } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ideas
  getIdeas(category?: string, sortBy?: string): Promise<IdeaWithDetails[]>;
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
      { id: 1, username: "sarah_chen", password: "password", avatar: null, role: "Product Manager" },
      { id: 2, username: "mike_johnson", password: "password", avatar: null, role: "Developer" },
      { id: 3, username: "lisa_park", password: "password", avatar: null, role: "Designer" },
      { id: 4, username: "david_kim", password: "password", avatar: null, role: "Manager" },
      { id: 5, username: "alex_rodriguez", password: "password", avatar: null, role: "Developer" },
      { id: 6, username: "emily_watson", password: "password", avatar: null, role: "QA Engineer" },
      { id: 7, username: "andrey_zakharov", password: "password", avatar: null, role: "Admin" },
    ];

    users.forEach(user => {
      this.users.set(user.id, user);
    });
    this.currentUserId = users.length + 1;

    // Create sample ideas
    const ideas = [
      {
        id: 1,
        title: "AI-Powered Customer Support Chat",
        description: "Implement an intelligent chatbot that can handle basic customer inquiries and route complex issues to human agents, reducing response time by 60%. The system would use natural language processing to understand customer queries and provide relevant responses from our knowledge base.",
        category: "product",
        tags: ["ai", "customer-support", "automation"],
        authorId: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: "Flexible Work Hours Policy",
        description: "Allow employees to choose their core working hours between 10 AM - 3 PM, with flexibility for start and end times to improve work-life balance and accommodate different personal schedules and preferences.",
        category: "process",
        tags: ["work-life-balance", "policy", "flexibility"],
        authorId: 2,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: "Monthly Innovation Hackathons",
        description: "Organize monthly 2-day hackathons where teams can work on passion projects and innovative solutions to company challenges. This would foster creativity and cross-team collaboration.",
        category: "innovation",
        tags: ["hackathon", "innovation", "collaboration"],
        authorId: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 4,
        title: "Employee Mentorship Program",
        description: "Create a structured mentorship program pairing senior employees with junior staff to accelerate professional development and knowledge transfer within the organization.",
        category: "culture",
        tags: ["mentorship", "professional-development", "knowledge-transfer"],
        authorId: 4,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 5,
        title: "Dark Mode for All Applications",
        description: "Implement a consistent dark mode theme across all our internal applications to reduce eye strain and improve user experience, especially for developers working long hours.",
        category: "product",
        tags: ["dark-mode", "ux", "accessibility"],
        authorId: 5,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 6,
        title: "Automated Code Review System",
        description: "Integrate automated code analysis tools to catch common issues before human review, streamlining the development process and maintaining code quality standards.",
        category: "process",
        tags: ["automation", "code-review", "quality"],
        authorId: 6,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    ideas.forEach(idea => {
      this.ideas.set(idea.id, idea);
    });
    this.currentIdeaId = ideas.length + 1;

    // Create sample votes
    const sampleVotes = [
      { ideaId: 1, userId: 2, type: 'up' }, { ideaId: 1, userId: 3, type: 'up' }, { ideaId: 1, userId: 4, type: 'up' },
      { ideaId: 2, userId: 1, type: 'up' }, { ideaId: 2, userId: 3, type: 'up' }, { ideaId: 2, userId: 5, type: 'up' },
      { ideaId: 3, userId: 1, type: 'up' }, { ideaId: 3, userId: 2, type: 'up' },
      { ideaId: 4, userId: 1, type: 'up' }, { ideaId: 4, userId: 2, type: 'up' },
      { ideaId: 5, userId: 1, type: 'up' }, { ideaId: 5, userId: 2, type: 'up' }, { ideaId: 5, userId: 3, type: 'up' },
      { ideaId: 6, userId: 1, type: 'up' }, { ideaId: 6, userId: 3, type: 'up' },
    ];

    sampleVotes.forEach(vote => {
      const voteWithId = { id: this.currentVoteId++, ...vote };
      this.votes.set(`${vote.ideaId}-${vote.userId}`, voteWithId);
    });

    // Create sample comments
    const sampleComments = [
      { id: 1, ideaId: 1, userId: 2, content: "This is a great idea! We've been struggling with support response times. Have you considered which AI platform to use?", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: 2, ideaId: 1, userId: 3, content: "I love the seamless handoff feature. This would definitely improve customer experience.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ];

    sampleComments.forEach(comment => {
      this.comments.set(comment.id, comment);
    });
    this.currentCommentId = sampleComments.length + 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getIdeas(category?: string, sortBy?: string): Promise<IdeaWithDetails[]> {
    let ideas = Array.from(this.ideas.values());
    
    if (category && category !== 'all') {
      ideas = ideas.filter(idea => idea.category === category);
    }

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

export const storage = new MemStorage();
