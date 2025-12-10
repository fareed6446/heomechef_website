import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authStorage, userAPI, normalizeUser } from "@/lib/storage";
import { User } from "@shared/api";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Load fresh user data from API
    const loadUser = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (userData) {
          const normalized = normalizeUser(userData);
          setUser(normalized);
          setFormData({
            name: normalized.name,
            email: normalized.email,
            phone: normalized.phone,
            address: normalized.address || "",
          });
        } else {
          setUser(currentUser);
          setFormData({
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            address: currentUser.address || "",
          });
        }
      } catch (error) {
        // Fallback to cached user
        setUser(currentUser);
        setFormData({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          address: currentUser.address || "",
        });
      }
    };

    loadUser();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const updatedUser = await userAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      const normalized = normalizeUser(updatedUser);
      authStorage.setUser(normalized);
      setUser(normalized);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 mb-8">Manage your account information</p>

          <div className="bg-white rounded-lg shadow p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Role Badge */}
              <div>
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Account Type
                </Label>
                <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold capitalize">
                  {user.role}
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Address (for customers) */}
              {user.role === "customer" && (
                <div>
                  <Label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                    Delivery Address (Optional)
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Your delivery address"
                    className="w-full h-24"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {/* Account Info */}
            <div className="border-t mt-8 pt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account ID</span>
                  <span className="text-gray-900 font-medium">{user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
