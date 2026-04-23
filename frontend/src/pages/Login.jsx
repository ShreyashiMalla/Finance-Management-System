import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  const submit = async e => { e.preventDefault(); try { await login(email, password); nav('/'); } catch(x){ setErr(x.response?.data?.error || 'Login failed'); } };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full p-3 rounded bg-white/10 border border-white/10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-3 rounded bg-white/10 border border-white/10" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full py-3 rounded bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold">Login</button>
      </form>
      <p className="mt-4 text-sm text-center">No account? <Link to="/register" className="text-indigo-300">Register</Link></p>
    </div>
  );
}
