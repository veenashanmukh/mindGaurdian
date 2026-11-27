import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext();

const STORAGE_KEY = "mg_user_state";

export const DEFAULT_USER = {
  name: "",
  age: "",
  situations: [],
  energy: "normal", // low | normal | high
  permissions: {
    notifications: false,
    screenTime: false,
    voice: false,
    wearable: false,
  },
  screenTimeData: {
    totalForegroundMs: 0,
    lastStart: null,
  },
  journals: [],
  reflections: [],
  checkIns: [],
  activityLog: [],
};

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_USER,
      ...saved,
      permissions: { ...DEFAULT_USER.permissions, ...(saved.permissions || {}) },
    };
  } catch {
    return DEFAULT_USER;
  }
}

export function UserProvider({ children }) {
  // Everything stays on this device: the state is restored from localStorage on load
  // and saved again whenever it changes, so a refresh no longer wipes the profile.
  const [user, setUser] = useState(loadUser);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // storage can be full or blocked (private mode); the app still works for this visit
    }
  }, [user]);

  const resetUser = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setUser(DEFAULT_USER);
  };

  return (
    <UserContext.Provider value={{ user, setUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
