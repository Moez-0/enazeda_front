import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
  provider?: "email" | "google" | "phone";
  trustScore?: number;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, method: "email" | "google" | "phone", password?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for persisted user
    const saved = localStorage.getItem("enazeda_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("enazeda_token");
      if (token) {
        try {
          api.setToken(token);
          const userData = await api.getCurrentUser();
          setUser({
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            name: userData.name,
            provider: userData.provider as "email" | "google" | "phone",
            trustScore: userData.trustScore,
          });
        } catch (error) {
          // Token invalid, clear it
          api.setToken(null);
          localStorage.removeItem("enazeda_user");
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (identifier: string, method: "email" | "google" | "phone", password?: string) => {
    try {
      let response;
      if (method === "email" && password) {
        response = await api.emailLogin(identifier, password);
      } else {
        throw new Error("Invalid login method");
      }
      
      api.setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      });
      localStorage.setItem("enazeda_user", JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      }));
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.googleLogin(credential);
      api.setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      });
      localStorage.setItem("enazeda_user", JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      }));
    } catch (error: any) {
      throw new Error(error.message || "Google login failed");
    }
  };

  const requestOTP = async (phone: string) => {
    try {
      await api.requestOTP(phone);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async (phone: string, code: string) => {
    try {
      const response = await api.verifyOTP(phone, code);
      api.setToken(response.token);
      setUser({
        id: response.user.id,
        phone: response.user.phone,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      });
      localStorage.setItem("enazeda_user", JSON.stringify({
        id: response.user.id,
        phone: response.user.phone,
        name: response.user.name,
        provider: response.user.provider,
        trustScore: response.user.trustScore,
      }));
    } catch (error: any) {
      throw new Error(error.message || "OTP verification failed");
    }
  };

  const logout = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem("enazeda_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      requestOTP,
      verifyOTP,
      logout, 
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
