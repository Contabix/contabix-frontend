"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

type User = {
  id: string;
  email: string | null;
  displayName?: string | null;
  firstName?: string | null; 
  lastName?: string | null;  
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSyncing: boolean; 
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsSyncing(true); 
        try {
          const idToken = await firebaseUser.getIdToken();

          // 1. Set the Cookie
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            body: JSON.stringify({ idToken }),
          });

          // 2. Fetch User Profile from Database
          let profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            credentials: "include", 
          });

          // ⏳ THE FIX: If it fails, wait 1.5 seconds for the Signup save to finish, then retry!
          if (!profileRes.ok) {
            console.log("Database not ready, waiting for signup to finish...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
              method: "GET",
              credentials: "include", 
            });
          }

          if (profileRes.ok) {
            const dbUser = await profileRes.json();
            
            setUser({
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.firstName,
              lastName: dbUser.lastName,
              displayName: `${dbUser.firstName} ${dbUser.lastName}`, 
            });
          } else {
            // Absolute fallback
            setUser({
              id: firebaseUser.uid,
              email: null,
              displayName: "User",
            });
          }

        } catch (error) {
          console.error("Backend sync failed:", error);
          setUser(null);
        } finally {
          setIsSyncing(false); 
        }
      } else {
        setUser(null);
        setIsSyncing(false);
      }
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSyncing,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}