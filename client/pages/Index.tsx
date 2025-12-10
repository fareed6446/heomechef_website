import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authStorage } from "@/lib/storage";
import { categoryAPI } from "@/lib/api";
import { User } from "@shared/api";
import {
  ChefHat,
  Users,
  TrendingUp,
  Clock,
  ShoppingCart,
  Truck,
  Star,
  Mail,
  Phone,
  MapPin,
  Play,
  Zap,
  CreditCard,
  Headphones,
  Leaf,
} from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: number | string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

// Color mapping for categories
const categoryColors = [
  "bg-orange-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-green-100",
  "bg-blue-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-indigo-100",
];

// Default icon mapping
const defaultIcons: Record<string, string> = {
  chicken: "🍗",
  pasta: "🍝",
  pizza: "🍕",
  salad: "🥗",
  "stir-fry": "🍲",
  wrap: "🌯",
  dessert: "🍰",
  beverage: "🥤",
  appetizer: "🥟",
  main: "🍽️",
};

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    setUser(currentUser);

    // Navigate based on user role after user state is set
    if (currentUser) {
      if (currentUser.role === "customer") {
        navigate("/gallery");
      } else if (currentUser.role === "chef") {
        navigate("/chef-dashboard");
      }
    }
  }, [navigate]);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const apiCategories = await categoryAPI.getAll();
        setCategories(apiCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Show loading or redirect if user is logged in
  if (user) {
    return null; // Will redirect via useEffect
  }

  // Helper function to get icon for category
  const getCategoryIcon = (category: Category): string => {
    if (category.icon) return category.icon;
    const slug = category.slug?.toLowerCase() || category.name?.toLowerCase() || "";
    return defaultIcons[slug] || "🍽️";
  };

  // Helper function to get color for category
  const getCategoryColor = (index: number): string => {
    return categoryColors[index % categoryColors.length];
  };

  const bestSellers = [
    { name: "Chicken Burrito", price: 12.99, rating: 4.5, image: "🌯" },
    { name: "Fresh Salad Bowl", price: 9.99, rating: 4.8, image: "🥗" },
    { name: "Grilled Chicken", price: 14.99, rating: 4.7, image: "🍗" },
    { name: "Pasta Carbonara", price: 13.99, rating: 4.6, image: "🍝" },
  ];

  const flashSaleItems = [
    { name: "Special Combo", price: 19.99, originalPrice: 29.99, image: "🍱" },
    { name: "Family Pack", price: 34.99, originalPrice: 49.99, image: "🍽️" },
  ];


  const features = [
    { icon: Zap, title: "Fast Delivery", desc: "Quick & reliable" },
    { icon: CreditCard, title: "Easy Payment", desc: "Multiple options" },
    { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
    { icon: Leaf, title: "Fresh Food", desc: "Daily prepared" },
  ];

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-red-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
                In the perfect space,
                <br />
                <span className="text-orange-600">fantastic food.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover authentic homemade food from talented chefs in your
                community
              </p>
              <div className="flex gap-4 justify-center items-center">
                  <Button
                    onClick={() => navigate("/gallery")}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                  >
                    Order Now
                  </Button>
                <Button
                  variant="outline"
                  className="border-2 border-gray-300 px-4 py-3 rounded-lg"
                >
                  <Play className="w-5 h-5" />
                  </Button>
              </div>
                </motion.div>
          </div>
        </section>

        {/* Food Categories */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our delicious selection of homemade meals from talented local chefs
              </p>
            </motion.div>

            {categoriesLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-lg">Loading categories...</p>
                </div>
              </div>
            ) : categories.length > 0 ? (
              <div className="relative pt-8">
                {/* Scrollable container with better styling */}
                <div className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-visible pb-6 pt-4 scrollbar-hide pl-4 md:pl-8 lg:pl-12">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id || category.slug || index}
                      onClick={() => navigate(`/gallery?category=${category.slug || category.name}`)}
                      className="flex-shrink-0 text-center group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                      whileHover={{ y: -8, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className={`relative w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 ${getCategoryColor(index)} rounded-full flex items-center justify-center mb-4 text-6xl md:text-7xl lg:text-8xl shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white group-hover:border-orange-300`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {getCategoryIcon(category)}
                        {/* Hover overlay effect */}
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        />
                      </motion.div>
                      <p className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 mb-1">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-1 max-w-[140px] md:max-w-[160px]">
                          {category.description}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Gradient fade on edges for better UX */}
                <div className="absolute left-0 top-4 bottom-6 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-4 bottom-6 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
              </div>
            ) : (
              <motion.div
                className="flex flex-col justify-center items-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600 text-lg">No categories available</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for new categories!</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Delivery Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-red-600 uppercase font-bold text-sm mb-2 tracking-wider">
                EXPRESS DELIVERY
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                60 Minutes Delivery Process
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Experience fast and reliable delivery service. From order to your door in just 60 minutes.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline with 4 steps */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
                {/* Steps Container */}
                <div className="flex-1 w-full lg:max-w-3xl">
                  <div className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-4">
                    {/* Timeline Line - Horizontal for desktop */}
                    <div className="absolute top-10 left-0 right-0 h-2 bg-red-500 z-0 hidden lg:block"></div>
                    
                    {/* Step 1: Choose your products */}
              <motion.div
                      className="relative z-10 text-center flex-1"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="w-20 h-20 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img
                          src="/assets/menu%202.svg"
                          alt="Menu"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-base">
                        Choose your products
                      </p>
                    </motion.div>

                    {/* Connector Line */}
                    <div className="w-12 h-1 bg-red-500 hidden lg:block"></div>

                    {/* Step 2: Order and make a payment */}
                <motion.div
                      className="relative z-10 text-center flex-1"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img
                          src="/assets/icon-cart.png.svg"
                          alt="Cart"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-base">
                        Order and make a payment
                      </p>
                </motion.div>

                    {/* Connector Line */}
                    <div className="w-12 h-1 bg-red-500 hidden lg:block"></div>

                    {/* Step 3: Share your location */}
                    <motion.div
                      className="relative z-10 text-center flex-1"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img
                          src="/assets/icon-map.png.svg"
                          alt="Location"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-base">
                        Share your location
                </p>
              </motion.div>

                    {/* Connector Line */}
                    <div className="w-12 h-1 bg-red-500 hidden lg:block"></div>

                    {/* Step 4: Get delivered */}
              <motion.div
                      className="relative z-10 text-center flex-1"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <img
                          src="/assets/icon-delivered.png.svg"
                          alt="Delivered"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-base">
                        Get delivered
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Delivery Truck Illustration */}
                <motion.div
                  className="flex-shrink-0 flex items-center justify-center lg:self-center"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <img
                    src="/assets/07.svg"
                    alt="Delivery Truck"
                    className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-16 bg-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Best Sellers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                    {item.image}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-600 font-bold">
                        ${item.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/gallery")}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Sale */}
        <section className="hidden py-16 bg-pink-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-8">Flash Sale</h2>
                <div className="space-y-4">
                  {flashSaleItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      className="bg-white rounded-lg p-4 flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className="text-5xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-bold">
                            ${item.price}
                          </span>
                          <span className="text-gray-400 line-through">
                            ${item.originalPrice}
                          </span>
                        </div>
                      </div>
                      <Button className="bg-pink-600 hover:bg-pink-700">
                        Add to Cart
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white/20 rounded-lg flex items-center justify-center text-4xl"
                  >
                    🍱
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="w-64 h-64 bg-orange-100 rounded-2xl flex items-center justify-center text-6xl mx-auto">
                  👨‍🍳
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-6">Who We Are, What We Do</h2>
                <p className="text-gray-600 mb-8">
                  We connect local chefs with food lovers, bringing authentic
                  homemade meals directly to your door. Our mission is to support
                  local culinary talent while providing you with fresh, delicious
                  food made with love.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <Leaf className="w-8 h-8 text-orange-600 mb-2" />
                    <h3 className="font-bold">Freshly Made</h3>
                    <p className="text-sm text-gray-600">Daily prepared meals</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <Zap className="w-8 h-8 text-orange-600 mb-2" />
                    <h3 className="font-bold">Quick Delivery</h3>
                    <p className="text-sm text-gray-600">Fast & reliable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-6xl font-bold text-orange-600 mb-4">4.9</div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm w-8">{stars}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600"
                          style={{
                            width: `${(stars === 5 ? 85 : stars === 4 ? 10 : 3)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <blockquote className="text-xl italic text-gray-700 mb-4">
                  "The best food delivery service I've ever used! Fresh, delicious,
                  and always on time. Highly recommend!"
                </blockquote>
                <p className="font-semibold">- Sarah Johnson</p>
                <p className="text-gray-600 text-sm">Regular Customer</p>
              </div>
            </div>
        </div>
        </section>

        {/* Best Offer */}
        <section className="py-16 bg-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Best Offer For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((item, index) => (
        <motion.div
                  key={`offer-${item.name}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Discount
                    </div>
                  )}
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                    {item.image}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-600 font-bold">
                        ${item.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/gallery")}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
          <motion.div
                    key={feature.title}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-orange-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Get the latest updates and special offers delivered to your inbox
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 px-8"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
