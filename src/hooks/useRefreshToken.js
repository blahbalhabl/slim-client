import axios from '../api/axios'
import useAuth from './useAuth'

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const res = await axios.post('/refresh', {
      withCredentials: true
    });
    setAuth(prev => {
      return {
        ...prev,
        id: res.data.id,
        avatar: res.data.avatar,
        name: res.data.name,
        role: res.data.role,
        level: res.data.level,
        otp: res.data.otp,
        token: res.data.token, }
    });
    return res.data.token;
  }
  return refresh;
}

export default useRefreshToken;