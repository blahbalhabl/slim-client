import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const [auth, setAuth] = useState(null);
  const [reload, setReload] = useState(false);
  const [persist, setPersist] = useState(localStorage.getItem('persist') || true);

  const contextData = {
    setAuth: setAuth,
    setPersist: setPersist,
    setReload: setReload,
    auth: auth,
    persist: persist,
    reload: reload,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
