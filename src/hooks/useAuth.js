import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const useAuth = () => {
  const { auth, setAuth, persist, setPersist, setReload } = useContext(AuthContext);

  const setAuthenticatedData = (data) => {
    setAuth(data);
  };

  const setReloadOrdinances = (data) => {
    setReload(data)
  }

  return { auth, setAuth: setAuthenticatedData, setReload: setReloadOrdinances, persist, setPersist };
};

export default useAuth;
