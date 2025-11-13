import { pgTable, text, varchar, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conceptronShapeEnum = z.enum(["circle", "triangle", "square", "hexagon", "pentagon"]);

export const conceptronSchema = z.object({
  id: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  shape: conceptronShapeEnum,
  tone: z.number().min(20).max(20000),
  metadata: z.record(z.any()).optional(),
});

export const conceptronChainSchema = z.object({
  id: z.string(),
  conceptrons: z.array(z.string()),
  name: z.string().optional(),
});

export type Conceptron = z.infer<typeof conceptronSchema>;
export type ConceptronChain = z.infer<typeof conceptronChainSchema>;
export type ConceptronShape = z.infer<typeof conceptronShapeEnum>;

export const experiments = pgTable("experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  conceptrons: jsonb("conceptrons").notNull().$type<Conceptron[]>(),
  chains: jsonb("chains").notNull().$type<ConceptronChain[]>(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  createdAt: true,
}).extend({
  conceptrons: z.array(conceptronSchema),
  chains: z.array(conceptronChainSchema),
});

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
