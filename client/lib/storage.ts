import {
  User,
  FoodItem,
  Order,
  UserRole,
  OrderStatus,
  normalizeUser,
  normalizeFoodItem,
  normalizeOrder,
} from "@shared/api";
import { authAPI, foodAPI, orderAPI, userAPI } from "./api";

// Auth Storage (now uses API)
export const authStorage = {
  getUser: (): User | null => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  },
};

// Users Storage (deprecated - use API directly)
export const usersStorage = {
  getAllUsers: (): User[] => {
    // This is no longer used - users are managed via API
    return [];
  },
  getUserById: (id: string): User | undefined => {
    // This is no longer used - use API directly
    return undefined;
  },
  getUserByEmail: (email: string): User | undefined => {
    // This is no longer used - use API directly
    return undefined;
  },
  addUser: (user: User) => {
    // This is no longer used - use authAPI.register
  },
  updateUser: (user: User) => {
    // This is no longer used - use userAPI.updateProfile
  },
};

// Food Items Storage (now uses API)
export const foodStorage = {
  getAllFood: async (): Promise<FoodItem[]> => {
    try {
      const foods = await foodAPI.getAll();
      return foods.map(normalizeFoodItem);
    } catch (error) {
      console.error("Error fetching foods:", error);
      return [];
    }
  },
  getFoodById: async (id: string): Promise<FoodItem | undefined> => {
    try {
      const food = await foodAPI.getById(id);
      return food ? normalizeFoodItem(food) : undefined;
    } catch (error) {
      console.error("Error fetching food:", error);
      return undefined;
    }
  },
  getFoodByChef: async (chefId: string): Promise<FoodItem[]> => {
    try {
      const foods = await foodAPI.getAll();
      return foods
        .filter((f) => (f.chef_id || f.chefId)?.toString() === chefId.toString())
        .map(normalizeFoodItem);
    } catch (error) {
      console.error("Error fetching chef foods:", error);
      return [];
    }
  },
  addFood: async (food: Omit<FoodItem, "id" | "createdAt">): Promise<FoodItem> => {
    const newFood = await foodAPI.create(food);
    return normalizeFoodItem(newFood);
  },
  updateFood: async (food: FoodItem): Promise<FoodItem> => {
    const updated = await foodAPI.update(food.id.toString(), food);
    return normalizeFoodItem(updated);
  },
  deleteFood: async (id: string): Promise<void> => {
    await foodAPI.delete(id);
  },
};

// Orders Storage (now uses API)
export const ordersStorage = {
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const orders = await orderAPI.getAll();
      return orders.map(normalizeOrder);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },
  getOrderById: async (id: string): Promise<Order | undefined> => {
    try {
      const order = await orderAPI.getById(id);
      return order ? normalizeOrder(order) : undefined;
    } catch (error) {
      console.error("Error fetching order:", error);
      return undefined;
    }
  },
  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    try {
      const orders = await orderAPI.getAll();
      return orders
        .filter((o) => (o.customer_id || o.customerId)?.toString() === customerId.toString())
        .map(normalizeOrder);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      return [];
    }
  },
  getOrdersByChef: async (chefId: string): Promise<Order[]> => {
    try {
      const orders = await orderAPI.getAll();
      return orders
        .filter((o) => (o.chef_id || o.chefId)?.toString() === chefId.toString())
        .map(normalizeOrder);
    } catch (error) {
      console.error("Error fetching chef orders:", error);
      return [];
    }
  },
  addOrder: async (order: {
    chefId: string;
    items: Array<{ foodId: string; quantity: number }>;
    deliveryAddress: string;
    deliveryPhone: string;
    deliveryTime?: string;
    notes?: string;
  }): Promise<Order> => {
    const newOrder = await orderAPI.create(order);
    return normalizeOrder(newOrder);
  },
  updateOrder: async (order: Order): Promise<Order> => {
    // For now, we only support status updates via API
    if (order.status) {
      const updated = await orderAPI.updateStatus(order.id.toString(), order.status);
      return normalizeOrder(updated);
    }
    return order;
  },
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await orderAPI.updateStatus(orderId, status);
  },
};

// Cart Storage (still uses localStorage - client-side only)
export interface CartItem {
  foodId: string;
  quantity: number;
}

export const cartStorage = {
  getCart: (): CartItem[] => {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  },
  setCart: (items: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
  },
  addToCart: (foodId: string, quantity: number) => {
    const cart = cartStorage.getCart();
    const existing = cart.find((item) => item.foodId === foodId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ foodId, quantity });
    }
    cartStorage.setCart(cart);
  },
  removeFromCart: (foodId: string) => {
    const cart = cartStorage.getCart();
    const filtered = cart.filter((item) => item.foodId !== foodId);
    cartStorage.setCart(filtered);
  },
  clearCart: () => {
    localStorage.removeItem("cart");
  },
};

// Export API functions and normalize functions for direct use
export { authAPI, foodAPI, orderAPI, userAPI };
export { normalizeUser, normalizeFoodItem, normalizeOrder } from "@shared/api";
