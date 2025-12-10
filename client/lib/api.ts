import { AuthResponse, FoodResponse, OrderResponse, User, FoodItem, Order } from "@shared/api";

// Use relative URL for proxy in development to avoid CORS issues
// The Vite proxy will forward requests to the actual API
// In production, you can set VITE_API_URL to use direct API calls
const getApiBaseUrl = (): string => {
  // In development, always use relative URL to leverage Vite proxy
  // This avoids CORS issues since requests appear to come from same origin
  if (import.meta.env.DEV) {
    return "/api";
  }
  
  // In production, use environment variable if set, otherwise default
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
  }
  
  // Fallback to relative URL
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Set auth token
const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// Clear auth token
const clearToken = (): void => {
  localStorage.removeItem("token");
};

// Timeout helper
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    // Add 30 second timeout
    const response = await timeoutPromise(
      fetch(url, {
        ...options,
        headers,
      }),
      30000 // 30 seconds
    );

    // Handle successful responses (200, 201, etc.)
    if (response.ok) {
      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return {} as T;
      }
      return response.json();
    }

    // Handle error responses
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || errorData.error || errorData.errors || `HTTP error! status: ${response.status}`;
      console.error(`[API Error] ${response.status} ${url}:`, errorData);
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } catch (error) {
      // If JSON parsing fails, try to get text response
      if (error instanceof Error && error.name !== 'SyntaxError') {
        throw error;
      }
      try {
        const text = await response.text();
        console.error(`[API Error] ${response.status} ${url}:`, text);
        throw new Error(text || `HTTP error! status: ${response.status}`);
      } catch {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw new Error("Request timed out. Please check your connection and try again.");
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Network error. Please check your connection and ensure the API is accessible.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

// Auth API
export const authAPI = {
  register: async (
    name: string,
    email: string,
    password: string,
    phone: string,
    role: "chef" | "customer",
    address?: string,
    password_confirmation?: string
  ): Promise<AuthResponse> => {
    const registerData: any = {
      name,
      email,
      password,
      phone,
      role,
    };
    
    if (address) registerData.address = address;
    if (password_confirmation) registerData.password_confirmation = password_confirmation;
    
    const data = await apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });

    const response: AuthResponse = {
      success: data.success || false,
      user: data.user,
      token: data.token,
      message: data.message || "Registration successful",
    };

    if (response.success && response.token) {
      setToken(response.token);
      if (response.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.user));
      }
    }

    return response;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const response: AuthResponse = {
      success: data.success || false,
      user: data.user,
      token: data.token,
      message: data.message || "Login successful",
    };

    if (response.success && response.token) {
      setToken(response.token);
      if (response.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.user));
      }
    }

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearToken();
      localStorage.removeItem("currentUser");
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const data = await apiRequest<any>("/auth/user");
      if (data.success && data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      clearToken();
      localStorage.removeItem("currentUser");
      return null;
    }
  },
};

// Food API
export const foodAPI = {
  getAll: async (search?: string, category?: string): Promise<FoodItem[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "all") params.append("category", category);

    const data = await apiRequest<any>(
      `/foods${params.toString() ? `?${params.toString()}` : ""}`
    );

    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  getById: async (id: string): Promise<FoodItem | null> => {
    const data = await apiRequest<any>(`/foods/${id}`);
    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    return null;
  },

  create: async (food: Omit<FoodItem, "id" | "createdAt">): Promise<FoodItem> => {
    const data = await apiRequest<any>("/foods", {
      method: "POST",
      body: JSON.stringify({
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        quantity: food.quantity,
        delivery_time: food.deliveryTime || food.delivery_time,
        is_available: food.isAvailable !== undefined ? food.isAvailable : food.is_available,
      }),
    });

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    throw new Error(data.message || "Failed to create food item");
  },

  update: async (id: string, food: Partial<FoodItem>): Promise<FoodItem> => {
    const updateData: any = {};
    if (food.name) updateData.name = food.name;
    if (food.description) updateData.description = food.description;
    if (food.price !== undefined) updateData.price = food.price;
    if (food.category) updateData.category = food.category;
    if (food.image) updateData.image = food.image;
    if (food.quantity !== undefined) updateData.quantity = food.quantity;
    if (food.deliveryTime !== undefined) updateData.delivery_time = food.deliveryTime;
    if (food.delivery_time !== undefined) updateData.delivery_time = food.delivery_time;
    if (food.isAvailable !== undefined) updateData.is_available = food.isAvailable;
    if (food.is_available !== undefined) updateData.is_available = food.is_available;

    const data = await apiRequest<any>(`/foods/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    throw new Error(data.message || "Failed to update food item");
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/foods/${id}`, {
      method: "DELETE",
    });
  },
};

// Order API
export const orderAPI = {
  getAll: async (): Promise<Order[]> => {
    const data = await apiRequest<any>("/orders");
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  getById: async (id: string): Promise<Order | null> => {
    const data = await apiRequest<any>(`/orders/${id}`);
    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    return null;
  },

  create: async (order: {
    chefId: string;
    items: Array<{ foodId: string; quantity: number }>;
    deliveryAddress: string;
    deliveryPhone: string;
    deliveryTime?: string;
    notes?: string;
  }): Promise<Order> => {
    const data = await apiRequest<any>("/orders", {
      method: "POST",
      body: JSON.stringify({
        chef_id: order.chefId,
        items: order.items.map(item => ({
          food_id: item.foodId,
          quantity: item.quantity,
        })),
        delivery_address: order.deliveryAddress,
        delivery_phone: order.deliveryPhone,
        delivery_time: order.deliveryTime,
        notes: order.notes,
      }),
    });

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    throw new Error(data.message || "Failed to create order");
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const data = await apiRequest<any>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data.data;
    }
    throw new Error(data.message || "Failed to update order status");
  },
};

// Category API
export const categoryAPI = {
  getAll: async (): Promise<any[]> => {
    const data = await apiRequest<any>("/categories");
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  getById: async (id: string): Promise<any | null> => {
    const data = await apiRequest<any>(`/categories/${id}`);
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  },

  getFoods: async (id: string): Promise<FoodItem[]> => {
    const data = await apiRequest<any>(`/categories/${id}/foods`);
    if (data.success && data.data && data.data.foods) {
      return data.data.foods;
    }
    return [];
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User | null> => {
    const data = await apiRequest<any>("/user/profile");
    if (data.success && data.data) {
      localStorage.setItem("currentUser", JSON.stringify(data.data));
      return data.data;
    }
    return null;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;

    const data = await apiRequest<any>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    if (data.success && data.data) {
      localStorage.setItem("currentUser", JSON.stringify(data.data));
      return data.data;
    }
    throw new Error(data.message || "Failed to update profile");
  },

  updatePassword: async (password: string): Promise<void> => {
    const data = await apiRequest<any>("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ password }),
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to update password");
    }
  },
};

export { getToken, setToken, clearToken };

