import { useState, useEffect } from "react";
import { CartItem, cartStorage } from "@/lib/storage";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const currentCart = cartStorage.getCart();
    setCart(currentCart);
  }, []);

  const addToCart = (foodId: string, quantity: number) => {
    cartStorage.addToCart(foodId, quantity);
    const updated = cartStorage.getCart();
    setCart(updated);
  };

  const removeFromCart = (foodId: string) => {
    cartStorage.removeFromCart(foodId);
    const updated = cartStorage.getCart();
    setCart(updated);
  };

  const clearCart = () => {
    cartStorage.clearCart();
    setCart([]);
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    const currentCart = cartStorage.getCart();
    const item = currentCart.find((i) => i.foodId === foodId);
    if (item) {
      item.quantity = Math.max(0, quantity);
    }
    cartStorage.setCart(currentCart);
    setCart(currentCart);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
  };
}
