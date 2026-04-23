import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="backdrop-blur bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between">
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">💰 FinanceManager</Link>
      <div className="space-x-4">
        {user ? <>
          <span className="text-sm">Hi, {user.name}</span>
          <button onClick={logout} className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">Logout</button>
        </> : <>
          <Link to="/login" className="hover:text-indigo-300">Login</Link>
          <Link to="/register" className="hover:text-indigo-300">Register</Link>
        </>}
      </div>
    </nav>
  );
}
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}
