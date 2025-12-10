import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { authStorage, foodStorage, ordersStorage } from "@/lib/storage";
import { FoodItem, Order } from "@shared/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"foods" | "orders">("foods");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user || user.role !== "chef") {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const chefFoods = await foodStorage.getFoodByChef(user.id.toString());
        const chefOrders = await ordersStorage.getOrdersByChef(user.id.toString());

        setFoods(chefFoods);
        setOrders(chefOrders);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleDeleteFood = async (foodId: string | number) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await foodStorage.deleteFood(foodId.toString());
        setFoods(foods.filter((f) => f.id.toString() !== foodId.toString()));
        toast({
          title: "Success",
          description: "Food item deleted",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete food item",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      const updated = await foodStorage.updateFood({
        ...food,
        isAvailable: !(food.isAvailable || food.is_available),
      });
      setFoods(foods.map((f) => (f.id.toString() === food.id.toString() ? updated : f)));
      toast({
        title: "Success",
        description: `Food marked as ${updated.isAvailable || updated.is_available ? "available" : "unavailable"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update food item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: string
  ) => {
    try {
      await ordersStorage.updateOrderStatus(orderId.toString(), newStatus as any);
      const updated = orders.map((o) =>
        o.id.toString() === orderId.toString() ? { ...o, status: newStatus as any } : o
      );
      setOrders(updated);
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
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
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Chef Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your food items and orders</p>
            </div>
            <Button
              onClick={() => navigate("/upload-food")}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Food Item
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("foods")}
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === "foods"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Food Items ({foods.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === "orders"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          {/* Food Items Tab */}
          {activeTab === "foods" && (
            <div>
              {foods.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    No food items yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload your first delicious dish!
                  </p>
                  <Button
                    onClick={() => navigate("/upload-food")}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Upload Food Item
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-white rounded-lg shadow p-6 flex gap-6"
                    >
                      {/* Food Image */}
                      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                            <span className="text-3xl">🍜</span>
                          </div>
                        )}
                      </div>

                      {/* Food Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {food.name}
                        </h3>
                        <p className="text-gray-600 mb-3">{food.description}</p>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-bold text-orange-600 text-lg">
                              ${Number(food.price).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Available</p>
                            <p className="font-bold text-lg">{food.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Category</p>
                            <p className="font-bold text-lg">{food.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivery Time</p>
                            <p className="font-bold text-lg">{food.deliveryTime || food.delivery_time || 30}min</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/edit-food/${food.id}`)}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleAvailability(food)}
                            >
                              {(food.isAvailable || food.is_available !== false) ? "Mark Unavailable" : "Mark Available"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteFood(food.id.toString())}
                              className="text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    No orders yet
                  </h2>
                  <p className="text-gray-600">
                    Customers will place orders here once available
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow p-6 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="text-xl font-bold text-gray-900">
                            {order.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-orange-600">
                            ${order.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Delivery Address</p>
                          <p className="font-medium text-gray-900">
                            {order.deliveryAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {order.deliveryPhone}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Items</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-gray-900">
                              • {item.foodName} x {item.quantity} - $
                              {(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 flex justify-between items-center">
                        <div>
                          <span
                            className={`px-4 py-2 rounded-full font-medium capitalize ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "preparing"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "ready"
                                ? "bg-orange-100 text-orange-800"
                                : order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">Update Status</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "confirmed")
                              }
                            >
                              Confirm Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "preparing")
                              }
                            >
                              Preparing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "ready")
                              }
                            >
                              Ready for Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "delivered")
                              }
                            >
                              Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
