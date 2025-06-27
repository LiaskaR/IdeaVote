import { db } from "./db";
import { users, ideas, votes, comments } from "@shared/schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create sample users
    const sampleUsers = [
      { username: "sarah_chen", password: "password", avatar: null, role: "Product Manager" },
      { username: "mike_johnson", password: "password", avatar: null, role: "Developer" },
      { username: "lisa_park", password: "password", avatar: null, role: "Designer" },
      { username: "david_kim", password: "password", avatar: null, role: "Manager" },
      { username: "alex_rodriguez", password: "password", avatar: null, role: "Developer" },
      { username: "emily_watson", password: "password", avatar: null, role: "QA Engineer" },
      { username: "andrey_zakharov", password: "password", avatar: null, role: "Admin" },
    ];

    console.log("Creating users...");
    const createdUsers = await db.insert(users).values(sampleUsers).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample ideas
    const sampleIdeas = [
      {
        title: "AI-Powered Customer Support Chat",
        description: "Implement an intelligent chatbot that can handle basic customer inquiries and route complex issues to human agents, reducing response time by 60%. The system would use natural language processing to understand customer queries and provide relevant responses from our knowledge base.",
        category: "product",
        tags: ["ai", "customer-support", "automation"],
        authorId: createdUsers[0].id,
      },
      {
        title: "Flexible Work Hours Policy",
        description: "Allow employees to choose their core working hours between 10 AM - 3 PM, with flexibility for start and end times to improve work-life balance and accommodate different personal schedules and preferences.",
        category: "process",
        tags: ["work-life-balance", "policy", "flexibility"],
        authorId: createdUsers[1].id,
      },
      {
        title: "Monthly Innovation Hackathons",
        description: "Organize monthly 2-day hackathons where teams can work on passion projects and innovative solutions to company challenges. This would foster creativity and cross-team collaboration.",
        category: "innovation",
        tags: ["hackathon", "innovation", "collaboration"],
        authorId: createdUsers[2].id,
      },
      {
        title: "Employee Mentorship Program",
        description: "Create a structured mentorship program pairing senior employees with junior staff to accelerate professional development and knowledge transfer within the organization.",
        category: "culture",
        tags: ["mentorship", "professional-development", "knowledge-transfer"],
        authorId: createdUsers[3].id,
      },
      {
        title: "Dark Mode for All Applications",
        description: "Implement a consistent dark mode theme across all our internal applications to reduce eye strain and improve user experience, especially for developers working long hours.",
        category: "product",
        tags: ["dark-mode", "ux", "accessibility"],
        authorId: createdUsers[4].id,
      },
      {
        title: "Automated Code Review System",
        description: "Integrate automated code analysis tools to catch common issues before human review, streamlining the development process and maintaining code quality standards.",
        category: "process",
        tags: ["automation", "code-review", "quality"],
        authorId: createdUsers[5].id,
      },
    ];

    console.log("Creating ideas...");
    const createdIdeas = await db.insert(ideas).values(sampleIdeas).returning();
    console.log(`✅ Created ${createdIdeas.length} ideas`);

    // Create sample votes
    const sampleVotes = [
      { ideaId: createdIdeas[0].id, userId: createdUsers[1].id, type: 'up' },
      { ideaId: createdIdeas[0].id, userId: createdUsers[2].id, type: 'up' },
      { ideaId: createdIdeas[0].id, userId: createdUsers[3].id, type: 'up' },
      { ideaId: createdIdeas[1].id, userId: createdUsers[0].id, type: 'up' },
      { ideaId: createdIdeas[1].id, userId: createdUsers[2].id, type: 'up' },
      { ideaId: createdIdeas[1].id, userId: createdUsers[4].id, type: 'up' },
      { ideaId: createdIdeas[2].id, userId: createdUsers[0].id, type: 'up' },
      { ideaId: createdIdeas[2].id, userId: createdUsers[1].id, type: 'up' },
      { ideaId: createdIdeas[3].id, userId: createdUsers[0].id, type: 'up' },
      { ideaId: createdIdeas[3].id, userId: createdUsers[1].id, type: 'up' },
      { ideaId: createdIdeas[4].id, userId: createdUsers[0].id, type: 'up' },
      { ideaId: createdIdeas[4].id, userId: createdUsers[1].id, type: 'up' },
      { ideaId: createdIdeas[4].id, userId: createdUsers[2].id, type: 'up' },
      { ideaId: createdIdeas[5].id, userId: createdUsers[0].id, type: 'up' },
      { ideaId: createdIdeas[5].id, userId: createdUsers[2].id, type: 'up' },
    ];

    console.log("Creating votes...");
    await db.insert(votes).values(sampleVotes);
    console.log(`✅ Created ${sampleVotes.length} votes`);

    // Create sample comments
    const sampleComments = [
      {
        ideaId: createdIdeas[0].id,
        userId: createdUsers[1].id,
        content: "This is a great idea! We've been struggling with support response times. Have you considered which AI platform to use?",
      },
      {
        ideaId: createdIdeas[0].id,
        userId: createdUsers[2].id,
        content: "I love the seamless handoff feature. This would definitely improve customer experience.",
      },
    ];

    console.log("Creating comments...");
    await db.insert(comments).values(sampleComments);
    console.log(`✅ Created ${sampleComments.length} comments`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seed };