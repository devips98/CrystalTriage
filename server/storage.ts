import {
  users,
  posts,
  confessions,
  messages,
  challenges,
  challengeParticipations,
  geoTimeCapsules,
  geoSwaps,
  postLikes,
  postComments,
  offlinePosts,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Confession,
  type InsertConfession,
  type Message,
  type InsertMessage,
  type Challenge,
  type InsertChallenge,
  type GeoTimeCapsule,
  type InsertGeoTimeCapsule,
  type GeoSwap,
  type InsertGeoSwap,
  type PostLike,
  type PostComment,
  type ChallengeParticipation,
  type OfflinePost,
  type InsertOfflinePost,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lt, gt, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserTrustScore(userId: string, score: number): Promise<void>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getNearbyPosts(latitude: number, longitude: number, radius: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  likePost(postId: number, userId: string): Promise<void>;
  unlikePost(postId: number, userId: string): Promise<void>;
  commentOnPost(postId: number, userId: string, content: string): Promise<void>;
  getPostLikes(postId: number): Promise<number>;
  getPostComments(postId: number): Promise<PostComment[]>;
  
  // Confession operations
  createConfession(confession: InsertConfession): Promise<Confession>;
  getNearbyConfessions(latitude: number, longitude: number, radius: number): Promise<Confession[]>;
  addConfessionReaction(confessionId: number, emoji: string): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: string, otherUserId: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getNearbyActiveChallenges(latitude: number, longitude: number, radius: number): Promise<Challenge[]>;
  participateInChallenge(challengeId: number, userId: string, imageUrl: string): Promise<void>;
  getChallengeParticipations(challengeId: number): Promise<ChallengeParticipation[]>;
  
  // GeoTime Capsule operations
  createGeoTimeCapsule(capsule: InsertGeoTimeCapsule): Promise<GeoTimeCapsule>;
  getAvailableGeoTimeCapsules(latitude: number, longitude: number): Promise<GeoTimeCapsule[]>;
  openGeoTimeCapsule(id: number): Promise<void>;
  
  // GeoSwap operations
  createGeoSwap(swap: InsertGeoSwap): Promise<GeoSwap>;
  findNearbyGeoSwapOpportunities(latitude: number, longitude: number, userId: string): Promise<User[]>;
  completeGeoSwap(swapId: number, userId: string, imageUrl: string): Promise<void>;
  
  // Offline post operations
  createOfflinePost(post: InsertOfflinePost): Promise<OfflinePost>;
  checkAndTriggerOfflinePosts(userId: string, latitude: number, longitude: number): Promise<Post[]>;
  
  // Utility operations
  cleanupExpiredContent(): Promise<void>;
  generateDailySummary(latitude: number, longitude: number, radius: number): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserTrustScore(userId: string, score: number): Promise<void> {
    await db.update(users).set({ trustScore: score }).where(eq(users.id, userId));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getNearbyPosts(latitude: number, longitude: number, radius: number): Promise<Post[]> {
    const nearbyPosts = await db
      .select()
      .from(posts)
      .where(
        and(
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${posts.longitude}, ${posts.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`,
          or(isNull(posts.expiresAt), gt(posts.expiresAt, new Date()))
        )
      )
      .orderBy(desc(posts.createdAt));
    
    return nearbyPosts;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async likePost(postId: number, userId: string): Promise<void> {
    await db.insert(postLikes).values({ postId, userId }).onConflictDoNothing();
  }

  async unlikePost(postId: number, userId: string): Promise<void> {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async commentOnPost(postId: number, userId: string, content: string): Promise<void> {
    await db.insert(postComments).values({ postId, userId, content });
  }

  async getPostLikes(postId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    return result[0]?.count || 0;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(desc(postComments.createdAt));
  }

  async createConfession(confession: InsertConfession): Promise<Confession> {
    const [newConfession] = await db.insert(confessions).values(confession).returning();
    return newConfession;
  }

  async getNearbyConfessions(latitude: number, longitude: number, radius: number): Promise<Confession[]> {
    return await db
      .select()
      .from(confessions)
      .where(
        and(
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${confessions.longitude}, ${confessions.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`,
          or(isNull(confessions.expiresAt), gt(confessions.expiresAt, new Date()))
        )
      )
      .orderBy(desc(confessions.createdAt));
  }

  async addConfessionReaction(confessionId: number, emoji: string): Promise<void> {
    const confession = await db.select().from(confessions).where(eq(confessions.id, confessionId));
    if (confession[0]) {
      const reactions = confession[0].reactions || {};
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      await db.update(confessions).set({ reactions }).where(eq(confessions.id, confessionId));
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUserMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getUserConversations(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getNearbyActiveChallenges(latitude: number, longitude: number, radius: number): Promise<Challenge[]> {
    return await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.isActive, true),
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${challenges.longitude}, ${challenges.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`,
          or(isNull(challenges.expiresAt), gt(challenges.expiresAt, new Date()))
        )
      )
      .orderBy(desc(challenges.createdAt));
  }

  async participateInChallenge(challengeId: number, userId: string, imageUrl: string): Promise<void> {
    await db.insert(challengeParticipations).values({ challengeId, userId, imageUrl });
  }

  async getChallengeParticipations(challengeId: number): Promise<ChallengeParticipation[]> {
    return await db.select().from(challengeParticipations).where(eq(challengeParticipations.challengeId, challengeId));
  }

  async createGeoTimeCapsule(capsule: InsertGeoTimeCapsule): Promise<GeoTimeCapsule> {
    const [newCapsule] = await db.insert(geoTimeCapsules).values(capsule).returning();
    return newCapsule;
  }

  async getAvailableGeoTimeCapsules(latitude: number, longitude: number): Promise<GeoTimeCapsule[]> {
    return await db
      .select()
      .from(geoTimeCapsules)
      .where(
        and(
          eq(geoTimeCapsules.isOpened, false),
          lt(geoTimeCapsules.scheduledFor, new Date()),
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${geoTimeCapsules.longitude}, ${geoTimeCapsules.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${geoTimeCapsules.visibilityRadius})`
        )
      );
  }

  async openGeoTimeCapsule(id: number): Promise<void> {
    await db.update(geoTimeCapsules).set({ isOpened: true }).where(eq(geoTimeCapsules.id, id));
  }

  async createGeoSwap(swap: InsertGeoSwap): Promise<GeoSwap> {
    const [newSwap] = await db.insert(geoSwaps).values(swap).returning();
    return newSwap;
  }

  async findNearbyGeoSwapOpportunities(latitude: number, longitude: number, userId: string): Promise<User[]> {
    // Find users within 50m radius who are not the current user
    const nearbyUsers = await db
      .select({ user: users })
      .from(users)
      .leftJoin(posts, eq(posts.userId, users.id))
      .where(
        and(
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${posts.longitude}, ${posts.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), 50)`,
          sql`${users.id} != ${userId}`
        )
      )
      .groupBy(users.id);

    return nearbyUsers.map(row => row.user);
  }

  async completeGeoSwap(swapId: number, userId: string, imageUrl: string): Promise<void> {
    const swap = await db.select().from(geoSwaps).where(eq(geoSwaps.id, swapId));
    if (swap[0]) {
      if (swap[0].user1Id === userId) {
        await db.update(geoSwaps).set({ user1ImageUrl: imageUrl }).where(eq(geoSwaps.id, swapId));
      } else if (swap[0].user2Id === userId) {
        await db.update(geoSwaps).set({ user2ImageUrl: imageUrl }).where(eq(geoSwaps.id, swapId));
      }
      
      // Check if both users have submitted
      const updatedSwap = await db.select().from(geoSwaps).where(eq(geoSwaps.id, swapId));
      if (updatedSwap[0]?.user1ImageUrl && updatedSwap[0]?.user2ImageUrl) {
        await db.update(geoSwaps).set({ isCompleted: true }).where(eq(geoSwaps.id, swapId));
      }
    }
  }

  async createOfflinePost(post: InsertOfflinePost): Promise<OfflinePost> {
    const [newPost] = await db.insert(offlinePosts).values(post).returning();
    return newPost;
  }

  async checkAndTriggerOfflinePosts(userId: string, latitude: number, longitude: number): Promise<Post[]> {
    const triggeredPosts = await db
      .select()
      .from(offlinePosts)
      .where(
        and(
          eq(offlinePosts.userId, userId),
          eq(offlinePosts.isTriggered, false),
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${offlinePosts.triggerLongitude}, ${offlinePosts.triggerLatitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${offlinePosts.triggerRadius})`
        )
      );

    const newPosts: Post[] = [];
    for (const offlinePost of triggeredPosts) {
      const [newPost] = await db.insert(posts).values({
        userId: offlinePost.userId,
        content: offlinePost.content,
        imageUrl: offlinePost.imageUrl,
        latitude: offlinePost.triggerLatitude,
        longitude: offlinePost.triggerLongitude,
        visibilityRadius: 500,
      }).returning();
      
      await db.update(offlinePosts).set({ isTriggered: true }).where(eq(offlinePosts.id, offlinePost.id));
      newPosts.push(newPost);
    }

    return newPosts;
  }

  async cleanupExpiredContent(): Promise<void> {
    const now = new Date();
    
    // Delete expired posts
    await db.delete(posts).where(and(sql`${posts.expiresAt} IS NOT NULL`, lt(posts.expiresAt, now)));
    
    // Delete expired confessions
    await db.delete(confessions).where(and(sql`${confessions.expiresAt} IS NOT NULL`, lt(confessions.expiresAt, now)));
    
    // Deactivate expired challenges
    await db.update(challenges).set({ isActive: false }).where(and(sql`${challenges.expiresAt} IS NOT NULL`, lt(challenges.expiresAt, now)));
  }

  async generateDailySummary(latitude: number, longitude: number, radius: number): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${posts.longitude}, ${posts.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`,
          gt(posts.createdAt, today)
        )
      );

    const [capsuleCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(geoTimeCapsules)
      .where(
        and(
          eq(geoTimeCapsules.isOpened, false),
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${geoTimeCapsules.longitude}, ${geoTimeCapsules.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`
        )
      );

    const [truthModeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          eq(posts.isTruthMode, true),
          sql`ST_DWithin(ST_SetSRID(ST_MakePoint(${posts.longitude}, ${posts.latitude}), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})`,
          gt(posts.createdAt, today)
        )
      );

    return `${postCount.count || 0} new posts nearby, trending: 'Local Life' • ${capsuleCount.count || 0} active GeoTime Capsules • ${truthModeCount.count || 0} people joined Truth Mode`;
  }
}

export const storage = new DatabaseStorage();
