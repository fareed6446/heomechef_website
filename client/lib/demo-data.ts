import { User, FoodItem } from "@shared/api";
import { usersStorage, foodStorage } from "./storage";

// Demo images as base64 (simple colored placeholders)
const demoImages = {
  biryani: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23D4A574' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🍛%3C/text%3E%3C/svg%3E",
  pizza: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23FF6B6B' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🍕%3C/text%3E%3C/svg%3E",
  pasta: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23FFD93D' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🍝%3C/text%3E%3C/svg%3E",
  curry: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23FFA500' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🍲%3C/text%3E%3C/svg%3E",
  roti: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23E8BFA3' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🫓%3C/text%3E%3C/svg%3E",
  samosa: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23D2691E' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🥟%3C/text%3E%3C/svg%3E",
  cake: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23FFB6C1' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='%23fff' text-anchor='middle' dominant-baseline='central'%3E🍰%3C/text%3E%3C/svg%3E",
};

export function initializeDemoData() {
  // Check if demo data already exists
  const existingUsers = usersStorage.getAllUsers();
  if (existingUsers.length > 0) {
    return; // Already initialized
  }

  // Create demo chef user
  const chefUser: User = {
    id: "chef_demo_001",
    name: "Priya's Kitchen",
    email: "chef@example.com",
    phone: "+1 (555) 123-4567",
    role: "chef",
    createdAt: new Date().toISOString(),
  };

  // Create demo customer user
  const customerUser: User = {
    id: "customer_demo_001",
    name: "John Doe",
    email: "customer@example.com",
    phone: "+1 (555) 987-6543",
    role: "customer",
    address: "123 Main St, City, State 12345",
    createdAt: new Date().toISOString(),
  };

  // Add users
  usersStorage.addUser(chefUser);
  usersStorage.addUser(customerUser);

  // Store passwords
  localStorage.setItem("password_chef_demo_001", "password123");
  localStorage.setItem("password_customer_demo_001", "password123");

  // Create demo food items
  const demoFoods: FoodItem[] = [
    {
      id: "food_001",
      chefId: chefUser.id,
      name: "Chicken Biryani",
      description:
        "Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and herbs. A traditional Indian delicacy.",
      price: 12.99,
      category: "Indian",
      image: demoImages.biryani,
      quantity: 15,
      deliveryTime: 30,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_002",
      chefId: chefUser.id,
      name: "Paneer Tikka Masala",
      description:
        "Creamy tomato-based curry with cottage cheese cubes. Served with basmati rice and naan bread.",
      price: 11.99,
      category: "Indian",
      image: demoImages.curry,
      quantity: 20,
      deliveryTime: 25,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_003",
      chefId: chefUser.id,
      name: "Butter Naan",
      description:
        "Soft, fluffy Indian bread brushed with butter and garlic. Perfect with any curry.",
      price: 2.99,
      category: "Indian",
      image: demoImages.roti,
      quantity: 30,
      deliveryTime: 10,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_004",
      chefId: chefUser.id,
      name: "Samosa (Pack of 4)",
      description:
        "Crispy fried pastry filled with spiced potatoes and peas. Served with mint chutney.",
      price: 4.99,
      category: "Snacks",
      image: demoImages.samosa,
      quantity: 25,
      deliveryTime: 20,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_005",
      chefId: chefUser.id,
      name: "Garlic Pasta",
      description:
        "Al dente spaghetti tossed with olive oil, fresh garlic, red chili, and parsley. Simple yet delicious.",
      price: 9.99,
      category: "Continental",
      image: demoImages.pasta,
      quantity: 12,
      deliveryTime: 25,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_006",
      chefId: chefUser.id,
      name: "Margarita Pizza",
      description:
        "Fresh mozzarella, tomato sauce, and basil on a thin crust pizza. Classic Italian style.",
      price: 10.99,
      category: "Continental",
      image: demoImages.pizza,
      quantity: 10,
      deliveryTime: 30,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_007",
      chefId: chefUser.id,
      name: "Chocolate Cake",
      description:
        "Rich and moist chocolate cake with chocolate frosting. Perfect for dessert lovers.",
      price: 6.99,
      category: "Desserts",
      image: demoImages.cake,
      quantity: 8,
      deliveryTime: 15,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "food_008",
      chefId: chefUser.id,
      name: "Vegetable Curry",
      description:
        "Mixed seasonal vegetables cooked in a spiced curry sauce. Vegan-friendly and nutritious.",
      price: 8.99,
      category: "Indian",
      image: demoImages.curry,
      quantity: 18,
      deliveryTime: 20,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // Add food items
  demoFoods.forEach((food) => foodStorage.addFood(food));
}
