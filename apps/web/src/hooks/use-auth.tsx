"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { api } from "@/lib/fetch";
import type { User as AppUser } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isCustomer: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.get<{ profile: AppUser }>("/auth/me");
      setProfile(data.profile);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const isAdmin = profile?.role === "admin";
  const isCustomer = profile?.role === "customer";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isCustomer, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
