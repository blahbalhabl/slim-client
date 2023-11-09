import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const useAuth = () => {
  const { auth, setAuth, persist, setPersist, reload, setReload } = useContext(AuthContext);

  const setAuthenticatedData = (data) => {
    setAuth(data);
  };

  const setReloadOrdinances = async (data) => {
    await setReload(data);
  }

  return { auth, setAuth: setAuthenticatedData, reload, setReload: setReloadOrdinances, persist, setPersist };
};

export default useAuth;
