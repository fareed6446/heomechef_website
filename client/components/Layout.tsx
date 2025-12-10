import { useNavigate, useLocation } from "react-router-dom";
import { authStorage, authAPI } from "@/lib/storage";
import { User } from "@shared/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, LogOut, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRef = useRef<User | null>(null);

  // Function to check and update user state
  const checkUser = () => {
    const currentUser = authStorage.getUser();
    if (currentUser) {
      // Only update if user actually changed
      if (JSON.stringify(currentUser) !== JSON.stringify(userRef.current)) {
        setUser(currentUser);
        userRef.current = currentUser;
      }
      // Verify token is still valid in background
      authAPI.getUser().then((user) => {
        if (user) {
          setUser(user);
          userRef.current = user;
        } else {
          setUser(null);
          userRef.current = null;
        }
      }).catch(() => {
        setUser(null);
        userRef.current = null;
      });
    } else {
      if (userRef.current !== null) {
        setUser(null);
        userRef.current = null;
      }
    }
  };

  useEffect(() => {
    // Check user on mount
    checkUser();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser" || e.key === "token") {
        checkUser();
      }
    };

    // Listen for custom auth events (when user logs in/out in same window)
    const handleAuthChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []); // Empty dependency array - only run on mount

  // Check user when location changes (after navigation, e.g., after login)
  useEffect(() => {
    checkUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      authStorage.clearUser();
      setUser(null);
      navigate("/");
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const cartVariants = {
    animate: { scale: 1 },
    pulse: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.nav
        className="bg-white border-b border-gray-200 shadow-sm"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <div className="text-2xl font-bold text-orange-600">🍲 HomeChef</div>
            </motion.div>

            {/* Center Navigation */}
            {user && (
              <motion.div
                className="hidden md:flex space-x-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {user.role === "customer" && (
                  <>
                    <motion.button
                      onClick={() => handleNavigate("/gallery")}
                      className="text-gray-600 hover:text-orange-600 font-medium transition"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      Browse Food
                    </motion.button>
                    <motion.button
                      onClick={() => handleNavigate("/my-orders")}
                      className="text-gray-600 hover:text-orange-600 font-medium transition"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      My Orders
                    </motion.button>
                  </>
                )}
                {user.role === "chef" && (
                  <>
                    <motion.button
                      onClick={() => handleNavigate("/chef-dashboard")}
                      className="text-gray-600 hover:text-orange-600 font-medium transition"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      Dashboard
                    </motion.button>
                    <motion.button
                      onClick={() => handleNavigate("/upload-food")}
                      className="text-gray-600 hover:text-orange-600 font-medium transition"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      Upload Food
                    </motion.button>
                    <motion.button
                      onClick={() => handleNavigate("/my-orders")}
                      className="text-gray-600 hover:text-orange-600 font-medium transition"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      Orders
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* Right Section */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Cart Button (Customer Only) */}
              {user?.role === "customer" && (
                <motion.button
                  onClick={() => handleNavigate("/cart")}
                  className="relative p-2 text-gray-600 hover:text-orange-600 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  variants={cartVariants}
                  animate={cartItemCount > 0 ? "pulse" : "animate"}
                >
                  <ShoppingCart size={24} />
                  <AnimatePresence>
                    {cartItemCount > 0 && (
                      <motion.span
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {cartItemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="ghost" className="hidden md:inline-flex">
                        {user.name}
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigate("/login")}
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button
                      onClick={() => handleNavigate("/signup")}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="icon">
                      <Menu size={24} />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.role === "customer" && (
                    <>
                      <DropdownMenuItem onClick={() => handleNavigate("/gallery")}>
                        Browse Food
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigate("/my-orders")}>
                        My Orders
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "chef" && (
                    <>
                      <DropdownMenuItem onClick={() => handleNavigate("/chef-dashboard")}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigate("/upload-food")}>
                        Upload Food
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigate("/my-orders")}>
                        Orders
                      </DropdownMenuItem>
                    </>
                  )}
                  {user && (
                    <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                  )}
                  {user && <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      <motion.footer
        className="bg-gray-50 border-t border-gray-200 py-8 mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-bold text-orange-600 mb-2">
                🍲 HomeChef
              </h3>
              <p className="text-gray-600 text-sm">
                Fresh homemade food delivered to your door
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-orange-600 transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-orange-600 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-orange-600 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
              <p className="text-sm text-gray-600">Email: info@homechef.com</p>
              <p className="text-sm text-gray-600">Phone: +1 (555) 123-4567</p>
            </motion.div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 HomeChef. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
