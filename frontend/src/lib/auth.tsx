import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiLogin, apiMe, apiRegister, type ApiUser } from '@/api/auth';
import { TOKEN_KEY } from '@/api/client';

export type Role = 'participant' | 'coordinator' | 'spoc' | 'admin';

export const ROLE_RANK: Record<Role, number> = {
  participant: 0,
  coordinator: 1,
  spoc: 2,
  admin: 3,
};

export type User = ApiUser;

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: { name: string; email: string; password: string; department: string; year: number }) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistToken(token: string, isStaff: boolean) {
  if (isStaff) {
    // Admin & Staff sessions DO NOT persist across browser restarts/tab reopens
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check sessionStorage first (for staff/admin sessions), then localStorage (for participants)
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }

    apiMe()
      .then((me) => {
        // If user is staff/admin but token was stored in localStorage, purge it so admin must log in again
        if (ROLE_RANK[me.role] >= 1 && !sessionStorage.getItem(TOKEN_KEY)) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        } else {
          setUser(me);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password) {
        const { access_token, user: loggedIn } = await apiLogin(email, password);
        const isStaff = ROLE_RANK[loggedIn.role] >= 1;
        persistToken(access_token, isStaff);
        setUser(loggedIn);
        return loggedIn;
      },
      async signup(input) {
        const { access_token, user: created } = await apiRegister(input);
        persistToken(access_token, false);
        setUser(created);
        return created;
      },
      logout() {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function hasRole(user: User | null, minimum: Role): boolean {
  if (!user) return false;
  return ROLE_RANK[user.role] >= ROLE_RANK[minimum];
}
