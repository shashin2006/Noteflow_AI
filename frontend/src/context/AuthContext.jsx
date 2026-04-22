import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      setUser({ user_id });
    }
  }, []);

 const login = (data) => {
  localStorage.setItem("user_id", data.user_id);   // 🔥 ADD THIS
  setUser({ user_id: data.user_id });
};

  const logout = () => {
    localStorage.removeItem("user_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);