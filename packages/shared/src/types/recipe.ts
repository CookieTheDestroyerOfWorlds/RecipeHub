import type { PublicUser } from './user';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
  notes?: string;
}

export interface Step {
  order: number;
  instruction: string;
  imageUrl?: string;
}

export interface RecipeSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  cuisine: string | null;
  difficulty: DifficultyLevel;
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  tags: string[];
  favoriteCount: number;
  commentCount: number;
  author: Pick<PublicUser, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: Ingredient[];
  steps: Step[];
  isFavorited?: boolean;
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  imageUrl?: string;
  cuisine?: string;
  difficulty: DifficultyLevel;
  prepTimeMins?: number;
  cookTimeMins?: number;
  servings?: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags?: string[];
  isPublished?: boolean;
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;
