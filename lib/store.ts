import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_TODOS, INITIAL_NOTES, INITIAL_TICKETS, type Todo, type Note } from "./data";

// ── Auth ──────────────────────────────────────────────────────────────────────

interface AuthStore {
  user: { id: string; name: string; email: string; role: string } | null;
  setUser: (user: AuthStore["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "orchestra-auth" }
  )
);

// ── Todos ─────────────────────────────────────────────────────────────────────

interface TodoStore {
  todos: Todo[];
  lastSync: string | null;
  isSyncing: boolean;
  addTodo: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTodo: (id: string, patch: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => void;
  syncFromCoda: () => Promise<void>;
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: INITIAL_TODOS,
      lastSync: null,
      isSyncing: false,
      syncFromCoda: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/coda/todos");
          if (!res.ok) { set({ isSyncing: false }); return; }
          const data = await res.json();
          set({ todos: data.todos, lastSync: data.syncedAt, isSyncing: false });
        } catch { set({ isSyncing: false }); }
      },
      addTodo: async (todo) => {
        const newTodo: Todo = {
          ...todo,
          id: `t${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        };
        set((s) => ({ todos: [...s.todos, newTodo] }));
        // Write to Coda in background
        try {
          const res = await fetch("/api/coda/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
          });
          if (res.ok) {
            const data = await res.json();
            // Store the Coda row ID for future updates
            set((s) => ({
              todos: s.todos.map((t) =>
                t.id === newTodo.id ? { ...t, codaRowId: data.codaRowId } : t
              ),
            }));
          }
        } catch { /* silent — local state already updated */ }
      },
      updateTodo: async (id, patch) => {
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString().split("T")[0] } : t
          ),
        }));
        // Sync to Coda if we have a row ID
        const todo = get().todos.find((t) => t.id === id);
        const codaRowId = (todo as Todo & { codaRowId?: string })?.codaRowId ?? id;
        if (codaRowId) {
          try {
            await fetch("/api/coda/todos", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ codaRowId, ...patch }),
            });
          } catch { /* silent */ }
        }
      },
      deleteTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
    }),
    { name: "orchestra-todos" }
  )
);

// ── Notes ─────────────────────────────────────────────────────────────────────

interface NoteStore {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: INITIAL_NOTES,
      addNote: (note) =>
        set((s) => ({
          notes: [
            {
              ...note,
              id: `n${Date.now()}`,
              createdAt: new Date().toISOString().split("T")[0],
              updatedAt: new Date().toISOString().split("T")[0],
            },
            ...s.notes,
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString().split("T")[0] } : n
          ),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePin: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        })),
    }),
    { name: "orchestra-notes" }
  )
);

// ── Global search ─────────────────────────────────────────────────────────────

interface SearchStore {
  query: string;
  setQuery: (q: string) => void;
}

export const useSearchStore = create<SearchStore>()((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));

// ── Fireflies sync ────────────────────────────────────────────────────────────

export interface FirefliesMeeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  summary: string | null;
  actionItems: string[];
  transcript: string | null;
}

interface FirefliesStore {
  meetings: FirefliesMeeting[] | null;
  lastSync: string | null;
  isSyncing: boolean;
  error: string | null;
  syncFromFireflies: () => Promise<void>;
}

export const useFirefliesStore = create<FirefliesStore>()(
  persist(
    (set) => ({
      meetings: null,
      lastSync: null,
      isSyncing: false,
      error: null,
      syncFromFireflies: async () => {
        set({ isSyncing: true, error: null });
        try {
          const res = await fetch("/api/fireflies");
          const data = await res.json();
          if (!res.ok) {
            set({ isSyncing: false, error: data.error ?? "Erreur sync Fireflies" });
            return;
          }
          set({ meetings: data.transcripts, lastSync: new Date().toISOString(), isSyncing: false, error: null });
        } catch (e) {
          set({ isSyncing: false, error: String(e) });
        }
      },
    }),
    { name: "orchestra-fireflies" }
  )
);

// ── Coda live sync ────────────────────────────────────────────────────────────

import type { Store } from "./data";

interface CodaSyncStore {
  stores: Store[] | null;       // null = not synced yet, use static seed
  lastSync: string | null;
  isSyncing: boolean;
  error: string | null;
  syncFromCoda: () => Promise<void>;
  addStoreToCoda: (store: Omit<Store, "id">) => Promise<{ ok: boolean; error?: string }>;
  setStores: (stores: Store[]) => void;
}

export const useCodaSyncStore = create<CodaSyncStore>()(
  persist(
    (set) => ({
      stores: null,
      lastSync: null,
      isSyncing: false,
      error: null,
      setStores: (stores) => set({ stores }),
      syncFromCoda: async () => {
        set({ isSyncing: true, error: null });
        try {
          const res = await fetch("/api/coda/sync");
          const data = await res.json();
          if (!res.ok) {
            set({ isSyncing: false, error: data.error ?? "Erreur sync Coda" });
            return;
          }
          set({ stores: data.stores, lastSync: data.syncedAt, isSyncing: false, error: null });
        } catch (e) {
          set({ isSyncing: false, error: String(e) });
        }
      },
      addStoreToCoda: async (store) => {
        try {
          const res = await fetch("/api/coda/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(store),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, error: data.error };
          return { ok: true };
        } catch (e) {
          return { ok: false, error: String(e) };
        }
      },
    }),
    { name: "orchestra-coda-sync" }
  )
);
