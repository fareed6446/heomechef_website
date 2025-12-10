import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { authStorage, foodStorage, cartStorage } from "@/lib/storage";
import { FoodItem } from "@shared/api";
import { Trash2, ArrowLeft, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";

interface CartItemWithDetails {
  foodId: string;
  quantity: number;
  food: FoodItem;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadCartItems = async () => {
      try {
        const items: CartItemWithDetails[] = [];
        await Promise.all(
          cart.map(async (item) => {
            const food = await foodStorage.getFoodById(item.foodId);
            if (food) {
              items.push({
                ...item,
                food,
              });
            }
          })
        );
        setCartItems(items);
      } catch (error) {
        console.error("Error loading cart items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, [cart, navigate]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.food.price) * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleQuantityChange = (foodId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodId);
    } else {
      updateQuantity(foodId, newQuantity);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        className="min-h-[calc(100vh-200px)] bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate("/gallery")}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-4"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </motion.button>
            <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div
              className="bg-white rounded-lg shadow p-8 text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🛒
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some delicious food to get started!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate("/gallery")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Start Shopping
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Cart Items */}
              <motion.div className="lg:col-span-2 bg-white rounded-lg shadow">
                <motion.div className="p-6 space-y-6">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.foodId}
                      className="flex gap-4 border-b pb-6 last:border-b-0 last:pb-0"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                    >
                      {/* Food Image */}
                      <motion.div
                        className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        {item.food.image ? (
                          <img
                            src={item.food.image}
                            alt={item.food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                            <span className="text-3xl">🍜</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {item.food.name}
                        </h3>
                        <p className="text-orange-600 font-bold text-lg">
                          ${Number(item.food.price).toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <motion.div
                          className="flex items-center gap-3 mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <motion.button
                            onClick={() =>
                              handleQuantityChange(item.foodId, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-100 rounded transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={18} />
                          </motion.button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() =>
                              handleQuantityChange(item.foodId, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-100 rounded transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={item.quantity >= item.food.quantity}
                          >
                            <Plus size={18} />
                          </motion.button>
                        </motion.div>
                      </div>

                      {/* Total & Remove */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          ${(Number(item.food.price) * item.quantity).toFixed(2)}
                        </p>
                        <motion.button
                          onClick={() => removeFromCart(item.foodId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow p-6 sticky top-8 space-y-4"
                  whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Summary
                  </h2>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-semibold">
                        ${deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    className="border-t pt-4"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
                      >
                        Proceed to Checkout
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    ✓ Cash on Delivery (COD) - Pay when your order arrives
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
}
