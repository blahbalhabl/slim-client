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
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
        level: res.data.level,
        isMember: res.data.isMember,
        position: res.data.position,
        otp: res.data.otp,
        token: res.data.token, }
    });
    return res.data.token;
  }
  return refresh;
}

export default useRefreshToken;