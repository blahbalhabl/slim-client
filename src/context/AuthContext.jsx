import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const [auth, setAuth] = useState();
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem('persist')) || true);
  
  const contextData = {
    setAuth:setAuth,
    setPersist: setPersist,
    auth: auth,
    persist: persist,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
