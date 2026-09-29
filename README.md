# 🥢 Golden Wok QR Cafe — QR-Based Food Ordering System

A fast, mobile-friendly, QR-code based food ordering system tailored for a cafe / restaurant specializing in Chinese and Asian cuisine.

Built with **Spring Boot 3 (Java 21)** on the backend and **React 18 + Vite** on the frontend, using **STOMP WebSockets** for real-time order delivery straight to the chef/receptionist.

---

## 🚀 Features

- **📱 Zero App Install for Customers**: Customers scan a table QR code (`/menu?table=3`) and the menu opens right inside their mobile browser.
- **🥟 Chinese Food Optimized**: Organized by categories (Starters, Soups, Noodles, Rice, Main Course, Beverages) with Veg / Non-Veg visual indicators.
- **🛒 Dynamic Order Cart**: Live quantity adjusters, table assignment, and bill summary in Indian Rupees (₹).
- **🔔 Live Kitchen Board**: Chefs and receptionists see incoming orders instantly without page refreshing via WebSockets, with optional chime notifications.
- **⏱️ Order Status Lifecycle**: `PLACED` ➔ `PREPARING` (In Wok) ➔ `READY` (Ready to serve) ➔ `COMPLETED`.
- **💳 Counter Payment Ready**: Clear total amount shown on both customer receipt and kitchen board so payment can be collected at the counter.

---

## 📁 Repository Structure

```
qr-cafe/
├── qr-cafe-backend/            # Spring Boot REST API & WebSocket server
│   ├── pom.xml
│   ├── Dockerfile              # Dockerfile for Render / cloud deployment
│   ├── src/main/java/com/qrcafe/
│   │   ├── config/             # WebSocket STOMP & CORS configuration
│   │   ├── controller/         # MenuController & OrderController
│   │   ├── dto/                # Request & Response objects
│   │   ├── entity/             # JPA Entities: Category, MenuItem, Order, OrderItem
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   └── service/            # Business logic & WebSocket broadcasting
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql            # Seed menu with 19 Chinese dishes
│
└── qr-cafe-frontend/           # React 18 + Vite Mobile-First Frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/                # Axios API client
        ├── context/            # CartContext state provider
        ├── hooks/              # useWebSocket STOMP subscriber hook
        ├── components/         # Header, MenuItemCard, CartItem, OrderCard
        ├── pages/              # MenuPage, CartPage, OrderConfirmPage, KitchenDashboard
        └── styles/             # Global theme & CSS modules
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- **Java 17 or 21**
- **Apache Maven 3.8+**
- **Node.js 18+ and npm**

---

### Step 1: Start the Spring Boot Backend

Open a terminal in `qr-cafe-backend`:

```powershell
cd qr-cafe-backend
mvn spring-boot:run
```

- Backend runs at: `http://localhost:8080`
- API Base: `http://localhost:8080/api`
- H2 In-Memory Database Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:qrcafe`
  - User: `sa`
  - Password: *(leave blank)*

The menu is automatically seeded with 19 Chinese dishes upon launch from `data.sql`.

---

### Step 2: Start the React Frontend

Open a second terminal in `qr-cafe-frontend`:

```powershell
cd qr-cafe-frontend
npm install
npm run dev
```

- Frontend runs at: `http://localhost:3000`

---

## 📱 How to Use & Test the QR Flow

### 1. Customer Scan Experience
Open in browser (or simulate mobile mode with browser DevTools `F12` ➔ Toggle Device Toolbar):
- **Table 1**: `http://localhost:3000/menu?table=1`
- **Table 5**: `http://localhost:3000/menu?table=5`
- **Direct Visit**: `http://localhost:3000/menu` (shows a quick table picker so customers can tap their table number)

1. Browse dishes by category or search.
2. Click **+ ADD** on dishes (e.g., Hakka Noodles, Chicken Momos).
3. The floating pill at the bottom updates with total ₹ amount.
4. Click **View Cart** ➔ Check items and verify table number.
5. Click **Place Order**.
6. The confirmation screen shows **Order # (e.g. `ORD-0001`)** with a live status stepper!

### 2. Kitchen / Receptionist Dashboard & PWA (Protected)
Open on kitchen tablet, mobile phone, or cashier PC:
- **URL**: `http://localhost:3000/kitchen`
- **Security**: Enter Kitchen PIN: `2244` (or Admin PIN: `9988`) to unlock!

