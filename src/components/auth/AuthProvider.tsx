"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  role: "USER" | "ADMIN";
  phone: string;
  fullName: string | null;
  email: string | null;
  username: string | null;
};

type AuthState = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  // localStorage mirror — true only when the server confirms a session.
  // Never read this on the server; useAuth() always revalidates against /api/auth/me.
  isLoggedInLocal: boolean;
  // Persistent UX hint used only to choose Login vs Signup in the navbar.
  // This is never used for authentication or authorization.
  hasSignedInBefore: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<boolean>;
};

const LS_KEY = "svnb.auth";
const LS_RETURNING_USER_KEY = "svnb.has-signed-in";

const AuthContext = createContext<AuthContextValue | null>(null);

function readLocalFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LS_KEY) === "true";
  } catch {
    return false;
  }
}

function writeLocalFlag(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(LS_KEY, "true");
    } else {
      window.localStorage.setItem(LS_KEY, "false");
    }
  } catch {
    // localStorage may be disabled (private mode, etc.) — fail open, not fatal.
  }
}

function readReturningUserFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(LS_RETURNING_USER_KEY) === "true" ||
      readLocalFlag()
    );
  } catch {
    return false;
  }
}

function markAsReturningUser() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_RETURNING_USER_KEY, "true");
  } catch {
    // localStorage may be disabled; this hint is optional.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Seed with SSR-safe defaults so the first render is identical on the server
  // and the client. The localStorage hints are hydrated in an effect below; the
  // refresh() call that follows is the source of truth for auth status.
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
    isLoggedInLocal: false,
    hasSignedInBefore: false,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setState((current) => ({
          status: "unauthenticated",
          user: null,
          isLoggedInLocal: false,
          hasSignedInBefore: current.hasSignedInBefore,
        }));
        writeLocalFlag(false);
        return;
      }
      const json = await res.json();
      const data = json?.data as AuthUser | undefined;
      if (!data?.id) {
        setState((current) => ({
          status: "unauthenticated",
          user: null,
          isLoggedInLocal: false,
          hasSignedInBefore: current.hasSignedInBefore,
        }));
        writeLocalFlag(false);
        return;
      }
      setState({
        status: "authenticated",
        user: data,
        isLoggedInLocal: true,
        hasSignedInBefore: true,
      });
      writeLocalFlag(true);
      markAsReturningUser();
    } catch {
      setState((current) => ({
        status: "unauthenticated",
        user: null,
        isLoggedInLocal: false,
        hasSignedInBefore: current.hasSignedInBefore,
      }));
      writeLocalFlag(false);
    }
  }, []);

  const signIn = useCallback((user: AuthUser) => {
    setState({
      status: "authenticated",
      user,
      isLoggedInLocal: true,
      hasSignedInBefore: true,
    });
    writeLocalFlag(true);
    markAsReturningUser();
  }, []);

  const signOut = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) return false;
    } catch {
      return false;
    }
    setState((current) => ({
      status: "unauthenticated",
      user: null,
      isLoggedInLocal: false,
      hasSignedInBefore: current.hasSignedInBefore,
    }));
    writeLocalFlag(false);
    return true;
  }, []);

  // On mount, hydrate the localStorage-derived UX hints. This runs after the
  // first render so SSR and the client's first paint agree, then upgrades the
  // navbar to the correct Login vs Signup button. The refresh() effect below
  // is the source of truth for actual auth status.
  useEffect(() => {
    const localFlag = readLocalFlag();
    const returningFlag = readReturningUserFlag();
    setState((current) => {
      if (current.isLoggedInLocal === localFlag && current.hasSignedInBefore === returningFlag) {
        return current;
      }
      return {
        ...current,
        isLoggedInLocal: localFlag,
        hasSignedInBefore: returningFlag,
      };
    });
  }, []);

  // On mount, revalidate against the server. The localStorage seed above is
  // a UX hint only; this fetch is the source of truth. The eslint rule
  // react-hooks/set-state-in-effect is conservative — `refresh` updates state
  // from the network response inside an async callback, which is the canonical
  // mount-time data-fetch pattern in this codebase (see AdminShell).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  // Cross-tab sync — sign out in one tab signs out everywhere.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === LS_KEY) {
        void refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, refresh, signIn, signOut }),
    [state, refresh, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
