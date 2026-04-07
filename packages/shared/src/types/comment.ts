import type { PublicUser } from './user';

export interface Comment {
  id: string;
  recipeId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<PublicUser, 'id' | 'username' | 'displayName' | 'avatarUrl'> | null;
}
