
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HeartPulse, Mail, Lock, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 bg-[#151C2C]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/10 p-3 rounded-2xl mb-4">
            <HeartPulse className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isRegister ? 'Start tracking your fitness journey.' : 'Log in to access your dashboard.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#0B0F19] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#0B0F19] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }} 
              className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isRegister ? 'Log In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}