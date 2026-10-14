import type { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Arjun Patel',
    email: 'admin@electrostock.demo',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-09-28T09:30:00Z',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Neha Verma',
    email: 'manager@electrostock.demo',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-09-27T14:15:00Z',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Sanjay Kumar',
    email: 'staff@electrostock.demo',
    role: 'staff',
    status: 'active',
    lastLogin: '2024-09-26T17:00:00Z',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Deepika Nair',
    email: 'deepika@electrostock.demo',
    role: 'staff',
    status: 'active',
    lastLogin: '2024-09-25T16:00:00Z',
    createdAt: '2024-04-15T08:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Vikram Singh',
    email: 'vikram@electrostock.demo',
    role: 'manager',
    status: 'inactive',
    lastLogin: '2024-08-01T10:00:00Z',
    createdAt: '2024-03-10T08:00:00Z',
  },
];

export const demoAccounts = [
  { email: 'admin@electrostock.demo', password: 'admin123', name: 'Arjun Patel', role: 'admin' as const, id: 'user-1' },
  { email: 'manager@electrostock.demo', password: 'manager123', name: 'Neha Verma', role: 'manager' as const, id: 'user-2' },
  { email: 'staff@electrostock.demo', password: 'staff123', name: 'Sanjay Kumar', role: 'staff' as const, id: 'user-3' },
];
