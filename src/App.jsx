import { 
  Routes, 
  Route, } from "react-router-dom"
import RequireAuth from "./components/RequireAuth"
import { AuthProvider } from "./context/AuthContext"
import PersistLogin from "./components/PersistLogin"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import NotFound from "./components/NotFound"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Unauthorized from "./pages/Unauthorized"
import Ordinances from "./pages/Ordinances"
import Profile from "./pages/Profile"
import Members from "./pages/Members"
import { roles } from "./utils/userRoles"

import './App.css'

function App() {

  // document.onkeydown = (e) => {
  //   if (e.key == 123) {
  //       e.preventDefault();
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.key == 'I') {
  //       e.preventDefault();
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.key == 'C') {
  //       e.preventDefault();
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.key == 'J') {
  //       e.preventDefault();
  //   }
  //   if (e.ctrlKey && e.key == 'U') {
  //       e.preventDefault();
  //   }
  // };

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

          {/* Persistent Login Routes */}
          <Route element={<PersistLogin />}>
            {/* Public routes with Persistent Login */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Private All Roles Route */}
            <Route element={<RequireAuth allowedRoles={[role.adn, role.spr, role.usr]}/>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/sanggunian-members" element={< Members />} />
            </Route>

            {/* Private Admin Routes*/}
            <Route element={<RequireAuth allowedRoles={[role.adn]} />}>
              <Route path="/records/ordinances/:status" element={<Ordinances />} />
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
