import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  authStorage,
  foodStorage,
  cartStorage,
  ordersStorage,
} from "@/lib/storage";
import { Order, OrderItem } from "@shared/api";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const currentCart = cartStorage.getCart();
    if (currentCart.length === 0) {
      navigate("/cart");
      return;
    }

    // Get food items with details
    const loadCartDetails = async () => {
      const cartWithDetails = await Promise.all(
        currentCart.map(async (item) => ({
          ...item,
          food: await foodStorage.getFoodById(item.foodId),
        }))
      );
      setCart(cartWithDetails);
    };

    loadCartDetails();

    // Pre-fill phone from user
    if (user.phone) {
      setDeliveryPhone(user.phone);
    }
    if (user.address) {
      setDeliveryAddress(user.address);
    }
  }, [navigate]);

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.food?.price) || 0) * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!deliveryAddress || !deliveryPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const user = authStorage.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Get first chef (in real app, orders go to the respective chef)
      const firstFood = cart[0]?.food;
      if (!firstFood) {
        throw new Error("No food in cart");
      }

      const chefId = (firstFood.chef_id || firstFood.chefId)?.toString();
      if (!chefId) {
        throw new Error("Chef ID not found");
      }

      // Create order items for API
      const orderItems = cart.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
      }));

      // Create order via API
      const newOrder = await ordersStorage.addOrder({
        chefId,
        items: orderItems,
        deliveryAddress,
        deliveryPhone,
        deliveryTime: deliveryTime || undefined,
        notes: notes || undefined,
      });

      // Clear cart
      cartStorage.clearCart();

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      navigate(`/order-confirmation/${newOrder.id}`);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Delivery Address Section */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Time Section */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Delivery Time
                  </h2>
                  <div>
                    <Label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-900 mb-2">
                      Preferred Delivery Time
                    </Label>
                    <Input
                      id="deliveryTime"
                      type="text"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      placeholder="e.g., 30 minutes, 1 hour, 6 PM"
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Leave empty for ASAP delivery
                    </p>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Special Instructions
                  </h2>
                  <div>
                    <Label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or instructions?"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h2 className="text-lg font-bold text-blue-900 mb-2">
                    Payment Method
                  </h2>
                  <p className="text-blue-800 font-medium">
                    💵 Cash on Delivery (COD)
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Pay the total amount when your order arrives at your doorstep
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-4 border-b pb-4">
                  {cart.map((item) => (
                    <div key={item.foodId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.food?.name || "Item"} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${((Number(item.food?.price) || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
