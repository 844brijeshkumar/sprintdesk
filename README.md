# SprintDesk - Enterprise Agile Sprint & Task Management SPA

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154.svg)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-4338ca.svg)](https://zustand.docs.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-v2-729b1b.svg)](https://vitest.dev/)

**SprintDesk** is a high-performance, single-page application (SPA) built from first principles for software teams managing sprint iterations, backlog velocity, and cross-functional development tasks (inspired by Linear and Jira).

---

## 1. Architectural Blueprint & Layered Separation of Concerns

SprintDesk is strictly structured around the **Dependency Inversion Principle** and **Separation of Concerns (SoC)**:

```
src/
├── api/                  # Network configuration & auth interceptors
│   ├── client.ts         # Axios client instances
│   └── interceptors.ts   # 401 refresh token queue & Bearer header injection
├── services/             # Pure API layer (Network calls without UI dependencies)
│   ├── auth.service.ts   # DummyJSON login, refresh, profile endpoints
│   ├── task.service.ts   # Mock sprint dataset loader
│   └── notification.service.ts # JSONPlaceholder poller & transformer
├── hooks/                # Custom React & TanStack Query hooks
│   ├── queries/
│   │   ├── useTaskData.ts       # Seeds initial server state into Zustand
│   │   └── useNotifications.ts  # Polling hook with Page Visibility API
│   ├── useToast.ts       # Global toast notification dispatcher
│   ├── useTheme.ts       # Light/Dark mode with localStorage persistence
│   └── useClickOutside.ts# Dropdown & overlay dismissal detector
├── stores/               # Zustand Client-State Stores
│   ├── authStore.ts      # In-memory access token, user session, login/logout
│   ├── boardStore.ts     # Synchronous Kanban drag-and-drop state & task CRUD
│   ├── notificationStore.ts # ID-diffing notifications & unread tracking
│   └── toastStore.ts     # Global auto-expiring toast queue
├── types/                # Strict TypeScript domain interfaces
│   ├── auth.types.ts
│   ├── task.types.ts
│   └── notification.types.ts
├── utils/                # Pure utility functions & data reducers
│   ├── cn.ts             # Tailwind class merge utility
│   └── analyticsTransformers.ts # Memoized reducers for Recharts & KPIs
├── components/
│   ├── ui/               # 100% Handcrafted Design System (Zero pre-built libs)
│   │   ├── Button.tsx    # Variants, sizes, loading spinners
│   │   ├── Input.tsx     # Labels, errors, icons
│   │   ├── Select.tsx    # Custom accessible dropdown with full keyboard navigation
│   │   ├── Modal.tsx     # Portaled accessible dialog with focus trap & ESC
│   │   ├── Drawer.tsx    # Portaled slide-out panel for task details
│   │   ├── Toast.tsx     # Portaled toast alerts with animations
│   │   ├── Badge.tsx     # Priority, status, and tag badges
│   │   ├── DataTable.tsx # Generic typed data table with sorting and pagination
│   │   ├── Skeleton.tsx  # Pulse animation placeholders
│   │   └── Card.tsx      # Container cards
│   ├── layout/
│   │   ├── AppLayout.tsx # Persistent sidebar/header layout with Outlet
│   │   ├── Sidebar.tsx   # Collapsible sidebar with active indicators
│   │   ├── Header.tsx    # Action bar, theme toggle, and notification bell
│   │   └── NotificationDropdown.tsx # Real-time notification panel
│   ├── auth/
│   │   ├── ProtectedRoute.tsx # Route protection & full-screen session loader
│   │   └── PublicRoute.tsx    # Reverse protection (redirects to /dashboard)
│   ├── board/
│   │   ├── KanbanBoard.tsx    # @dnd-kit DndContext & drag overlay
│   │   ├── KanbanColumn.tsx   # Droppable container with story point counts
│   │   ├── TaskCard.tsx       # Draggable sortable card with priority badges
│   │   ├── TaskDrawer.tsx     # Detail editor, comments thread, delete action
│   │   ├── CreateTaskModal.tsx# Task creation modal with validation
│   │   └── BoardFilters.tsx   # Search, priority, assignee, tag filters
│   └── analytics/
│       ├── MetricCard.tsx
│       ├── BurndownChart.tsx     # Recharts ideal vs actual area chart
│       ├── StatusPieChart.tsx    # Recharts donut chart with points breakdown
│       ├── PriorityBarChart.tsx  # Recharts severity distribution
│       └── WorkloadBarChart.tsx  # Recharts team member workload
├── pages/                # Code-split lazy loaded routes
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BoardPage.tsx
│   └── AnalyticsPage.tsx
├── __tests__/            # Comprehensive Vitest + RTL test suite
│   ├── setup.ts
│   ├── useToast.test.ts          # Mandatory Test 1
│   ├── boardStore.test.ts        # Mandatory Test 2
│   └── authInterceptor.test.ts   # Mandatory Test 3
├── data/
│   └── mock-data.json    # Untouched raw mock seed
└── App.tsx
```

---

## 2. Core Feature Highlights

### Task 01: Enterprise Authentication & Interceptor
- **Strict Token Separation**: The access token is stored strictly **in-memory** in the Zustand store (never written to `localStorage` or `sessionStorage`), protecting against XSS token harvesting. Only the `refreshToken` is persisted to `localStorage`.
- **401 Interceptor Queue**: The Axios response interceptor intercepts 401 Unauthorized responses, halts pending requests in a Promise queue, initiates a single refresh request to DummyJSON (`/auth/refresh`), updates the in-memory token, and flushes all queued requests with the updated `Authorization: Bearer <token>` header.
- **Initial Load State**: Silent session rehydration via `initAuth()` displays a full-screen brand loader before rendering the authenticated dashboard or redirecting to `/login`.
- **Reverse Route Protection**: Authenticated users visiting `/login` are automatically redirected to `/dashboard`.

### Task 02: Kanban Sprint Board (@dnd-kit)
- **Data Handoff**: TanStack Query loads `mock-data.json` initially and hands state off to the Zustand `boardStore` for instantaneous synchronous mutations during drag-and-drop.
- **Accessible Drag-and-Drop**: Built using `@dnd-kit/core` and `@dnd-kit/sortable` with `PointerSensor` (distance activation constraints to prevent misclicks) and `KeyboardSensor`.
- **Slide-out Drawer**: Clicking a task card mounts a custom slide-out `Drawer` via `ReactDOM.createPortal` in `#portal-root`. Allows updating title, description, priority, story points, assignee, tags, and posting comments to the task discussion thread.

### Task 03: Live Sprint Analytics & Visualizations (Recharts)
- **Live Data Synchronization**: Charts read directly from the same Zustand store as the Kanban board. Dragging a card from *In Progress* to *Done* immediately recalculates the Burndown curve, Status donut, and Team workload charts.
- **Memoized Reducers (`useMemo`)**: Transforms raw task arrays into chart datasets without mutating source collections.
- **Responsive Layout**: Wrapped in `<ResponsiveContainer>` to stack on mobile (375px) and expand into a multi-column analytical dashboard on desktop.

### Task 04: Handcrafted Design System & Accessibility (a11y)
- **Zero Pre-built UI Libraries**: No MUI, Chakra, AntD, or Shadcn. Every component is engineered using Tailwind CSS, `clsx`, and `tailwind-merge`.
- **Accessible Custom Select**: Replaces native `<select>` with a keyboard-navigable combobox (`ArrowUp`/`ArrowDown`, `Enter`, `Escape`, `Home`, `End`) featuring `role="combobox"`, `role="listbox"`, `role="option"`, and click-outside listeners.
- **Portals & Focus Trapping**: Modals, Drawers, and Toasts render inside `#portal-root` to avoid `z-index` and clipping issues.

### Task 05: Real-Time Notification Diff Engine
- **Polling & Tab Visibility**: Uses TanStack Query `refetchInterval: 15000` connected to the browser's Page Visibility API (`visibilitychange`), pausing polling automatically when the tab is hidden.
- **ID Diffing Logic**: Compares incoming post IDs from JSONPlaceholder against stored IDs. Any freshly detected item updates the unread badge count and triggers an animated Toast alert.
- **Pagination**: Supports "Load More" pagination in the notification panel when exceeding 20 items.

---

## 3. Test Suite (Vitest + React Testing Library)

SprintDesk includes comprehensive unit and integration tests covering all critical paths:

| Test File | Target | Coverage |
| :--- | :--- | :--- |
| `useToast.test.ts` | `useToast` & `toastStore` | Adding toasts, auto-removal timers, manual dismiss, concurrent toast lifecycles |
| `boardStore.test.ts` | Zustand `boardStore` | Seeding, adding tasks with sequential IDs, moving across columns, updating, deleting, comments |
| `authInterceptor.test.ts` | Axios Interceptors | Bearer injection, 401 interception, queued concurrent retries, token refresh failure handling |

Run the test suite:
```bash
npm run test
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Navigate to project directory
cd scratch/sprintdesk

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

### Production Build & Typecheck
```bash
npm run build
npm run preview
```

### Demo Accounts
| Username | Password | Role |
| :--- | :--- | :--- |
| `emilys` | `emilyspass` | Lead Frontend Architect |
| `michaelw` | `michaelwpass` | Senior Fullstack Engineer |
*(Quick auto-fill buttons are provided on the login page for instantaneous evaluation).*
