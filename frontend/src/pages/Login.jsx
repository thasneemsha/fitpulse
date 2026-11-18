import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password });
        setIsRegister(false);
        alert('Account created! Please log in.');
      } else {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed. Is the server awake?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#09090B] relative overflow-hidden text-[#EDEDED] font-sans selection:bg-blue-500/30">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]"></div>

      <div className="w-full max-w-[400px] p-8 bg-[#121214]/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-[#27272A] z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#1A1A1E] p-3 rounded-2xl mb-4 shadow-inner border border-[#27272A]">
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-[#A1A1AA] text-sm mt-1">
            {isRegister ? 'Start tracking today.' : 'Log in to your dashboard.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#52525B]" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#09090B] border border-[#27272A] text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-[#52525B]"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#52525B]" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#09090B] border border-[#27272A] text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-[#52525B]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#A1A1AA] text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }} 
              className="ml-2 text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              {isRegister ? 'Log In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}