# Nuxt TanStack DB Demo

A demo application showcasing **TanStack DB** with **Nuxt 4**, **tRPC**, and **Prisma** (SQLite). Features optimistic UI updates, live queries, and full-stack type safety.

## Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (app directory) |
| Database | [TanStack DB](https://tanstack.com/db/latest) with [TanStack Query](https://tanstack.com/query) |
| Backend | [tRPC](https://trpc.io) via `trpc-nuxt` |
| ORM | [Prisma](https://prisma.io) with SQLite |
| Validation | [Zod](https://zod.dev) (shared schemas) |
| Styling | Scoped CSS (no framework) |

## Features

- **Optimistic mutations** — insert, update, delete todos instantly in the UI before the server confirms
- **Live queries** — reactive query builder with `orderBy` (sorting persisted in URL)
- **tRPC integration** — typed API calls from client to server without code generation
- **Prisma + SQLite** — local database with auto-generated migrations
- **Client-driven IDs** — UUIDs generated on the client prevent duplicate entries on sync

## Project Structure

```
├── app/
│   ├── app.vue                     # Main SPA — todo list with inline editing
│   ├── composables/
│   │   └── useTodoCollection.ts    # Thin wrapper over the plugin's $todoCollection
│   └── plugins/
│       ├── 1.trpc.ts               # tRPC client setup (httpBatchLink)
│       └── 2.todo-collection.ts    # TanStack DB collection creation (single source of truth)
├── server/
│   ├── api/trpc/[trpc].ts          # tRPC API handler (Nuxt server route)
│   ├── trpc/
│   │   ├── init.ts                 # tRPC server initialization
│   │   └── routes/index.ts         # App router — todo CRUD procedures
│   └── utils/
│       ├── db.ts                   # Prisma query helpers (getAllTodos, createTodo, etc.)
│       └── prisma.ts               # Prisma client singleton
├── shared/schemas/
│   ├── index.ts
│   └── todo.ts                     # Zod schemas shared between client and server
├── prisma/
│   ├── schema.prisma               # Database schema (Todo model)
│   └── migrations/                 # Auto-generated migrations
├── nuxt.config.ts
└── .env.template
```

## Setup

### Prerequisites

- Node.js >= 20
- pnpm (recommended) or npm

### Install

```bash
pnpm install
```

### Environment

```bash
cp .env.template .env
```

The default config uses a local SQLite file at `./todos.db`.

### Database

```bash
pnpm prisma db push
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | Run TypeScript type checking (via `nuxi typecheck`) |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm prisma db push` | Sync database schema |
| `pnpm prisma studio` | Open Prisma Studio (GUI) |

## How It Works

### Data Flow

1. **Initial load** — `useLiveQuery` triggers the `queryFn` which calls `trpc.todo.list.query()`
2. **Optimistic write** — calling `todoCollection.insert()` / `.update()` / `.delete()` mutates the local collection immediately
3. **Server sync** — the `onInsert`/`onUpdate`/`onDelete` handlers persist changes to the server via tRPC mutations
4. **Deduplication** — the client generates a UUID (`crypto.randomUUID()`) and sends it to the server, so the server uses the same ID — no duplicate entries on refetch

### Collection Architecture

The `@tanstack/query-db-collection` adapter bridges TanStack DB with TanStack Query. The collection is created once in a Nuxt plugin and exposed via `$todoCollection`. The composable (`useTodoCollection`) is a thin accessor:

```ts
// app/plugins/2.todo-collection.ts — simplified
const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: () => trpc.todo.list.query(),
    getKey: (item: Todo) => item.id,
    schema: todoSchema,
    onInsert: /* persist to server */,
    onUpdate: /* persist to server */,
    onDelete: /* persist to server */,
  }),
)
```

### Sort Persistence

Sort direction (`?sort=asc` / `?sort=desc`) is stored in the URL query parameter. The `useLiveQuery` dependency array ensures the query re-runs when the sort changes.
