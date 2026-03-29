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

## 🔍 How It Works — Step by Step

### Step 1 — User Authentication
1. A new visitor navigates to the landing page and clicks **Sign Up**.
2. They enter their name, email, and password.
3. The frontend sends a `POST /signup` request to the HTTP backend, which hashes the password with **bcryptjs** and stores the user in PostgreSQL via Prisma.
4. On subsequent visits the user hits `POST /signin`, receives a signed **JWT token**, and the token is stored in the browser (e.g., `localStorage`).
5. Every protected request attaches the JWT in the `Authorization` header; the backend middleware validates it before proceeding.

### Step 2 — Room Management
1. After signing in the user lands on the **Dashboard**, which calls `GET /rooms` to list all rooms they own.
2. They can click **Create Room** — the frontend calls `POST /room` with a unique slug; the backend saves a new `Room` record linked to the user.
3. Alternatively they can type an existing room slug and **Join** it.

### Step 3 — Entering the Canvas
1. Navigating to `/canvas/:slug` triggers a `GET /room/:slug` call to resolve the numeric `roomId`.
2. The frontend immediately fetches existing drawings via `GET /shapes/:roomId` and renders them on the **HTML5 Canvas**.
3. It also fetches prior chat messages via `GET /chats/:roomId` and populates the chat panel.

### Step 4 — Real-time WebSocket Connection
1. The frontend opens a persistent **WebSocket** connection to the WS backend (port 8080) and sends a `join_room` event with the `roomId` and JWT.
2. The WS server authenticates the token, registers the socket in an in-memory room map, and broadcasts a `user_joined` event + updated `active_users` list to everyone in the room.

### Step 5 — Collaborative Drawing
1. A user selects a tool (Rectangle, Circle, Line, Pencil, or Eraser) and draws on the canvas.
2. On `mouseup` / pointer-release the client emits a `shape` WebSocket event containing serialized shape data.
3. The WS backend persists the shape to the `Shape` table via Prisma and then **broadcasts** it to every other socket in the room.
4. Receiving clients deserialize the data and render the new shape instantly — no page refresh required.
5. Erasing sends an `erase_shape` event, which deletes the record from the database and broadcasts the removal.

### Step 6 — Live Cursor & Zoom Sync
1. As a user moves their mouse the client emits throttled `cursor_move` events.
2. The WS server relays these to all other room members, who render a labelled ghost cursor.
3. Zoom changes are broadcast similarly so all participants share the same viewport level.

### Step 7 — In-Room Chat
1. A user types a message and presses Enter; the client emits a `chat` WebSocket event.
2. The WS backend saves the message to the `Chat` table and broadcasts it to the room.
3. All participants see the message appear instantly in the chat panel.

### Step 8 — Leaving the Room
1. When a user closes the tab or navigates away the WebSocket connection closes.
2. The WS backend removes them from the in-memory map, broadcasts `user_left`, and sends an updated `active_users` list.

---

## ✅ Benefits

| # | Benefit | Details |
|---|---------|---------|
| 1 | **Real-time collaboration** | Changes are propagated via WebSocket in milliseconds, creating a seamless shared-canvas experience. |
| 2 | **Persistent drawings** | Every shape and chat message is saved to PostgreSQL, so sessions survive page refreshes or reconnects. |
| 3 | **Secure access control** | JWT-based authentication ensures only registered users can create/join rooms; each API and WS message is verified. |
| 4 | **Clean monorepo architecture** | Turborepo + pnpm workspaces allow code sharing (types, DB client, UI components) across apps with zero duplication. |
| 5 | **Type safety end-to-end** | TypeScript across frontend and both backends, Zod for runtime validation, and Prisma for typed DB queries drastically reduce runtime errors. |
| 6 | **Multiple drawing tools** | Rectangle, Circle, Line, Pencil, and Eraser cover the most common whiteboard needs. |
| 7 | **Live presence awareness** | Cursor tracking and the active-users list make it immediately clear who is working on the canvas. |
| 8 | **Easy deployment** | Docker Compose bundles all three services so the entire stack can be spun up with a single command. |
| 9 | **Scalable database layer** | Using Neon (serverless PostgreSQL) means no manual DB server management and auto-scaling on demand. |
| 10 | **Open-source & extensible** | MIT license allows anyone to fork, customize, or extend the project. |

---

## ⚠️ Drawbacks / Limitations

| # | Limitation | Impact & Mitigation |
|---|-----------|---------------------|
| 1 | **Single WebSocket server (no horizontal scaling)** | All real-time state lives in one process's memory. Adding a second WS instance would break room membership tracking. *Mitigation:* Use Redis Pub/Sub or a dedicated message broker (e.g., Socket.IO with Redis adapter). |
| 2 | **No automated tests** | There are no unit, integration, or e2e test suites. Regressions are only caught manually. *Mitigation:* Add Jest/Vitest for unit tests and Playwright/Cypress for e2e. |
| 3 | **Shape data stored as raw JSON strings** | `shapeData` is a plain `String` column, making server-side shape queries or analytics impossible. *Mitigation:* Store shapes as typed JSONB (PostgreSQL) or separate structured columns. |
| 4 | **No undo / redo** | Users cannot undo a stroke without manually erasing it. *Mitigation:* Implement a client-side command-history stack and broadcast undo/redo events. |
| 5 | **Limited drawing tools** | No text tool, image upload, arrow connectors, or sticky notes compared to mature tools like Excalidraw or Miro. |
| 6 | **No room access control** | Any authenticated user who knows a room slug can join it; there is no invite system or private-room support. *Mitigation:* Add an invite/whitelist table. |
| 7 | **Performance at scale** | Fetching *all* shapes on room entry (`GET /shapes/:roomId`) without pagination could be slow for canvases with thousands of objects. *Mitigation:* Add cursor-based pagination or viewport-culling. |
| 8 | **Frontend environment variables exposed at build time** | `NEXT_PUBLIC_*` vars are baked into the client bundle; changing them requires a rebuild and redeploy. |
| 9 | **No mobile/touch optimisation** | The canvas interactions are designed for mouse input; pinch-to-zoom and touch drawing on phones are not fully supported. |
| 10 | **Cursor flood without throttling** | `cursor_move` events are emitted on every `mousemove`. Without aggressive client-side throttling this can overwhelm the WS server with many concurrent users. |

---

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
