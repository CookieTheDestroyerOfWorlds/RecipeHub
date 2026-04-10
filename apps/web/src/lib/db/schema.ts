import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { Ingredient, Step } from '@recipehub/shared';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const difficultyEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cuisine: varchar('cuisine', { length: 100 }),
    difficulty: difficultyEnum('difficulty').notNull().default('medium'),
    prepTimeMins: integer('prep_time_mins'),
    cookTimeMins: integer('cook_time_mins'),
    servings: integer('servings'),
    ingredients: jsonb('ingredients').notNull().$type<Ingredient[]>(),
    steps: jsonb('steps').notNull().$type<Step[]>(),
    tags: text('tags').array().notNull().default([]),
    isPublished: boolean('is_published').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('recipes_author_id_idx').on(table.authorId),
    index('recipes_cuisine_idx').on(table.cuisine),
    index('recipes_difficulty_idx').on(table.difficulty),
  ]
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('comments_recipe_id_idx').on(table.recipeId)]
);

export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.recipeId] }),
    index('favorites_user_id_idx').on(table.userId),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  comments: many(comments),
  favorites: many(favorites),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  author: one(users, { fields: [recipes.authorId], references: [users.id] }),
  comments: many(comments),
  favorites: many(favorites),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  recipe: one(recipes, { fields: [comments.recipeId], references: [recipes.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  recipe: one(recipes, { fields: [favorites.recipeId], references: [recipes.id] }),
}));

// ─── Type exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
