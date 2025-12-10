import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authStorage, foodStorage } from "@/lib/storage";
import { categoryAPI } from "@/lib/api";
import { FoodItem } from "@shared/api";
import { Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function UploadFood() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    deliveryTime: "30",
  });

  const user = authStorage.getUser();
  if (!user || user.role !== "chef") {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await categoryAPI.getAll();
        setCategories(allCategories);
        if (allCategories.length > 0 && !formData.category) {
          setFormData((prev) => ({
            ...prev,
            category: allCategories[0].name,
          }));
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.quantity
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Please upload a food image",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const newFood = await foodStorage.addFood({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: imagePreview,
        quantity: parseInt(formData.quantity),
        deliveryTime: parseInt(formData.deliveryTime),
        isAvailable: true,
      });

      toast({
        title: "Success",
        description: "Food item added successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: categories.length > 0 ? categories[0].name : "",
        quantity: "",
        deliveryTime: "30",
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      navigate("/chef-dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload food item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Food Item</h1>
          <p className="text-gray-600 mb-8">
            Share your delicious homemade food with customers
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="block text-sm font-medium text-gray-900 mb-3">
                Food Image *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-center py-8 hover:bg-gray-50 transition rounded-lg"
                  >
                    <Upload size={48} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Food Name */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Food Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Biryani, Naan, Paneer Curry"
                required
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your dish, ingredients, and cooking style..."
                required
                className="w-full h-32"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-2">
                Price per Item ($) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="9.99"
                required
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={categories.length === 0}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon && <span>{cat.icon} </span>}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-2">
                Quantity Available *
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="10"
                required
                className="w-full"
              />
            </div>

            {/* Delivery Time */}
            <div>
              <Label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-900 mb-2">
                Estimated Delivery Time (minutes)
              </Label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                type="number"
                min="10"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                {loading ? "Uploading..." : "Upload Food Item"}
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/chef-dashboard")}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
