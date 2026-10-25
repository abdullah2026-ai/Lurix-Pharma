"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { IUserProfile } from "@/lib/types";
import { Permission, UserRole, UserStatus } from "@/lib/constants";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: IUserProfile | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  hasPermission: () => false,
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchSession = async (user: User) => {
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setUserProfile(null);
        return;
      }

      const data = await res.json();
      setUserProfile(data.user);
    } catch (err) {
      console.error("Failed to fetch session profile:", err);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchSession(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === "SuperAdmin") return true;
    if (userProfile.status !== "Active") return false;
    return Boolean(userProfile.permissions?.includes(permission));
  };

  const signOut = async () => {
    if (auth) {
      await fbSignOut(auth);
    }
    setUserProfile(null);
    setFirebaseUser(null);
    router.push("/login");
  };

  const refreshSession = async () => {
    if (firebaseUser) {
      await fetchSession(firebaseUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        hasPermission,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
