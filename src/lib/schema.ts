// src/lib/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Existing Better Auth tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// New tables for extended user profile and child management
export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  language: text("language", {
    enum: [
      "English",
      "Hindi",
      "Assamese",
      "Bengali",
      "Kannada",
      "Tamil",
      "Marathi",
    ],
  })
    .notNull()
    .default("English"),
  avatar: text("avatar"), // Add this field for profile avatar
  onboardingCompleted: integer("onboardingCompleted", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const child = sqliteTable("child", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }).notNull(),
  gender: text("gender", { enum: ["Male", "Female", "Other"] }).notNull(),
  headCircumference: real("headCircumference"), // in cm
  height: real("height"), // in cm
  weight: real("weight"), // in kg
  profileImage: text("profileImage"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const userChildRelation = sqliteTable("user_child_relation", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  childId: text("childId")
    .notNull()
    .references(() => child.id, { onDelete: "cascade" }),
  relationship: text("relationship", {
    enum: [
      "Dad",
      "Mom",
      "Babysitter",
      "Brother",
      "Sister",
      "Grandparent",
      "Other",
    ],
  }).notNull(),
  isPrimary: integer("isPrimary", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const milestone = sqliteTable("milestone", {
  id: text("id").primaryKey(),
  childId: text("childId")
    .notNull()
    .references(() => child.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  achievedAt: integer("achievedAt", { mode: "timestamp" }).notNull(),
  photos: text("photos"), // JSON array of photo URLs
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const activity = sqliteTable("activity", {
  id: text("id").primaryKey(),
  childId: text("childId")
    .notNull()
    .references(() => child.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"), // in minutes
  category: text("category"), // play, learning, exercise, etc.
  recordedAt: integer("recordedAt", { mode: "timestamp" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
