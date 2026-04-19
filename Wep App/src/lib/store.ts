// In-memory store for AutoCost
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  role: 'user';
  createdAt: string;
}

export interface Damage {
  type: 'dent' | 'scratch' | 'break' | 'crack' | 'other';
  severity: 'low' | 'medium' | 'high';
  location: string;
  estimatedCost: number;
  description: string;
}

export interface Estimation {
  id: string;
  userId: string;
  carName: string;
  carModel: string;
  carYear: string;
  imageUrl: string;
  damages: Damage[];
  totalCost: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed';
  confidence: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// In-memory storage
const users = new Map<string, User>();
const estimations = new Map<string, Estimation>();
const notifications = new Map<string, Notification>();

// Store operations
export const store = {
  users,
  estimations,
  notifications,
};
