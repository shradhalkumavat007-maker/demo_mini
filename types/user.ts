export type UserRole = 'admin' | 'manager' | 'staff';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
