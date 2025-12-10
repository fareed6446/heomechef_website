import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { authStorage, ordersStorage } from "@/lib/storage";
import { Order } from "@shared/api";
import { ChevronDown } from "lucide-react";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        let userOrders: Order[] = [];
        if (user.role === "customer") {
          userOrders = await ordersStorage.getOrdersByCustomer(user.id.toString());
        } else if (user.role === "chef") {
          userOrders = await ordersStorage.getOrdersByChef(user.id.toString());
        }

        setOrders(userOrders.sort((a, b) => {
          const dateA = a.createdAt || a.created_at || "";
          const dateB = b.createdAt || b.created_at || "";
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }));
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet
              </p>
              <Button
                onClick={() => navigate("/gallery")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                    className="w-full p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.id.toString().substring(0, 8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt || order.created_at || "")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">
                          ${(order.totalPrice || order.total_price || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronDown
                        size={24}
                        className={`ml-4 transition ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Order Details */}
                  {expandedOrder === order.id && (
                    <div className="border-t bg-gray-50 p-6 space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-600">
                                {item.foodName} x {item.quantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Delivery Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600">Address</p>
                            <p className="text-gray-900 font-medium">
                              {order.deliveryAddress || order.delivery_address}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Contact</p>
                            <p className="text-gray-900 font-medium">
                              {order.deliveryPhone || order.delivery_phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivery Time</p>
                            <p className="text-gray-900 font-medium">
                              {order.deliveryTime || "ASAP"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Status Timeline */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Status Timeline
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <span className="text-gray-600">
                              Order placed on {formatDate(order.createdAt || order.created_at || "")}
                            </span>
                          </div>
                          {order.status !== "pending" && (
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                              <span className="text-gray-600 capitalize">
                                {order.status} on{" "}
                                {formatDate(order.updatedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Special Notes */}
                      {order.notes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Special Instructions
                          </h4>
                          <p className="text-gray-600 bg-white p-3 rounded border border-gray-200">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Payment Info */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Payment Method:
                          </span>
                          <span className="font-semibold text-gray-900">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="text-2xl font-bold text-orange-600">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
