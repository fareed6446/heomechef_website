import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, authStorage, normalizeUser } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.user) {
        const user = normalizeUser(response.user);
        // Explicitly save user to storage to ensure Layout component detects it
        authStorage.setUser(user);
        
        // Dispatch custom event to notify Layout component
        window.dispatchEvent(new Event("authStateChange"));
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        if (user.role === "chef") {
          navigate("/chef-dashboard");
        } else {
          navigate("/gallery");
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <Layout>
      <motion.div
        className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="text-4xl mb-3"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              🍲
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900">HomeChef</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              variants={inputVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email Address
              </Label>
              <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full transition-all duration-200"
                />
              </motion.div>
            </motion.div>

            <motion.div
              variants={inputVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
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
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition-all"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-600">
              Don't have an account?{" "}
              <motion.button
                onClick={() => navigate("/signup")}
                className="text-orange-600 font-semibold hover:text-orange-700"
                whileHover={{ scale: 1.05 }}
              >
                Sign up
              </motion.button>
            </p>
          </motion.div>

          <motion.div
            className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs space-y-1 text-blue-800">
              <p>Customer: customer@example.com / password123</p>
              <p>Chef: chef@example.com / password123</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
