# HomeChef Website

React frontend for the HomeChef platform, now integrated with Laravel backend API.

## Setup

### Installation

```bash
cd Website
pnpm install
```

### Configuration

Create a `.env` file in the Website root directory:

```env
VITE_API_URL=http://localhost:8000/api
```

For production, update this to your Laravel backend URL.

### Development

```bash
pnpm dev
```

Runs on `http://localhost:8080`

### Build

```bash
pnpm build
```

## API Integration

The website now uses the Laravel backend API instead of localStorage:

- **Authentication**: Uses Laravel Sanctum tokens
- **Food Items**: Fetched from `/api/foods`
- **Orders**: Managed via `/api/orders`
- **User Profile**: Updated via `/api/user/profile`

### API Base URL

The API base URL is configured via environment variable:
- Development: `http://localhost:8000/api`
- Update `.env` file to change the API URL

### Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Receives a Sanctum token
3. Token is stored in localStorage
4. All subsequent API calls include the token in the Authorization header

### Data Normalization

The app includes helper functions to normalize Laravel's snake_case responses to camelCase for backward compatibility:
- `normalizeUser()` - Normalizes user data
- `normalizeFoodItem()` - Normalizes food item data
- `normalizeOrder()` - Normalizes order data

## Features

- ✅ API-based authentication
- ✅ Real-time food browsing with search and filters
- ✅ Shopping cart (client-side)
- ✅ Order placement and tracking
- ✅ Chef dashboard for food management
- ✅ Profile management

## Demo Credentials

Use the demo accounts created by Laravel seeder:
- **Customer**: `customer@example.com` / `password123`
- **Chef**: `chef@example.com` / `password123`

## Notes

- Cart is still stored in localStorage (client-side only)
- All other data is fetched from the Laravel backend
- The app handles both snake_case (Laravel) and camelCase (legacy) field names
