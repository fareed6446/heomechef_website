import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authStorage, foodStorage } from "@/lib/storage";
import { categoryAPI } from "@/lib/api";
import { FoodItem } from "@shared/api";
import { ShoppingCart, Clock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import { pageVariants, containerVariants, cardVariants } from "@/lib/animations";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export default function Gallery() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Load categories
        const allCategories = await categoryAPI.getAll();
        setCategories(allCategories);
        
        // Load foods
        const allFoods = await foodStorage.getAllFood();
        setFoods(allFoods);
        setFilteredFoods(allFoods);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        const allFoods = await foodStorage.getAllFood(searchTerm || undefined, selectedCategory);
        setFoods(allFoods);
        setFilteredFoods(allFoods);
      } catch (error) {
        console.error("Error loading foods:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadFoods();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const categoryList = [
    { id: "all", name: "All", slug: "all" },
    ...categories.map((cat) => ({ id: cat.id.toString(), name: cat.name, slug: cat.slug })),
  ];

  const handleAddToCart = (foodId: string | number) => {
    addToCart(foodId.toString(), 1);
  };

  return (
    <Layout>
      <motion.div
        className="min-h-[calc(100vh-200px)] bg-gray-50"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with animation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Food</h1>
            <p className="text-gray-600">
              Discover delicious homemade meals from local chefs
            </p>
          </motion.div>

          {/* Search and Filter with animation */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full transition-all duration-200 hover:border-orange-400 focus:border-orange-600"
            />

            <motion.div
              className="flex gap-2 overflow-x-auto pb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {categoryList.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug === "all" ? "all" : category.name)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition flex items-center gap-2 ${
                    selectedCategory === (category.slug === "all" ? "all" : category.name)
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-800 border border-gray-300 hover:border-orange-600"
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.slug !== "all" && categories.find(c => c.id.toString() === category.id)?.icon && (
                    <span>{categories.find(c => c.id.toString() === category.id)?.icon}</span>
                  )}
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Food Grid with staggered animations */}
          {loading ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-lg">Loading foods...</p>
            </motion.div>
          ) : filteredFoods.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-lg">No foods available</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {filteredFoods.map((food) => (
                <motion.div
                  key={food.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                >
                  {/* Food Image */}
                  <motion.div
                    className="h-48 bg-gray-200 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                        <span className="text-4xl">🍜</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Food Info */}
                  <motion.div
                    className="p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {food.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {food.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-orange-600">
                        ${Number(food.price).toFixed(2)}
                      </span>
                      <motion.div
                        className="flex items-center gap-1 text-gray-600 text-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Clock size={16} />
                        {food.deliveryTime || food.delivery_time || 30} min
                      </motion.div>
                    </div>

                    <div className="mb-4 text-sm">
                      <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
                        {food.category}
                      </span>
                      {food.quantity > 0 ? (
                        <span className="ml-2 text-green-600 font-medium">
                          In Stock ({food.quantity})
                        </span>
                      ) : (
                        <span className="ml-2 text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => navigate(`/food/${food.id}`)}
                          variant="outline"
                          className="w-full transition-all hover:border-orange-600 hover:text-orange-600"
                        >
                          View Details
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleAddToCart(food.id)}
                          disabled={food.quantity === 0}
                          className="w-full bg-orange-600 hover:bg-orange-700 transition-all"
                        >
                          <ShoppingCart size={18} className="mr-2" />
                          Add
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
}
