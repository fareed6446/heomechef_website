import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { authStorage, ordersStorage } from "@/lib/storage";
import { Order } from "@shared/api";
import { CheckCircle, Clock, MapPin, Phone } from "lucide-react";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    if (orderId) {
      const loadOrder = async () => {
        try {
          const foundOrder = await ordersStorage.getOrderById(orderId);
          if (foundOrder) {
            const customerId = foundOrder.customerId || foundOrder.customer_id;
            if (customerId?.toString() === user.id.toString()) {
              setOrder(foundOrder);
            } else {
              navigate("/my-orders");
            }
          } else {
            navigate("/my-orders");
          }
        } catch (error) {
          console.error("Error loading order:", error);
          navigate("/my-orders");
        } finally {
          setLoading(false);
        }
      };
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Order not found</p>
            <Button
              onClick={() => navigate("/gallery")}
              className="mt-4 bg-orange-600 hover:bg-orange-700"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <CheckCircle size={80} className="text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your order. We're preparing your food.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            {/* Order ID and Status */}
            <div className="border-b pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium text-gray-900">{order.deliveryAddress || order.delivery_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-medium text-gray-900">{order.deliveryPhone || order.delivery_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Time</p>
                    <p className="font-medium text-gray-900">
                      {order.deliveryTime || "ASAP"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.foodName || item.food_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold text-orange-600">
                  ${(order.totalPrice || order.total_price || 0).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Payment Method: Cash on Delivery (COD)
              </p>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-6 flex gap-4">
              <Button
                onClick={() => navigate("/my-orders")}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                Track Order
              </Button>
              <Button
                onClick={() => navigate("/gallery")}
                variant="outline"
                className="flex-1 py-3"
              >
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your order has been received</li>
              <li>✓ Chef will start preparing your food</li>
              <li>✓ You'll receive a call when it's ready</li>
              <li>✓ Payment will be collected at delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
