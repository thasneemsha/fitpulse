import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Dumbbell, Bike, HeartPulse, Plus, LogOut, Flame, Trash2, Copy, CheckCircle2, Circle, TrendingUp, Zap } from 'lucide-react';
import api from '../api/axios';

const calculateCalories = (workout) => {
  if (workout.workout_type === 'Cardio') return (parseFloat(workout.details.time) || 0) * 10;
  if (workout.workout_type === 'Strength') return (parseFloat(workout.details.sets) || 0) * (parseFloat(workout.details.reps) || 0) * (parseFloat(workout.details.weight) || 0) * 0.05;
  return (parseFloat(workout.details.duration) || 0) * 3;
};

// --- NEW COMPONENT: 90-Day Heatmap with Month Labels ---
function Heatmap({ workouts }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysOfWeek = ['', 'Mon', '', 'Wed', '', 'Fri', '']; // Align to grid
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday of the week 90 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 89);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to Sunday

  // Generate grid dates
  for (let i = 0; i < 91; i++) { // ~13 weeks = 91 days
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
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

  // Calculate which month labels to show to avoid overlap
  const monthLabels = [];
  let lastMonth = -1;
  days.forEach((date, index) => {
    if (index % 7 === 0) { // Check only on Sundays
      const currentMonth = date.getMonth();
      if (currentMonth !== lastMonth) {
        monthLabels.push({ index: Math.floor(index / 7), name: months[currentMonth] });
        lastMonth = currentMonth;
      }
    }
  });

  return (
    <div className="bg-[#121214] p-5 rounded-3xl border border-[#27272A]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> Consistency Map
        </h3>
        <span className="text-xs text-[#52525B]">Last 90 days</span>
      </div>
      
      <div className="flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col gap-1 pr-2 text-[10px] text-[#52525B] mt-6">
          {daysOfWeek.map((day, i) => <div key={i} className="h-3.5">{day}</div>)}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          {/* X-Axis Labels */}
          <div className="flex gap-1 mb-2 text-[10px] text-[#52525B]">
             {monthLabels.map((m, i) => (
                <div key={i} style={{ width: `${(100 / 13)}%` }} className="min-w-[40px]">{m.name}</div>
             ))}
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-1 pb-1">
            {days.map((date, index) => {
              const workedOut = hasWorkoutOnDate(date);
              return (
                <div
                  key={index}
                  title={date.toDateString()}
                  className={`w-3.5 h-3.5 rounded-[4px] ${workedOut ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-[#1A1A1E]'} hover:ring-1 hover:ring-gray-500 cursor-pointer transition-all`}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[#52525B]">
        <span>Less</span>
        <div className="w-2.5 h-2.5 bg-[#1A1A1E] rounded-sm"></div>
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
}

function WeeklyCalendar({ workouts }) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const hasWorkoutOnDay = (dayIndex) => {
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);
    return workouts.some(w => {
      const workoutDate = new Date(w.logged_at);
      return workoutDate >= targetDate && workoutDate < nextDate;
    });
  };

  return (
    <div className="bg-[#121214] p-5 rounded-3xl border border-[#27272A]">
      <h3 className="text-sm font-medium mb-5 text-white">Workouts This Week</h3>
      <div className="flex justify-between items-center px-4">
        {daysOfWeek.map((day, index) => {
          const workedOut = hasWorkoutOnDay(index);
          const isToday = today.getDay() === index;
          return (
            <div key={day} className="flex flex-col items-center gap-3">
              <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-[#52525B]'}`}>
                {day}
              </span>
              {workedOut ? <CheckCircle2 className="w-7 h-7 text-blue-500" /> : <Circle className="w-7 h-7 text-[#27272A]" />}
            </div>
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
    setInsight('Analyzing...');
    try {
      const response = await api.get('/ai/insights');
      setInsight(response.data.insight);
    } catch (err) {
      setInsight(err.response?.data?.detail || 'Failed to get insight');
    }
  };

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

  if (loading) return <div className="min-h-screen bg-[#09090B] flex justify-center items-center text-blue-500 font-medium">Loading...</div>;

  return (
    <div className="min-h-screen w-screen bg-[#09090B] font-sans text-[#EDEDED] selection:bg-blue-500/30 pb-12">
      
      {/* Navbar */}
      <div className="w-full border-b border-[#27272A] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1300px] mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-blue-500 w-4 h-4" />
            <h1 className="text-base font-semibold tracking-tight text-white">FitPulse</h1>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors bg-[#1A1A1E] px-3 py-1 rounded-full border border-[#27272A]">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 pt-6 space-y-6">
        
        {/* Hero Banner */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gradient-to-r from-[#18181B] to-[#121214] p-6 rounded-3xl border border-[#27272A] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-60"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-1 text-white">Welcome Back! 👋</h2>
                <p className="text-sm text-[#A1A1AA]">Ready to crush your fitness goals today?</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Log Workout
              </button>
            </div>
          </div>

          <div className="w-full md:w-56 bg-[#121214] p-5 rounded-3xl border border-[#27272A] flex flex-col justify-center items-center text-center">
            <Flame className="w-6 h-6 text-orange-500 mb-1" />
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-semibold">Calories</p>
            <p className="text-3xl font-bold text-white mt-1">{Math.round(totalCalories)}</p>
          </div>
        </div>

        {/* Full Width Heatmap Row */}
        <div className="w-full">
           <Heatmap workouts={workouts} />
        </div>

        {/* Full Width Weekly Calendar Row */}
        <div className="w-full">
           <WeeklyCalendar workouts={workouts} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#121214] p-5 rounded-3xl border border-[#27272A]">
            <h3 className="text-sm font-medium mb-4 text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Weekly Consistency
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyConsistencyData}>
                  <XAxis dataKey="name" stroke="#52525B" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                  <YAxis stroke="#52525B" axisLine={false} tickLine={false} domain={[0, 7]} tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{backgroundColor: '#09090B', borderColor: '#27272A', borderRadius: '12px', color: '#fff', fontSize: '12px'}} />
                  <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#121214', strokeWidth: 2, stroke: '#3b82f6'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121214] p-5 rounded-3xl border border-[#27272A] flex flex-col">
            <h3 className="text-sm font-medium mb-2 text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Activity Breakdown
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[140px]">
              {breakdownData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} stroke="none">
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#09090B', borderColor: '#27272A', borderRadius: '12px', color: '#fff', fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#52525B] text-xs">No data yet</p>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-[11px] font-medium text-[#A1A1AA]">
              {breakdownData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-[#121214] p-5 rounded-3xl border border-[#27272A]">
            <h3 className="text-sm font-medium mb-4 text-white">Quick Start</h3>
            <div className="space-y-2">
              <button onClick={() => { handleTypeChange('Strength'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#09090B] rounded-2xl hover:bg-[#1A1A1E] transition-all border border-[#27272A] group">
                <div className="bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-500/20 transition-colors"><Dumbbell className="w-4 h-4 text-blue-500" /></div>
                <span className="text-xs font-medium text-[#EDEDED]">Strength Training</span>
              </button>
              <button onClick={() => { handleTypeChange('Cardio'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#09090B] rounded-2xl hover:bg-[#1A1A1E] transition-all border border-[#27272A] group">
                <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:bg-emerald-500/20 transition-colors"><Activity className="w-4 h-4 text-emerald-500" /></div>
                <span className="text-xs font-medium text-[#EDEDED]">Cardio / Running</span>
              </button>
              <button onClick={() => { handleTypeChange('Flexibility'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#09090B] rounded-2xl hover:bg-[#1A1A1E] transition-all border border-[#27272A] group">
                <div className="bg-purple-500/10 p-2 rounded-xl group-hover:bg-purple-500/20 transition-colors"><Bike className="w-4 h-4 text-purple-500" /></div>
                <span className="text-xs font-medium text-[#EDEDED]">Flexibility / Yoga</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-[#18181B] to-[#121214] p-5 rounded-3xl border border-[#27272A] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2 text-white">
                <Flame className="w-4 h-4 text-orange-500" /> AI Coach
              </h3>
              <button onClick={handleGetInsight} className="text-xs bg-[#1A1A1E] text-[#EDEDED] px-4 py-1.5 rounded-full font-medium hover:bg-[#27272A] transition-all border border-[#27272A]">
                Generate
              </button>
            </div>
            {insight ? (
              <p className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap bg-[#09090B] p-4 rounded-xl border border-[#27272A] flex-1">{insight}</p>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#09090B] rounded-xl border border-[#27272A]">
                <p className="text-xs text-[#52525B] italic">Click generate for AI feedback.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#121214] p-5 rounded-3xl border border-[#27272A]">
          <h3 className="text-sm font-medium mb-4 text-white">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.map(w => (
              <div key={w.id} className="flex justify-between items-center bg-[#09090B] p-3 rounded-2xl border border-[#27272A] group hover:border-[#3F3F46] transition-colors">
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="bg-[#1A1A1E] p-2 rounded-lg mt-0.5 shrink-0">
                    {w.workout_type === 'Strength' && <Dumbbell className="w-3.5 h-3.5 text-blue-500" />}
                    {w.workout_type === 'Cardio' && <Activity className="w-3.5 h-3.5 text-emerald-500" />}
                    {w.workout_type === 'Flexibility' && <Bike className="w-3.5 h-3.5 text-purple-500" />}
                  </div>
                  <div className="truncate">
                    <h4 className="font-medium text-xs capitalize text-[#EDEDED] truncate">{w.exercise_name}</h4>
                    <p className="text-[10px] text-[#52525B] capitalize truncate mt-0.5">
                      {Object.entries(w.details).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button onClick={() => handleCopy(w)} className="p-1.5 text-[#A1A1AA] hover:text-blue-500 bg-[#1A1A1E] rounded-md transition-colors" title="Copy">
                    <Copy className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 text-[#A1A1AA] hover:text-red-500 bg-[#1A1A1E] rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {workouts.length === 0 && <p className="text-[#52525B] text-xs py-4">No recent workouts.</p>}
          </div>
        </div>

      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#121214] rounded-[28px] p-6 max-w-sm w-full shadow-2xl border border-[#27272A]">
            <h2 className="text-lg font-semibold mb-5 text-white text-center">Log {selectedType}</h2>
            
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Exercise Name</label>
                <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} required placeholder="e.g. Bench Press" className="w-full p-3 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-[#52525B]" />
              </div>

              {selectedType === 'Strength' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Sets</label>
                    <input type="number" value={details.sets} onChange={e => setDetails({...details, sets: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Reps</label>
                    <input type="number" value={details.reps} onChange={e => setDetails({...details, reps: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Weight</label>
                    <input type="number" step="0.1" value={details.weight} onChange={e => setDetails({...details, weight: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                </div>
              )}

              {selectedType === 'Cardio' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Distance (mi)</label>
                    <input type="number" step="0.1" value={details.distance} onChange={e => setDetails({...details, distance: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Time (min)</label>
                    <input type="number" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  </div>
                </div>
              )}

              {selectedType === 'Flexibility' && (
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Duration (min)</label>
                  <input type="number" value={details.duration} onChange={e => setDetails({...details, duration: e.target.value})} required className="w-full p-2.5 text-sm bg-[#09090B] border border-[#27272A] text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-[#1A1A1E] text-[#EDEDED] text-sm font-medium rounded-xl hover:bg-[#27272A] transition border border-[#27272A]">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}