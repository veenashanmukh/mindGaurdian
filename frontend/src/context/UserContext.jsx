import { createContext, useContext, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
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
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
