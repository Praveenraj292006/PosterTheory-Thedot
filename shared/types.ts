// Shared types between frontend and backend

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface Product {
  id: number;
  title: string;
  collection: string;
  layout: 'Single' | 'Duo' | 'Trio' | 'Quad';
  price: number;
  image: string;
}

export interface Order {
  id: number;
  user_id: number;
  items: string; // JSON string of CartItem[]
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
}

export interface Design {
  id: number;
  user_id: number;
  text: string;
  font_size: number;
  size: string;
  position: string; // JSON string
}

export interface CartItem {
  cartItemId: string;
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  collection: string;
  size: string;
  designId?: string | number;
  customSpecs?: {
    size: string;
    unitCount: number;
    fileNames: string[];
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

