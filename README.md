# DrawTogether 🎨

A real-time collaborative drawing application where multiple users can draw, chat, and collaborate on a shared canvas simultaneously.

## 🌐 Live Demo

**👉 [https://excelidraw-frontend-production.up.railway.app](https://excelidraw-frontend-production.up.railway.app)**

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

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **HTML5 Canvas API** - For drawing functionality

### Backend
- **Express.js** - HTTP server for REST API
- **WebSocket (ws)** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Relational database (Neon cloud)
- **Prisma ORM** - Type-safe database client

### Monorepo & Build Tools
- **Turborepo** - High-performance build system
- **pnpm** - Fast, disk space efficient package manager

## 📁 Project Structure

```
draw-app/
├── apps/
│   ├── excelidraw-frontend/    # Main drawing app (Next.js)
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # React components
│   │   └── draw/               # Canvas drawing logic
│   ├── https-backend/          # REST API server (Express)
│   ├── ws-backend/             # WebSocket server
│   └── web/                    # Additional web app
├── packages/
│   ├── db/                     # Prisma database client
│   ├── common/                 # Shared types & schemas
│   ├── backend-common/         # Shared backend utilities
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # ESLint configurations
│   └── typescript-config/      # TypeScript configurations
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 10.x (`npm install -g pnpm`)
- **PostgreSQL** database (or use [Neon](https://neon.tech) for cloud PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/draw-app.git
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
