# Finance-Management-System
A Java-based full-stack web application for managing personal finances, including income/expense tracking, budgeting, and analytics dashboard.
=======
# 💰 Finance Management — Full Stack (Spring Boot + React)

Personal finance app: register/login, add income & expenses, see summary + chart, delete entries. JWT-secured REST API.

## 🧱 Tech Stack
- **Backend:** Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT (jjwt), Lombok
- **Database:** H2 (default, zero-install) or MySQL (one-line switch)
- **Frontend:** React 18 + Vite, React Router, Axios, Recharts, Tailwind (CDN)
- **Build:** Maven (backend), npm (frontend)

## 📁 Project Structure
```
finance-app/
├── backend/                 Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/finance/app/
│       ├── FinanceAppApplication.java
│       ├── config/SecurityConfig.java
│       ├── controller/      (Auth, Transaction, ExceptionHandler)
│       ├── dto/             (Auth, Transaction DTOs)
│       ├── entity/          (User, Transaction, TransactionType)
│       ├── repository/      (JPA repositories)
│       ├── security/        (JwtUtil, JwtFilter)
│       └── service/         (AuthService, TransactionService)
└── frontend/                React + Vite SPA
    ├── package.json
    └── src/
        ├── App.jsx, main.jsx
        ├── context/AuthContext.jsx
        ├── services/api.js
        └── pages/ (Login, Register, Dashboard)
```

## ✅ Prerequisites
1. **JDK 17+** — `java -version`
2. **Maven 3.8+** — `mvn -v`
3. **Node 18+ & npm** — `node -v`
4. (Optional) **MySQL 8** if you switch from H2
5. **IDE:** IntelliJ IDEA (recommended) or VS Code

## 🚀 Step-by-Step Setup

### STEP 1 — Run the backend
```bash
cd backend
mvn spring-boot:run
```
Server starts on `http://localhost:8080`. Uses H2 file DB (no install). Open H2 console at `http://localhost:8080/h2` (JDBC URL: `jdbc:h2:file:./data/financedb`, user `sa`, no password).

**To use MySQL instead:** edit `backend/src/main/resources/application.properties` — comment H2 lines, uncomment MySQL lines, set your password. Create DB or let `createDatabaseIfNotExist=true` handle it.

### STEP 2 — Run the frontend
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
App opens at `http://localhost:5173`.

### STEP 3 — Use the app
1. Go to `http://localhost:5173` → register a new account
2. Add income/expense transactions
3. Watch totals + pie chart update
4. Delete transactions with the ✕ button

## 🔐 API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | `{name,email,password}` → JWT |
| POST | `/api/auth/login` | ❌ | `{email,password}` → JWT |
| GET | `/api/transactions` | ✅ | List user's transactions |
| POST | `/api/transactions` | ✅ | Create transaction |
| DELETE | `/api/transactions/{id}` | ✅ | Delete one |
| GET | `/api/transactions/summary` | ✅ | Income/expense/balance totals |

Send `Authorization: Bearer <token>` for protected routes.

## 🧠 How It Works
- **Auth:** Passwords hashed with BCrypt. Login returns a JWT (HMAC-SHA, 24h). Frontend stores it in `localStorage` and Axios attaches it to every request.
- **Security:** Stateless Spring Security — `JwtFilter` parses the token on each request and sets the `User` as the authenticated principal.
- **Data:** JPA entities map to `users` and `transactions` tables. Each transaction belongs to a user (FK).
- **Frontend:** React Router protects `/`. `AuthContext` manages session. Recharts draws the income vs expense pie.

## 🛠️ Open in IntelliJ IDEA
1. **File → Open** → select the `backend` folder (it auto-detects `pom.xml`)
2. Wait for Maven import
3. Run `FinanceAppApplication.java` (green ▶ next to `main`)
4. Open `frontend` separately in VS Code → `npm install && npm run dev`

## 📦 Build for Production
```bash
# Backend → JAR
cd backend && mvn clean package
java -jar target/finance-app-1.0.0.jar

# Frontend → static files in frontend/dist
cd frontend && npm run build
```

## ☁️ Deploy (optional)
- **Backend:** Render / Railway / AWS Elastic Beanstalk (deploy the JAR; set MySQL URL via env var)
- **Frontend:** Vercel / Netlify (build dir = `dist`); update `baseURL` in `src/services/api.js` to your backend URL

## 🧪 Quick Test (after backend is up)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","password":"secret123"}'
```

## 🐛 Troubleshooting
- **Port 8080 in use** → change `server.port` in `application.properties`
- **CORS error** → make sure backend is on 8080 and frontend on 5173 (or update `SecurityConfig.addCorsMappings`)
- **Lombok errors in IntelliJ** → install the Lombok plugin + enable annotation processing
- **JWT invalid** → log out (clears localStorage) and log in again

## 🔮 Next Steps (Ideas to Extend)
- Budgets per category, recurring transactions, savings goals
- Monthly reports & CSV export
- Multiple accounts, currency conversion
- Mobile app with React Native sharing the same API

Happy building! 🎉
