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

function persist(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    apiMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password) {
        const { access_token, user: loggedIn } = await apiLogin(email, password);
        persist(access_token);
        setUser(loggedIn);
        return loggedIn;
      },
      async signup(input) {
        const { access_token, user: created } = await apiRegister(input);
        persist(access_token);
        setUser(created);
        return created;
      },
      logout() {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
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
