import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const useAuth = () => {
  const { auth, setAuth, persist, setPersist } = useContext(AuthContext);

  const setAuthenticatedData = (data) => {
    setAuth(data);
  };

  return { auth, setAuth: setAuthenticatedData, persist, setPersist };
};

export default useAuth;
