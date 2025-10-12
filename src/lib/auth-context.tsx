"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  auth,
  subscribeToAuthChanges,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/firebase/client";
import { getUserProfileByUserId } from "@/lib/actions/user_profile.action";
import {
  UserProfile,
  hasAdminPrivileges,
} from "@/lib/domains/user_profile.domain";
import { useRouter } from "next/navigation";

interface User {
  $id: string;
  name?: string;
  email: string;
  userProfile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!user;
  const isAdmin = userProfile
    ? hasAdminPrivileges(userProfile.role) && userProfile.isActive
    : false;

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile data
        const profileResult = await getUserProfileByUserId(firebaseUser.uid);

        if (profileResult.success && profileResult.data) {
          const profile = profileResult.data as UserProfile;
          setUserProfile(profile);

          const user: User = {
            $id: firebaseUser.uid,
            name: firebaseUser.displayName || profile.name || undefined,
            email: firebaseUser.email || "",
            userProfile: profile,
          };

          setUser(user);
          await setAuthCookies(firebaseUser);
        } else {
          // User exists in Firebase but no profile in Firestore
          setUser(null);
          setUserProfile(null);
          clearAuthCookies();
        }
      } else {
        setUser(null);
        setUserProfile(null);
        clearAuthCookies();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
      clearAuthCookies();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value = {
    user,
    setUser,
    isLoggedIn,
    isAdmin,
    userProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
