"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { api } from "@/lib/fetch";
import type { User as AppUser, Seller } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  seller: Seller | null;
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isSeller: boolean;
  isApprovedSeller: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  seller: null,
  loading: true,
  isAdmin: false,
  isCustomer: false,
  isSeller: false,
  isApprovedSeller: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.get<{ profile: AppUser; seller: Seller | null }>("/auth/me");
      setProfile(data.profile);
      setSeller(data.seller);
    } catch {
      setProfile(null);
      setSeller(null);
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
  const isSeller = Boolean(seller);
  const isApprovedSeller = seller?.verification_status === "approved";

  return (
    <AuthContext.Provider value={{ user, profile, seller, loading, isAdmin, isCustomer, isSeller, isApprovedSeller, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
