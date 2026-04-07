import { z } from 'zod';

const ingredientSchema = z.object({
  amount: z.string().min(1),
  unit: z.string(),
  name: z.string().min(1),
  notes: z.string().optional(),
});

const stepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  cuisine: z.string().max(100).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prepTimeMins: z.number().int().nonnegative().optional(),
  cookTimeMins: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive().optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  steps: z.array(stepSchema).min(1, 'At least one step is required'),
  tags: z.array(z.string().max(50)).optional(),
  isPublished: z.boolean().optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const recipeQuerySchema = z.object({
  q: z.string().optional(),
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  authorId: z.string().uuid().optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
