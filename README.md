E-Commerce Store - React Full-Stack Application
🚀 Project Overview
This is a fully functional E-Commerce Store built using React for the frontend and Node.js + Express for the backend. It includes user authentication, product browsing, cart management, and Stripe payment integration for secure checkout.

🛠️ Features
->User registration & login with protected routes
->Product listing with search functionality
->Add to cart, update quantity, remove items, and clear cart
->Secure checkout using Stripe Payment Gateway
->Order history and detailed order pages
->Responsive and clean UI built with CSS Grid & Flexbox
->Dark mode toggle for better user experience

📚 Tech Stack
->Frontend: React, React Router, Context API, Axios, Stripe.js
->Backend: Node.js, Express, Stripe API
->Database: MySQL
->Tools: VSCode, Git, Postman

🔧 Setup & Installation
Prerequisites
Node.js & npm installed

MySQL database setup
Stripe account (for API keys)

Clone Repository :
git clone https://github.com/Gauravg2630/React-e-commerce-complete.git
cd React-e-commerce-complete

Backend Setup
Navigate to backend folder (if separate):
cd backend

Install dependencies:
npm install

Create a .env file in backend root with:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=e_commerce
DB_PORT=3306
PORT=5000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret (optional)
FRONTEND_URL=http://localhost:3000

Run the backend server:
npm start
Frontend Setup

Navigate to frontend folder (if separate):
cd frontend

Install dependencies:
npm install

Create .env file in frontend root with:
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

Start the frontend development server:
npm start

📂 Folder Structure

/backend
  ├── routes/
  ├── controllers/
  ├── models/
  ├── middleware/
  ├── app.js
  ├── server.js
  └── .env

/frontend
  ├── src/
      ├── components/
      ├── context/
      ├── pages/
      ├── axios.js
      ├── App.js
      └── index.js
  └── .env

💡 How to Use
Register a new account or log in
Browse products and add them to the cart
Update cart quantities or clear the cart
Fill in shipping details and proceed to payment
Complete payment via Stripe Checkout
View your orders and order details

📝 Notes
Ensure your backend API URL matches the frontend proxy or Axios base URL
Use Stripe test API keys for development
Secure your .env files — don’t commit secrets to public repos

⭐ Contribution
Feel free to open issues or submit pull requests. Happy coding!

⭐ Made by Me(Gorav Gumber)