Simple Store – Full Stack Dockerized Application

A full-stack e-commerce demo application built using React, Node.js, PostgreSQL, and Docker.  
This project demonstrates how to design, build, and run a complete 3-tier application (Frontend, Backend, Database) in a containerized environment.

---

🚀 Features

✅ Frontend
- React + Vite
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management:
  - Authentication (JWT)
  - Shopping Cart
- Pages:
  - Products
  - Register
  - Email OTP Verification
  - Login
  - Cart

 ✅ Backend
- Node.js + Express
- RESTful API design
- JWT authentication
- Email OTP verification using Nodemailer
- Password hashing with bcrypt
- Protected routes using middleware
- Pagination support for products

 ✅ Database
- PostgreSQL (relational database)
- Tables:
  - users
  - products
  - orders
  - order_items
- Proper foreign key relationships
- Database initialization via SQL script

✅ DevOps / Infrastructure
- Docker & Docker Compose
- 3-tier architecture:
  - Frontend container
  - Backend container
  - PostgreSQL database container
- Environment variables for secrets & configuration
- Volume for persistent database storage

---

🧱 Architecture Overview

```

React (Frontend)
|
| HTTP (REST API)
|
Node.js + Express (Backend)
|
| SQL Queries
|
PostgreSQL (Database)

```

All services run inside Docker containers and communicate using Docker networking.

---

🗂 Project Structure

```

docker-simple-store/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── db.js
│   ├── db/
│   │   └── init.sql
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md

```

---

🛠 Technologies Used

| Layer       | Technology |
|------------|------------|
| Frontend   | React, Vite, Tailwind CSS |
| Backend    | Node.js, Express |
| Auth       | JWT, bcrypt |
| Email      | Nodemailer (Gmail App Password) |
| Database   | PostgreSQL |
| DevOps     | Docker, Docker Compose |

---

⚙️ Environment Variables

 Backend
```

DATABASE_URL=postgres://user:password@db:5432/storedb
JWT_SECRET=mysecret
EMAIL_USER=[yourgmail@gmail.com](mailto:yourgmail@gmail.com)
EMAIL_PASS=your_google_app_password
PORT=4000

```

### Frontend
```

VITE_API_URL=[http://localhost:4000/api](http://localhost:4000/api)

````

---

▶️ How to Run the Project

1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/simple-store.git
cd simple-store
````

2️⃣ Start the application

```bash
docker compose up --build
```

 Open in browser

Frontend: [http://localhost:5173](http://localhost:5173)
Backend: [http://localhost:4000](http://localhost:4000)


 Testing the Application

1. Register a new account
2. Check email for OTP code
3. Verify OTP
4. Login
5. Browse products
6. Add products to cart
7. Place an order
8. Check orders stored in PostgreSQL


 Database Initialization

On first run, PostgreSQL automatically:

 Creates all required tables
Inserts sample products


 Security Highlights

Passwords are never stored in plain text
JWT used for authentication
 Protected routes for orders
 Sensitive data stored using environment variables


 Future Improvements

Admin dashboard for product management
 Redis caching
Pagination UI
Order history page
Deployment on Azure / Kubernetes
CI/CD pipeline integration

---

Author

EBTSAM
DevOps / Full Stack Developer (Learning Project)

---

