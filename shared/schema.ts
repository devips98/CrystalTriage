import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  trustScore: integer("trust_score").default(50),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table with location data
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  locationName: text("location_name"),
  isTruthMode: boolean("is_truth_mode").default(false),
  isAnonymous: boolean("is_anonymous").default(false),
  expiresAt: timestamp("expires_at"),
  visibilityRadius: integer("visibility_radius").default(500), // in meters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GeoTime Capsules
export const geoTimeCapsules = pgTable("geo_time_capsules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  isOpened: boolean("is_opened").default(false),
  visibilityRadius: integer("visibility_radius").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Anonymous confessions
export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  visibilityRadius: integer("visibility_radius").default(200),
  reactions: jsonb("reactions").$type<Record<string, number>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  visibilityRadius: integer("visibility_radius").default(1000),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge participations
export const challengeParticipations = pgTable("challenge_participations", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  receiverId: text("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// GeoSwap exchanges
export const geoSwaps = pgTable("geo_swaps", {
  id: serial("id").primaryKey(),
  user1Id: text("user1_id").references(() => users.id).notNull(),
  user2Id: text("user2_id").references(() => users.id),
  user1Item: text("user1_item").notNull(), // Item description
  user2Item: text("user2_item"), // Item description
  user1ImageUrl: text("user1_image_url"),
  user2ImageUrl: text("user2_image_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // books, electronics, clothing, etc.
  isCompleted: boolean("is_completed").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offline geo-triggered posts
export const offlinePosts = pgTable("offline_posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  triggerLatitude: real("trigger_latitude").notNull(),
  triggerLongitude: real("trigger_longitude").notNull(),
  triggerRadius: integer("trigger_radius").default(50),
  isTriggered: boolean("is_triggered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  geoTimeCapsules: many(geoTimeCapsules),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  challengeParticipations: many(challengeParticipations),
  postLikes: many(postLikes),
  postComments: many(postComments),
  offlinePosts: many(offlinePosts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  participations: many(challengeParticipations),
}));

export const challengeParticipationsRelations = relations(challengeParticipations, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipations.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConfessionSchema = createInsertSchema(confessions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertGeoTimeCapsuleSchema = createInsertSchema(geoTimeCapsules).omit({
  id: true,
  createdAt: true,
});

export const insertGeoSwapSchema = createInsertSchema(geoSwaps).omit({
  id: true,
  createdAt: true,
});

export const insertOfflinePostSchema = createInsertSchema(offlinePosts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Confession = typeof confessions.$inferSelect;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type GeoTimeCapsule = typeof geoTimeCapsules.$inferSelect;
export type InsertGeoTimeCapsule = z.infer<typeof insertGeoTimeCapsuleSchema>;
export type GeoSwap = typeof geoSwaps.$inferSelect;
export type InsertGeoSwap = z.infer<typeof insertGeoSwapSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type ChallengeParticipation = typeof challengeParticipations.$inferSelect;
export type OfflinePost = typeof offlinePosts.$inferSelect;
export type InsertOfflinePost = z.infer<typeof insertOfflinePostSchema>;
