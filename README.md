# DrawTogether 🎨

A real-time collaborative drawing application where multiple users can draw, chat, and collaborate on a shared canvas simultaneously.

## 🌐 Live Demo

**👉 [https://excelidraw-frontend-production.up.railway.app](https://excelidraw-frontend-production.up.railway.app)**
## 📸 Project Preview

### 🎯 Real-time Collaborative Canvas
<p align="center">
  <img width="1437" height="777" alt="Screenshot 2026-01-09 at 9 45 30 PM" src="https://github.com/user-attachments/assets/7755dd3f-d274-486f-8c28-78aa70f17b4b" />
<img width="1439" height="772" alt="Screenshot 2026-01-09 at 9 45 23 PM" src="https://github.com/user-attachments/assets/ef237bed-cc75-4558-9a16-c277bb1777f9" />
</p>

### 💬 Chat & Communication
<p align="center">
   <img width="1439" height="775" alt="Screenshot 2026-01-09 at 9 42 52 PM" src="https://github.com/user-attachments/assets/57ab6836-ca3f-4b71-a188-d075524eedd5" />
  <img width="1440" height="775" alt="Screenshot 2026-01-09 at 9 41 57 PM" src="https://github.com/user-attachments/assets/34ecd491-28f7-4a2c-82c1-a798d434e952" />

</p>

### 👥 Multi-user Collaboration
<p align="center">
  <img width="1439" height="777" alt="Screenshot 2026-01-09 at 9 36 56 PM" src="https://github.com/user-attachments/assets/ecaf8d1d-dedb-4bcb-b76e-2d19c425d9ea" />

</p>

### 🏠 Room Dashboard
<p align="center">
  <img width="1440" height="778" alt="Screenshot 2026-01-09 at 9 26 34 PM" src="https://github.com/user-attachments/assets/57e64c98-0ec9-40c5-a705-abb4985eb184" />

</p>

![DrawTogether](https://img.shields.io/badge/DrawTogether-Collaborative%20Whiteboard-purple)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)

## ✨ Features

- **Real-time Collaborative Drawing** - Multiple users can draw on the same canvas simultaneously
- **Live Cursor Tracking** - See other users' cursors in real-time
- **Shape Tools** - Rectangle, Circle, Line, Pencil, and Eraser tools
- **Real-time Chat** - Built-in chat panel for team communication
- **Active Users Display** - See who's currently in the room
- **Persistent Storage** - All drawings and chats are saved to the database
- **Room-based Collaboration** - Create or join rooms with unique slugs
- **User Authentication** - Secure signup/signin with JWT tokens
- **Responsive Design** - Works on desktop and tablet devices

## 🛠️ Technology Stack

### 🚀 Frontend
- **Next.js 15.5.2** – React framework with App Router for scalable applications  
- **React 19.1.0** – Component-based UI library  
- **TypeScript 5.9.2** – Strongly typed JavaScript for better reliability  
- **Tailwind CSS 3.4.17** – Utility-first CSS framework for rapid UI development  
- **Lucide React 0.542.0** – Modern icon library  
- **HTML5 Canvas API** – Native drawing functionality for real-time canvas rendering  
- **Axios** – Promise-based HTTP client for API communication  

---

### ⚙️ Backend
- **Express.js 4.21.2** – Lightweight and flexible REST API server  
- **WebSocket (ws 8.18.0)** – Enables real-time bidirectional communication  
- **JWT (jsonwebtoken 9.0.2)** – Secure authentication using tokens  
- **bcryptjs 3.0.2** – Password hashing for secure user credentials  
- **Zod 3.25.76** – Schema validation for robust input handling  
- **CORS** – Middleware for handling cross-origin requests  

---

### 🗄️ Database
- **PostgreSQL** – Relational database (hosted on Neon cloud)  
- **Prisma ORM 6.15.0** – Type-safe and modern database ORM  
- **@prisma/client 6.15.0** – Auto-generated client for database queries  

---

### 📦 Monorepo & Build Tools
- **Turborepo 2.5.6** – High-performance build system for monorepos  
- **pnpm 10.15.0** – Fast and efficient package manager  
- **TypeScript** – Static type checking across all packages  
- **ESLint** – Code linting for maintaining code quality  
- **Prettier** – Code formatting for consistent style  

---

## 📁 Project Structure

```
RealWorldCanvas/
├── apps/
│   ├── excelidraw-frontend/     # Main React/Next.js drawing app (port 3001)
│   ├── https-backend/           # Express REST API server (port 3002)
│   ├── ws-backend/              # WebSocket server for real-time sync (port 8080)
│   └── web/                     # Additional web app
├── packages/
│   ├── common/                  # Shared Zod schemas and types
│   ├── db/                      # Prisma database client
│   ├── backend-common/          # Shared backend utilities (config, middleware)
│   ├── ui/                      # Shared React UI components
│   ├── eslint-config/           # Shared ESLint configurations
│   └── typescript-config/       # Shared TypeScript configurations
├── docker-compose.yml           # Docker Compose for containerized deployment
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # pnpm monorepo config
├── turbo.json                   # Turborepo build orchestration config
├── pnpm-lock.yaml               # Lock file for dependencies
├── README.md                    # Main documentation
└── .env.example                 # Environment variable template
```
## 🚪 Main Entry Points

### 🎨 Frontend Application
- **Entry:** `/apps/excelidraw-frontend/app/page.tsx` (Landing Page)  
- **Port:** `3001` (development, served via Next.js)  

#### 🔗 Key Routes
- `/` – Landing page with features overview  
- `/signup` – User registration  
- `/signin` – User login  
- `/dashboard` – User's rooms dashboard  
- `/canvas/:roomSlug` – Collaborative drawing canvas for a specific room  

---

### ⚙️ REST API Backend
- **Entry:** `/apps/https-backend/src/index.ts`  
- **Port:** `3002`  

#### 📡 Key Endpoints
- `POST /signup` – Register a new user  
- `POST /signin` – Authenticate user and return token  
- `POST /room` – Create a new drawing room  
- `GET /rooms` – Retrieve user's rooms  
- `GET /room/:slug` – Get room details  
- `GET /shapes/:roomId` – Fetch all shapes in a room  
- `DELETE /shapes/:roomId` – Clear all shapes from canvas  
- `GET /chats/:roomId` – Fetch chat messages  
- `GET /me` – Get current authenticated user info  

---

### 🔌 WebSocket Server
- **Entry:** `/apps/ws-backend/src/index.ts`  
- **Port:** `8080`  

#### ⚡ Real-time Events

**Client → Server**
- `join_room` – Join a drawing room  
- `leave_room` – Leave a room  
- `shape` – Send new shape data  
- `erase_shape` – Remove a specific shape  
- `chat` – Send chat message  
- `cursor_move` – Sync cursor position  
- `zoom` – Sync zoom level  
- `clear_canvas` – Clear all shapes  

**Server → Clients**
- `active_users` – Broadcast active users in room  
- `shape` – Sync new shapes  
- `erase_shape` – Sync shape removal  
- `chat` – Broadcast chat messages  
- `user_joined` – Notify when a user joins  
- `user_left` – Notify when a user leaves  

---
## ✨ Overview

**DrawTogether** is a real-time collaborative whiteboard application that allows multiple users to draw, communicate, and collaborate seamlessly on a shared canvas.

Whether you're brainstorming ideas, teaching concepts, or working on designs, DrawTogether provides a smooth and interactive experience with live synchronization.

---

## 🚀 Core Features

### 🎨 Real-time Collaborative Drawing
- Multiple users can draw simultaneously on a shared canvas  
- Instant synchronization using WebSockets  

### 🧰 Shape Tools
- Rectangle  
- Circle  
- Line  
- Pencil (freehand drawing)  
- Eraser  

### 🖱️ Live Cursor Tracking
- See other users' cursor positions in real-time  
- Improves collaboration and awareness  

### 💬 Chat Panel
- Built-in messaging system within each room  
- Communicate instantly while drawing  

### 👥 Active Users Display
- View all participants currently present in the room  
- Real-time presence updates  

### 🏠 Room-based Collaboration
- Create or join rooms using unique slugs  
- Each room is isolated with its own canvas and chat  

### 💾 Persistent Storage
- All drawings and chat messages are stored in PostgreSQL  
- Data remains available across sessions  

### 🔐 User Authentication
- Secure signup and login system  
- JWT-based authentication  

### 📱 Responsive Design
- Optimized for desktop and tablet devices  

---

## ⚡ Key Highlights

- **Real-time sync** via WebSocket  
  *(shapes, chat, cursor movement, zoom level)*  

- **Room Isolation**  
  - Separate canvas, chat, and users per room  

- **Multi-user Presence Awareness**  
  - Know who is active and interacting  

- **Persistent Collaboration**  
  - Resume work with saved drawings and messages  

- **One-to-Many Synchronization**  
  - All users see the exact same canvas state instantly  

---
  
## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 10.x (`npm install -g pnpm`)
- **PostgreSQL** database (or use [Neon](https://neon.tech) for cloud PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/draw-app.git](https://github.com/RohanDN03/RealWorldCanvas)
   cd draw-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in `packages/db/`:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
   ```
   
   Create a `.env` file in `packages/backend-common/`:
   ```env
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   cd packages/db
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   cd ../..
   pnpm dev
   ```
## ⚙️ Configuration Files

### 📁 Key Config Files

| File | Purpose |
|------|--------|
| `package.json` | Root workspace configuration with Turbo scripts |
| `pnpm-workspace.yaml` | Monorepo workspace definition (`apps/*`, `packages/*`) |
| `turbo.json` | Turborepo task pipeline and caching |
| `.env.example` | Environment variables template |
| `docker-compose.yml` | Docker services orchestration |
| `apps/*/package.json` | Individual app dependencies and scripts |
| `packages/db/prisma/schema.prisma` | Database schema (User, Room, Chat, Shape models) |
| `apps/excelidraw-frontend/tsconfig.json` | Frontend TypeScript configuration |
| `apps/excelidraw-frontend/next.config.ts` | Next.js configuration |
| `apps/excelidraw-frontend/tailwind.config.ts` | Tailwind CSS configuration |
| `apps/https-backend/tsconfig.json` | Backend TypeScript configuration |
| `apps/ws-backend/tsconfig.json` | WebSocket server TypeScript configuration |
| `packages/typescript-config/base.json` | Shared base TypeScript config |
| `packages/typescript-config/nextjs.json` | Shared Next.js TypeScript config |
| `packages/typescript-config/react-library.json` | Shared React library TypeScript config |
| `.vscode/settings.json` | VS Code workspace settings |

---
### Access the Application

Once running, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Main drawing application |
| HTTP API | http://localhost:3002 | REST API endpoints |
| WebSocket | ws://localhost:8080 | Real-time communication |

## 📖 Usage

1. **Sign Up / Sign In**
   - Navigate to http://localhost:3001
   - Create an account or sign in

2. **Dashboard**
   - View your existing rooms
   - Create a new room or join an existing one

3. **Drawing Canvas**
   - Use the toolbar to select drawing tools
   - Draw shapes (Rectangle, Circle, Line)
   - Use the pencil for freehand drawing
   - Eraser to remove shapes
   - Chat with other users in real-time

## 🔌 API Endpoints

### Authentication
- `POST /signup` - Create a new user account
- `POST /signin` - Sign in and get JWT token

### Rooms
- `POST /room` - Create a new room (requires auth)
- `GET /rooms` - Get all rooms for current user (requires auth)
- `GET /room/:slug` - Get room by slug

### Shapes & Chat
- `GET /shapes/:roomId` - Get all shapes in a room
- `DELETE /shapes/:roomId` - Clear all shapes in a room (requires auth)
- `GET /chats/:roomId` - Get chat messages for a room

### User
- `GET /me` - Get current user info (requires auth)

## 🔄 WebSocket Events

### Client → Server
- `join_room` - Join a specific room
- `shape` - Broadcast a new shape
- `erase_shape` - Remove a shape
- `chat` - Send a chat message
- `cursor_move` - Update cursor position

### Server → Client
- `shape` - New shape from another user
- `erase_shape` - Shape deleted by another user
- `chat` - New chat message
- `user_joined` - User joined the room
- `user_left` - User left the room
- `active_users` - List of active users in room

## 🗄️ Database Schema

```prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  password String
  name     String
  photo    String?
  chats    Chat[]
  rooms    Room[]
  shapes   Shape[]
}

model Room {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  createdAt DateTime @default(now())
  adminId   String
  admin     User     @relation(fields: [adminId], references: [id])
  chats     Chat[]
  shapes    Shape[]
}

model Chat {
  id        Int      @id @default(autoincrement())
  roomId    Int
  message   String
  userId    String
  createdAt DateTime @default(now())
  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}

model Shape {
  id        Int      @id @default(autoincrement())
  roomId    Int
  shapeData String
  userId    String
  createdAt DateTime @default(now())
  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

## 🧪 Development

### Build all packages
```bash
pnpm build
```

### Run linting
```bash
pnpm lint
```

### Generate Prisma client
```bash
cd packages/db
npx prisma generate
```

### Database migrations
```bash
cd packages/db
npx prisma migrate dev --name your_migration_name
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Excalidraw](https://excalidraw.com/)
- Built with [Turborepo](https://turbo.build/)
- Database hosted on [Neon](https://neon.tech/)

---

Made with ❤️ by Rohan
