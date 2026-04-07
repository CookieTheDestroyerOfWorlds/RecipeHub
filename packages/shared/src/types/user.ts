export type UserRole = 'user' | 'admin';

export interface PublicUser {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface PrivateUser extends PublicUser {
  email: string;
}

export interface AdminUser extends PrivateUser {
  recipeCount: number;
}
