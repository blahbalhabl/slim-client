import { 
  Routes, 
  Route, } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import RequireAuth from "./components/RequireAuth"
import PersistLogin from "./components/PersistLogin"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import NotFound from "./components/NotFound"

import Login from "./pages/Login"
import ForgotPass from "./pages/ForgotPass"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Unauthorized from "./pages/Unauthorized"
import Ordinances from "./pages/Ordinances"
import Profile from "./pages/Profile"
import Members from "./pages/Members"
import Attendance from "./pages/Attendance"
import AttendanceEntry from "./pages/AttendanceEntry"
import { roles } from "./utils/userRoles"

import './App.css'

const App = () => {
const role = roles.role;
const level = roles.level;

  return (
    <div className="App">
      <AuthProvider>
        <Header />
        <div className="App__Content">
        <Sidebar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path='/reset-password' element={<ForgotPass />} />

          {/* Persistent Login Routes */}
          <Route element={<PersistLogin />}>
            {/* Public routes with Persistent Login */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Private All Roles Routes */}
            <Route element={<RequireAuth allowedRoles={[role.adn, role.spr, role.usr]}/>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/sanggunian-members" element={< Members />} />
            </Route>

            {/* Private Admin and SuperAdmin Routes */}
            
            {/* Private Admin and User Routes*/}
            <Route element={<RequireAuth allowedRoles={[role.adn, role.usr]} />}>
              <Route path="/records/ordinances/:status" element={<Ordinances />} />
            </Route>

            {/* Private Admin Routes */}
            <Route element={<RequireAuth allowedRoles={[role.adn]} />}>
              <Route path="/proceedings" element={<Attendance />}/>
              <Route path="/proceedings/:id/:date" element={<AttendanceEntry/>}/>
            </Route>

            {/* Private Superadmin Routes */}
            <Route element={<RequireAuth allowedRoles={[role.spr]} />}>
              <Route path="/users" element={<Signup />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </div>
      </AuthProvider>
    </div>
  );
}

export default App
