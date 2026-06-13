// Simple credential-based auth (production: connect to real provider)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
}

// Mock credentials for demo — replace with real DB lookup
export const DEMO_USERS = [
  { id: "u1", name: "Sophie Martin", email: "sophie@orchestra.fr", password: "Orchestra2025!", role: "admin" as const },
  { id: "u2", name: "Marc Dupont", email: "marc@orchestra.fr", password: "Orchestra2025!", role: "manager" as const },
  { id: "u3", name: "Marie Leroy", email: "marie@orchestra.fr", password: "Orchestra2025!", role: "manager" as const },
];
