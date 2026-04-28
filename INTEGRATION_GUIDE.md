# POS System - Backend & Frontend Integration Guide

## Setup Instructions

### Backend (Laravel)

1. **Database Setup**
   ```bash
   cd backend
   # Update .env with your MySQL credentials
   php artisan migrate
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   php artisan serve
   # Server will run on http://localhost:8000
   ```

### Frontend (React)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend Server**
   ```bash
   cd frontend
   npm start
   # Frontend will run on http://localhost:3000
   ```

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/search/{barcode}` - Search product by barcode

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Sales
- `POST /api/sales` - Create new sale/transaction
- `GET /api/sales` - Get all sales
- `GET /api/sales/user/{userId}` - Get sales by user

## Default Test Credentials

- **Cashier**: cashier1 / pass123
- **Supervisor**: supervisor1 / pass123
- **Administrator**: admin1 / pass123

## Features

✅ Backend-Frontend connection established
✅ API service configured for all endpoints
✅ Authentication integrated with backend
✅ CORS enabled for cross-origin requests
✅ MySQL database configured
✅ RESTful API endpoints ready

## Next Steps

1. Implement database models and migrations
2. Add proper authentication with tokens/JWT
3. Implement all business logic in backend controllers
4. Add form validation on frontend and backend
5. Implement error handling and logging