1. Tap **Enable Sound** on the top banner (unlocks audio for loud order alerts).
2. Click **🔊 Test Sound** to hear the tri-tone chime.
3. If on Chrome/Edge/Android, click **📲 Install App** to install the Kitchen Dashboard directly onto your home screen / desktop!
4. Placed orders pop up in real-time with sound and table badges.
5. Click **🔥 Start Cooking** ➔ **✅ Food Ready** ➔ **🎉 Mark Served**.
6. Click **🔒 Lock & Exit** when stepping away from the screen.

### 3. Admin Panel & Table QR Generator (Protected)
Open:
- **URL**: `http://localhost:3000/admin`
- **Security**: Enter Admin PIN: `9988` to unlock!

- **Menu & Stock Tab**:
  - Click **➕ Add New Dish** to add custom dishes and prices.
  - Click **✅ In Stock / 🚫 Sold Out** to toggle dish availability instantly without deleting items.
  - Click **✏️ Edit** to update name, description, price, or image.
- **Table QR Codes Tab**:
  - Set table count (e.g. 10 or 15).
  - Preview ready-to-print table cards with QR codes and cafe branding.
  - Click **🖨️ Print All Table Cards** to print beautiful table tent cards ready for lamination!

---

## 🚀 How to Deploy & Live Use at Your Cafe

You have **3 ways** to use the system live with real customers:

### Option 1: Live on Cafe Wi-Fi (Instant — 0 Setup, Free)
If your cafe has a Wi-Fi router that customers or staff connect to:
1. Start backend and frontend on your laptop as usual.
2. Vite is pre-configured with `host: 0.0.0.0`. It will display your network IP (e.g., `http://10.223.54.124:3000`).
3. In `/admin` ➔ **Table QR Codes**, set Base URL to:
   `http://<your-laptop-ip>:3000` (e.g. `http://10.223.54.124:3000`)
4. Click **Print All Table Cards**!
5. Any smartphone connected to the Cafe Wi-Fi can scan the QR code and order immediately!

---

### Option 2: Live over 4G/5G via Free Public Tunnel (Instant — Free)
If you want customers to order using their own mobile data (Jio/Airtel) directly from your running laptop without cloud signups:
1. In a terminal, run:
   ```powershell
   npx localtunnel --port 3000
   ```
2. You will receive a live public HTTPS URL (e.g. `https://golden-wok-cafe.loca.lt`).
3. Put that URL into `/admin` ➔ Base URL and print table QR codes!

---

### Option 3: Permanent Cloud Deployment (24/7 Always On — Free)
To run on the cloud without needing a laptop powered on:

#### 1. Backend on Render.com (Free)
1. Push `qr-cafe` to your GitHub repo.
2. In [Render Dashboard](https://dashboard.render.com/):
   - Click **New** ➔ **Web Service** ➔ Connect repo.
   - Root directory: `qr-cafe-backend`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/qr-cafe-backend-0.0.1-SNAPSHOT.jar`
3. Add a free **PostgreSQL Database** on Render, and set backend Environment Variables:
   - `SPRING_DATASOURCE_URL`: *(PostgreSQL URL from Render)*
   - `SPRING_DATASOURCE_USERNAME`: *(PostgreSQL User from Render)*
   - `SPRING_DATASOURCE_PASSWORD`: *(PostgreSQL Password from Render)*
   - `SPRING_DATASOURCE_DRIVER`: `org.postgresql.Driver`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
   - `ADMIN_PIN`: `9988` *(or custom 4-digit PIN)*
   - `KITCHEN_PIN`: `2244` *(or custom 4-digit PIN)*
4. Backend URL will look like: `https://golden-wok-api.onrender.com`

#### 2. Frontend on Vercel (Free)
1. In [Vercel Dashboard](https://vercel.com):
   - Click **Add New** ➔ **Project** ➔ Connect repo.
   - Root Directory: `qr-cafe-frontend`
   - Framework Preset: `Vite`
2. Add Environment Variables:
   - `VITE_API_URL`: `https://golden-wok-api.onrender.com/api`
   - `VITE_WS_URL`: `https://golden-wok-api.onrender.com/ws`
3. Click **Deploy**. Your site is live at: `https://golden-wok.vercel.app`!
4. Go to `https://golden-wok.vercel.app/admin` ➔ generate and print your final table QR cards!

# Gantavya_Cafe
