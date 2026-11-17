import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Dumbbell, Bike, HeartPulse, Plus, LogOut, Flame, Trash2, Copy, CheckCircle2, Circle, TrendingUp, Calendar, Zap } from 'lucide-react';
import api from '../api/axios';

// --- HELPER: Calculate Calories ---
const calculateCalories = (workout) => {
  if (workout.workout_type === 'Cardio') return (parseFloat(workout.details.time) || 0) * 10;
  if (workout.workout_type === 'Strength') return (parseFloat(workout.details.sets) || 0) * (parseFloat(workout.details.reps) || 0) * (parseFloat(workout.details.weight) || 0) * 0.05;
  return (parseFloat(workout.details.duration) || 0) * 3;
};

// --- COMPONENT: 90-Day Heatmap ---
function Heatmap({ workouts }) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  const hasWorkoutOnDate = (date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    return workouts.some(w => {
      const workoutDate = new Date(w.logged_at);
      return workoutDate >= date && workoutDate < nextDate;
    });
  };

  return (
    <div className="bg-[#151C2C] p-6 rounded-3xl shadow-xl border border-gray-800/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Consistency Map
          </h3>
          <p className="text-xs text-gray-400 mt-1">Your workout activity over the last 90 days.</p>
        </div>
      </div>
      
      <div className="grid grid-rows-7 grid-flow-col gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {days.map((date, index) => {
          const workedOut = hasWorkoutOnDate(date);
          return (
            <div
              key={index}
              title={date.toDateString()}
              className={`w-4 h-4 rounded-md ${workedOut ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-800'} hover:ring-2 hover:ring-gray-400 cursor-pointer transition-all`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('Strength');
  const [exerciseName, setExerciseName] = useState('');
  const [details, setDetails] = useState({ sets: '', reps: '', weight: '' });

  const fetchWorkouts = async () => {
    try {
      const response = await api.get('/workouts/');
      setWorkouts(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, [navigate]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'Strength') setDetails({ sets: '', reps: '', weight: '' });
    if (type === 'Cardio') setDetails({ distance: '', time: '' });
    if (type === 'Flexibility') setDetails({ duration: '' });
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workouts/', {
        workout_type: selectedType,
        exercise_name: exerciseName,
        details: details
      });
      setIsModalOpen(false);
      setExerciseName('');
      handleTypeChange('Strength');
      fetchWorkouts();
    } catch (err) {
      alert('Failed to add workout');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await api.delete(`/workouts/${id}`);
      fetchWorkouts();
    } catch (err) {
      alert('Failed to delete workout');
    }
  };

  const handleCopy = (workout) => {
    setSelectedType(workout.workout_type);
    setExerciseName(workout.exercise_name);
    setDetails(workout.details);
    setIsModalOpen(true);
  };

  const handleGetInsight = async () => {
    setInsight('Analyzing your data...');
    try {
      const response = await api.get('/ai/insights');
      setInsight(response.data.insight);
    } catch (err) {
      setInsight(err.response?.data?.detail || 'Failed to get insight');
    }
  };

  // --- DATA PREP ---
  const totalCalories = workouts.reduce((sum, w) => sum + calculateCalories(w), 0);

  const breakdownData = [
    { name: 'Strength', value: workouts.filter(w => w.workout_type === 'Strength').length, color: '#3b82f6' },
    { name: 'Cardio', value: workouts.filter(w => w.workout_type === 'Cardio').length, color: '#10b981' },
    { name: 'Flexibility', value: workouts.filter(w => w.workout_type === 'Flexibility').length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const weeklyConsistencyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const uniqueDays = new Set();
    workouts.forEach(w => {
      const d = new Date(w.logged_at);
      if (d >= weekStart && d < weekEnd) uniqueDays.add(d.toDateString());
    });
    weeklyConsistencyData.push({
      name: i === 0 ? 'This Week' : `${i} Wk Ago`,
      days: uniqueDays.size
    });
  }

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex justify-center items-center text-blue-500 font-bold animate-pulse text-xl">Loading FitPulse...</div>;

  return (
    <div className="min-h-screen w-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-gray-200 overflow-x-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center mb-8 bg-[#151C2C]/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-800 shadow-xl z-10 relative">
        <div className="flex items-center gap-3">
          <HeartPulse className="text-red-500 w-7 h-7" />
          <h1 className="text-2xl font-bold text-white tracking-wide">FitPulse</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors bg-gray-800/50 px-4 py-2 rounded-xl">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 z-10 relative">
        
        {/* Left Side */}
        <div className="flex-1 space-y-6">
          
          {/* Top Header & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden">
              <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back! 👋</h2>
              <p className="text-blue-200/80 mb-6">Ready to crush your fitness goals today?</p>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30">
                <Plus className="w-5 h-5" /> Log New Workout
              </button>
            </div>

            <div className="bg-[#151C2C] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-center items-center text-center">
              <Flame className="w-10 h-10 text-orange-500 mb-2" />
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Calories Burned</p>
              <p className="text-4xl font-black text-white mt-1">{Math.round(totalCalories)}</p>
            </div>
          </div>

          <Heatmap workouts={workouts} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Consistency Line Chart */}
            <div className="bg-[#151C2C] p-6 rounded-3xl border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> Consistency
              </h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyConsistencyData}>
                    <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis stroke="#6b7280" axisLine={false} tickLine={false} domain={[0, 7]} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '12px', color: '#fff'}} />
                    <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#151C2C', strokeWidth: 2, stroke: '#3b82f6'}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Breakdown Donut Chart */}
            <div className="bg-[#151C2C] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col">
              <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Breakdown
              </h3>
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                {breakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={6} stroke="none">
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '12px', color: '#fff'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm">No data yet</p>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs font-medium text-gray-400">
                {breakdownData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-br from-[#151C2C] to-[#0B0F19] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Flame className="w-5 h-5 text-orange-500" /> AI Coach
              </h3>
              <button onClick={handleGetInsight} className="text-sm bg-orange-500/10 text-orange-400 px-5 py-2 rounded-xl font-bold hover:bg-orange-500/20 transition-all border border-orange-500/20">
                Generate Insight
              </button>
            </div>
            {insight ? (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#0B0F19] p-5 rounded-2xl border border-gray-800/50">{insight}</p>
            ) : (
              <p className="text-sm text-gray-500 italic p-2">Click generate to get personalized AI feedback on your recent workouts.</p>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-[#151C2C] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-white">Quick Start</h3>
            <div className="space-y-3">
              <button onClick={() => { handleTypeChange('Strength'); setIsModalOpen(true); }} className="w-full flex items-center gap-4 p-4 bg-[#0B0F19] rounded-2xl hover:bg-gray-800/80 transition-all border border-gray-800 hover:border-blue-500/30 group">
                <div className="bg-blue-500/10 p-2.5 rounded-xl group-hover:bg-blue-500/20 transition-colors"><Dumbbell className="w-5 h-5 text-blue-400" /></div>
                <span className="font-semibold text-gray-200">Strength Training</span>
              </button>
              <button onClick={() => { handleTypeChange('Cardio'); setIsModalOpen(true); }} className="w-full flex items-center gap-4 p-4 bg-[#0B0F19] rounded-2xl hover:bg-gray-800/80 transition-all border border-gray-800 hover:border-emerald-500/30 group">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl group-hover:bg-emerald-500/20 transition-colors"><Activity className="w-5 h-5 text-emerald-400" /></div>
                <span className="font-semibold text-gray-200">Cardio / Running</span>
              </button>
              <button onClick={() => { handleTypeChange('Flexibility'); setIsModalOpen(true); }} className="w-full flex items-center gap-4 p-4 bg-[#0B0F19] rounded-2xl hover:bg-gray-800/80 transition-all border border-gray-800 hover:border-purple-500/30 group">
                <div className="bg-purple-500/10 p-2.5 rounded-xl group-hover:bg-purple-500/20 transition-colors"><Bike className="w-5 h-5 text-purple-400" /></div>
                <span className="font-semibold text-gray-200">Flexibility / Yoga</span>
              </button>
            </div>
          </div>

          <div className="bg-[#151C2C] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-white">Recent Activity</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {workouts.map(w => (
                <div key={w.id} className="flex justify-between items-center bg-[#0B0F19] p-3 rounded-2xl border border-gray-800 group hover:border-gray-600 transition-colors">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="bg-gray-800/50 p-2 rounded-xl mt-0.5 shrink-0">
                      {w.workout_type === 'Strength' && <Dumbbell className="w-4 h-4 text-blue-400" />}
                      {w.workout_type === 'Cardio' && <Activity className="w-4 h-4 text-emerald-400" />}
                      {w.workout_type === 'Flexibility' && <Bike className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-sm capitalize text-gray-200 truncate">{w.exercise_name}</h4>
                      <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
                        {Object.entries(w.details).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <button onClick={() => handleCopy(w)} className="p-2 text-gray-400 hover:text-blue-400 bg-gray-800/50 rounded-lg transition-colors" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="p-2 text-gray-400 hover:text-red-400 bg-gray-800/50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {workouts.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No recent workouts.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-[#151C2C] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Log {selectedType}</h2>
            
            <form onSubmit={handleAddWorkout} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Exercise Name</label>
                <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} required placeholder="e.g. Bench Press" className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {selectedType === 'Strength' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Sets</label>
                    <input type="number" value={details.sets} onChange={e => setDetails({...details, sets: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reps</label>
                    <input type="number" value={details.reps} onChange={e => setDetails({...details, reps: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weight</label>
                    <input type="number" step="0.1" value={details.weight} onChange={e => setDetails({...details, weight: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}

              {selectedType === 'Cardio' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Distance (mi)</label>
                    <input type="number" step="0.1" value={details.distance} onChange={e => setDetails({...details, distance: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time (min)</label>
                    <input type="number" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}

              {selectedType === 'Flexibility' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
                  <input type="number" value={details.duration} onChange={e => setDetails({...details, duration: e.target.value})} required className="w-full p-3.5 text-sm bg-[#0B0F19] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-800 text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">Save Workout</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}