import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, authStorage, normalizeUser } from "@/lib/storage";
import { UserRole } from "@shared/api";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<UserRole>(
    (searchParams.get("role") as UserRole) || "customer"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam === "chef" || roleParam === "customer") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(
        name,
        email,
        password,
        confirmPassword,
        phone,
        role,
        role === "customer" ? address : undefined
      );

      if (response.success && response.user) {
        const user = normalizeUser(response.user);
        // Explicitly save user to storage to ensure Layout component detects it
        authStorage.setUser(user);
        
        // Dispatch custom event to notify Layout component
        window.dispatchEvent(new Event("authStateChange"));
        
        toast({
          title: "Success",
          description: "Account created successfully",
        });

        // Redirect based on role
        if (user.role === "chef") {
          navigate("/chef-dashboard");
        } else {
          navigate("/gallery");
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🍲</div>
            <h1 className="text-3xl font-bold text-gray-900">HomeChef</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-900 mb-3">
                Account Type
              </Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    role === "customer"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("chef")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    role === "chef"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Chef
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                className="w-full"
              />
            </div>

            {role === "customer" && (
              <div>
                <Label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                  Delivery Address (Optional)
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your delivery address"
                  className="w-full"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-orange-600 font-semibold hover:text-orange-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
