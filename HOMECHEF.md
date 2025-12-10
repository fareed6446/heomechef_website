# HomeChef - Home Food Ordering Platform

A full-stack home food ordering platform where local chefs can upload and sell homemade food, and customers can browse, order, and pay on delivery (COD).

## 🎯 Features

### Customer Features
- **Browse Food Gallery**: Search and filter food items by category
- **View Details**: See complete food information with images, prices, delivery times
- **Shopping Cart**: Add/remove items and manage quantities
- **Checkout**: Place orders with delivery address and special instructions
- **Order Tracking**: Track order status in real-time (Pending → Confirmed → Preparing → Ready → Delivered)
- **Order History**: View all past orders
- **Profile Management**: Update personal information

### Chef Features
- **Dashboard**: Manage all food items and incoming orders
- **Upload Food**: Add new food items with images, descriptions, prices, and availability
- **Edit/Delete Items**: Modify or remove food items
- **Order Management**: View customer orders and update order status
- **Inventory Control**: Manage food quantities and availability

### Payment
- **Cash on Delivery (COD)**: Secure payment upon delivery
- No online payment processing needed

## 🚀 Getting Started

### Demo Credentials

**Customer Account:**
- Email: `customer@example.com`
- Password: `password123`

**Chef Account:**
- Email: `chef@example.com`
- Password: `password123`

### Running the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📱 User Flows

### Customer Journey
1. **Sign Up** → Create account with delivery address
2. **Browse** → View available foods in gallery
3. **Add to Cart** → Select items and quantities
4. **Checkout** → Provide delivery details
5. **Track Order** → Monitor order status
6. **Receive** → Pay on delivery (COD)

### Chef Journey
1. **Sign Up** → Create chef account
2. **Upload Food** → Add food items with images and pricing
3. **Manage Orders** → View incoming orders
4. **Update Status** → Update order progress (Pending → Confirmed → Preparing → Ready → Delivered)
5. **Track Sales** → Monitor orders and revenue

## 📊 Database Schema (localStorage)

### Users Collection
```javascript
{
  id: "user_123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  role: "customer", // or "chef"
  address: "123 Main St, City, State",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Food Items Collection
```javascript
{
  id: "food_123",
  chefId: "user_chef_123",
  name: "Biryani",
  description: "Fragrant basmati rice with spices",
  price: 12.99,
  category: "Indian",
  image: "base64_string",
  quantity: 20,
  deliveryTime: 30, // minutes
  isAvailable: true,
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Orders Collection
```javascript
{
  id: "order_123",
  customerId: "user_customer_123",
  chefId: "user_chef_123",
  items: [
    {
      foodId: "food_123",
      foodName: "Biryani",
      price: 12.99,
      quantity: 2
    }
  ],
  totalPrice: 30.97,
  status: "pending", // pending, confirmed, preparing, ready, delivered, cancelled
  deliveryAddress: "456 Oak Ave, City, State",
  deliveryPhone: "+1 (555) 987-6543",
  deliveryTime: "30 minutes",
  notes: "Extra spicy, no onions",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## 🔄 Order Status Flow

```
Pending (Customer places order)
   ↓
Confirmed (Chef accepts order)
   ↓
Preparing (Chef is cooking)
   ↓
Ready (Food ready for delivery)
   ↓
Delivered (Customer received order)
```

## 📦 Tech Stack

- **Frontend**: React 18, React Router 6, TypeScript
- **Styling**: TailwindCSS 3, Radix UI
- **State Management**: localStorage (mock database)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 🗺️ Page Structure

```
/ (Landing Page)
├── / (Redirects to /gallery for logged-in customers or /chef-dashboard for chefs)
├── /login (Login page)
├── /signup (Signup with role selection)
├── /gallery (Food listing and search)
├── /food/:id (Food details)
├── /cart (Shopping cart)
├── /checkout (Order placement)
├── /order-confirmation/:orderId (Order confirmation)
├── /upload-food (Chef: Upload new food)
├── /chef-dashboard (Chef: Manage foods and orders)
├── /my-orders (View order history and tracking)
└── /profile (User profile settings)
```

## 🔐 Authentication

- Simple email/password authentication
- Passwords stored in localStorage (for demo purposes)
- User role-based access control (Chef vs Customer)
- Session persistence via localStorage

## 🛒 Shopping Cart

- Stored in localStorage
- Survives page refreshes
- Real-time total calculations
- Automatic delivery fee calculation

## 🚚 Delivery

- Customers provide delivery address at checkout
- Optional delivery time preference
- Special instructions/notes support
- No actual delivery implementation (mock only)

## 💳 Payment

- **Method**: Cash on Delivery (COD)
- No payment gateway integration needed
- Payment collected during delivery
- No online transaction processing

## 🔄 Integration with Laravel Backend

This frontend is ready to integrate with a Laravel backend. Simply replace the localStorage calls with API calls to your Laravel endpoints:

### API Endpoints to Create in Laravel

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/user/profile
PUT    /api/user/profile

POST   /api/foods (Chef only)
GET    /api/foods
GET    /api/foods/:id
PUT    /api/foods/:id (Chef only)
DELETE /api/foods/:id (Chef only)

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status (Chef only)
GET    /api/orders/user/:userId
GET    /api/orders/chef/:chefId
```

### Example: Replacing localStorage with API

**Current (localStorage):**
```javascript
const foods = foodStorage.getAllFood();
```

**Laravel Integration:**
```javascript
const response = await fetch('/api/foods');
const foods = await response.json();
```

## 📝 Features for Future Enhancement

- Image upload to cloud storage (AWS S3, Cloudinary, etc.)
- Real-time notifications for order updates
- Rating and reviews system
- Favorite/wishlist functionality
- Multiple chef support with order routing
- Analytics dashboard
- SMS/Email notifications
- Real payment gateway integration
- Admin panel for platform management
- Restaurant/Menu management

## 🐛 Known Limitations

- **Storage**: Uses localStorage (limited to ~5-10MB)
- **Performance**: No pagination for large datasets
- **Images**: Base64 encoding not ideal for production
- **Scalability**: Single-page app, no backend
- **Security**: Plain text passwords (demo only)

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Deploy

### Vercel Deployment
1. Import project to Vercel
2. Configure build command: `pnpm build`
3. Deploy

## 📚 Project Structure

```
client/
├── components/
│   ├── ui/              # Pre-built UI components
│   └── Layout.tsx       # Main layout with navigation
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/
│   ├── storage.ts       # localStorage utilities
│   ├── utils.ts         # Helper functions
│   └── demo-data.ts     # Demo data initialization
├── App.tsx              # Main app component
└── global.css           # Global styles

shared/
└── api.ts               # Shared TypeScript types

server/
├── index.ts             # Express server setup
└── routes/              # API endpoints (future)
```

## 📞 Support & Questions

For issues or questions, please refer to the code comments or reach out through the feedback form in the app.

---

**Happy Cooking & Ordering! 🍲**
