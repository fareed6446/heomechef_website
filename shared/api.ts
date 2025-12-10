export interface DemoResponse {
  message: string;
}

// User Types
export type UserRole = "chef" | "customer";

// Laravel returns snake_case, but we'll convert to camelCase
export interface User {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // For backward compatibility
}

// Food Item Types (Laravel format)
export interface FoodItem {
  id: number | string;
  chef_id?: number | string;
  chefId?: number | string; // For backward compatibility
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null; // base64 or URL
  quantity: number; // available quantity
  delivery_time?: number; // in minutes
  deliveryTime?: number; // For backward compatibility
  is_available?: boolean;
  isAvailable?: boolean; // For backward compatibility
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // For backward compatibility
  chef?: User; // Related chef data
}

// Order Types
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItem {
  id?: number | string;
  order_id?: number | string;
  food_id: number | string;
  foodId?: number | string; // For backward compatibility
  food_name: string;
  foodName?: string; // For backward compatibility
  price: number;
  quantity: number;
  food?: FoodItem; // Related food data
}

export interface Order {
  id: number | string;
  customer_id?: number | string;
  customerId?: number | string; // For backward compatibility
  chef_id?: number | string;
  chefId?: number | string; // For backward compatibility
  total_price?: number;
  totalPrice?: number; // For backward compatibility
  status: OrderStatus;
  delivery_address?: string;
  deliveryAddress?: string; // For backward compatibility
  delivery_phone?: string;
  deliveryPhone?: string; // For backward compatibility
  delivery_time?: string | null; // requested delivery time
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // For backward compatibility
  updatedAt?: string; // For backward compatibility
  items?: OrderItem[];
  customer?: User; // Related customer data
  chef?: User; // Related chef data
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface FoodResponse {
  success: boolean;
  data?: FoodItem | FoodItem[];
  message?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order | Order[];
  message?: string;
}

// Helper function to normalize Laravel response to camelCase
export function normalizeUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address,
    createdAt: user.created_at || user.createdAt,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export function normalizeFoodItem(food: any): FoodItem {
  return {
    id: food.id,
    chefId: food.chef_id || food.chefId,
    chef_id: food.chef_id,
    name: food.name,
    description: food.description,
    price: food.price,
    category: food.category,
    image: food.image,
    quantity: food.quantity,
    deliveryTime: food.delivery_time || food.deliveryTime,
    delivery_time: food.delivery_time,
    isAvailable: food.is_available !== undefined ? food.is_available : food.isAvailable,
    is_available: food.is_available,
    createdAt: food.created_at || food.createdAt,
    created_at: food.created_at,
    updated_at: food.updated_at,
    chef: food.chef ? normalizeUser(food.chef) : undefined,
  };
}

export function normalizeOrder(order: any): Order {
  return {
    id: order.id,
    customerId: order.customer_id || order.customerId,
    customer_id: order.customer_id,
    chefId: order.chef_id || order.chefId,
    chef_id: order.chef_id,
    totalPrice: order.total_price || order.totalPrice,
    total_price: order.total_price,
    status: order.status,
    deliveryAddress: order.delivery_address || order.deliveryAddress,
    delivery_address: order.delivery_address,
    deliveryPhone: order.delivery_phone || order.deliveryPhone,
    delivery_phone: order.delivery_phone,
    deliveryTime: order.delivery_time,
    notes: order.notes,
    createdAt: order.created_at || order.createdAt,
    created_at: order.created_at,
    updatedAt: order.updated_at || order.updatedAt,
    updated_at: order.updated_at,
    items: order.items?.map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      foodId: item.food_id || item.foodId,
      food_id: item.food_id,
      foodName: item.food_name || item.foodName,
      food_name: item.food_name,
      price: item.price,
      quantity: item.quantity,
      food: item.food ? normalizeFoodItem(item.food) : undefined,
    })),
    customer: order.customer ? normalizeUser(order.customer) : undefined,
    chef: order.chef ? normalizeUser(order.chef) : undefined,
  };
}
