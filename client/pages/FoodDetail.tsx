import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { authStorage, foodStorage } from "@/lib/storage";
import { FoodItem } from "@shared/api";
import { ShoppingCart, Clock, ArrowLeft, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function FoodDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    if (id) {
      const loadFood = async () => {
        try {
          const foundFood = await foodStorage.getFoodById(id);
          if (foundFood) {
            setFood(foundFood);
          } else {
            navigate("/gallery");
          }
        } catch (error) {
          console.error("Error loading food:", error);
          navigate("/gallery");
        }
      };
      loadFood();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (food && quantity > 0) {
      addToCart(food.id.toString(), quantity);
      navigate("/cart");
    }
  };

  const incrementQuantity = () => {
    if (food) {
      const availableQty = food.quantity || 0;
      const isAvailable = food.isAvailable !== undefined ? food.isAvailable : food.is_available !== false;
      if (quantity < availableQty && isAvailable) {
        setQuantity(quantity + 1);
      }
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!food) {
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
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/gallery")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6"
          >
            <ArrowLeft size={20} />
            Back to Gallery
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-8">
            {/* Image Section */}
            <div>
              <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                {food.image ? (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                    <span className="text-8xl">🍜</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {food.category}
                </span>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {food.name}
                </h1>

                <p className="text-gray-600 text-lg mb-6">
                  {food.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm">Price per item</p>
                  <p className="text-4xl font-bold text-orange-600">
                    ${Number(food.price).toFixed(2)}
                  </p>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <Clock size={20} className="text-orange-600" />
                  <span>Estimated delivery: {food.deliveryTime || food.delivery_time || 30} minutes</span>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  {(food.isAvailable || food.is_available !== false) && food.quantity > 0 ? (
                    <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      ✓ In Stock ({food.quantity} available)
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
                      ✗ Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              {(food.isAvailable || food.is_available !== false) && food.quantity > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={decrementQuantity}
                        className="p-2 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-2 font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        className="p-2 hover:bg-gray-100"
                        disabled={quantity >= food.quantity}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart - ${(Number(food.price) * quantity).toFixed(2)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
