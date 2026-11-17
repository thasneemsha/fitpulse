import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Dumbbell, Bike, HeartPulse, Plus, LogOut, Flame, Trash2, Copy, CheckCircle2, Circle } from 'lucide-react';
import api from '../api/axios';


// --- HELPER: Calculate Calories based on workout type ---
const calculateCalories = (workout) => {
  if (workout.workout_type === 'Cardio') {
    return (parseFloat(workout.details.time) || 0) * 10;
  } else if (workout.workout_type === 'Strength') {
    return (parseFloat(workout.details.sets) || 0) * (parseFloat(workout.details.reps) || 0) * (parseFloat(workout.details.weight) || 0) * 0.05;
  } else {
    return (parseFloat(workout.details.duration) || 0) * 3;
  }
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
    <div className="bg-[#151C2C] p-5 rounded-2xl shadow-sm border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Consistency Map</h3>
          <p className="text-xs text-gray-400 mt-1">Activity over the last 90 days.</p>
        </div>
      </div>
     
      <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-2">
        {days.map((date, index) => {
          const workedOut = hasWorkoutOnDate(date);
          return (
            <div
              key={index}
              title={date.toDateString()}
              className={`w-3.5 h-3.5 rounded-sm ${workedOut ? 'bg-emerald-500' : 'bg-gray-800'} hover:ring-1 hover:ring-gray-400 cursor-pointer`}
            />
          );
        })}
      </div>
     
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
}


// --- COMPONENT: Weekly Calendar ---
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
    <div className="bg-[#151C2C] p-5 rounded-2xl shadow-sm border border-gray-800">
      <h3 className="text-lg font-semibold mb-6 text-gray-100">This Week</h3>
      <div className="flex justify-between items-center px-2">
        {daysOfWeek.map((day, index) => {
          const workedOut = hasWorkoutOnDay(index);
          const isToday = today.getDay() === index;
          return (
            <div key={day} className="flex flex-col items-center gap-3">
              <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-gray-500'}`}>
                {day}
              </span>
              {workedOut ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-gray-700" />}
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
    if (!window.confirm("Are you sure you want to delete this workout?")) return;
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
      if (d >= weekStart && d < weekEnd) {
        uniqueDays.add(d.toDateString());
      }
    });
   
    weeklyConsistencyData.push({
      name: i === 0 ? 'This Week' : `${i} Wk Ago`,
      days: uniqueDays.size
    });
  }


  if (loading) return <div className="min-h-screen bg-[#0B0F19] text-white flex justify-center items-center text-lg font-medium">Loading...</div>;


  return (
    <div className="min-h-screen w-screen bg-[#0B0F19] p-4 md:p-6 font-sans text-gray-200 overflow-x-hidden">
     
      {/* Navbar */}
      <div className="w-full flex justify-between items-center mb-6 bg-[#151C2C] px-6 py-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-wide">FitPulse</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>


      <div className="w-full flex flex-col lg:flex-row gap-6">
       
        {/* Left Side */}
        <div className="flex-1 space-y-6">
         
          {/* Top Banner with Calories */}
          <div className="bg-gradient-to-r from-[#1A233A] to-[#12182B] text-white p-6 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome Back! </h2>
              <p className="text-sm text-gray-400 mb-4">Ready to crush your fitness goals today?</p>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-500 transition text-sm">
                <Plus className="w-4 h-4" /> Log Workout
              </button>
            </div>
           
            {/* Calories Stat Card */}
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 text-center min-w-[140px]">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Calories</p>
              <p className="text-2xl font-bold text-white mt-1">{Math.round(totalCalories)}</p>
            </div>
          </div>


          <Heatmap workouts={workouts} />
          <WeeklyCalendar workouts={workouts} />


          {/* Two Charts Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            {/* Consistency Line Chart */}
            <div className="bg-[#151C2C] p-5 rounded-2xl border border-gray-800">
              <h3 className="text-md font-semibold mb-4 text-gray-100">Consistency</h3>
              <p className="text-xs text-gray-500 mb-4">Days worked out per week</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyConsistencyData}>
                    <XAxis dataKey="name" stroke="#4b5563" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis stroke="#4b5563" axisLine={false} tickLine={false} domain={[0, 7]} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px'}} />
                    <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Activity Breakdown Donut Chart */}
            <div className="bg-[#151C2C] p-5 rounded-2xl border border-gray-800 flex flex-col">
              <h3 className="text-md font-semibold mb-2 text-gray-100">Breakdown</h3>
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                {breakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} stroke="none">
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-sm">No data yet</p>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
                {breakdownData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>


          </div>


          {/* AI Insight */}
          <div className="bg-[#151C2C] p-5 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
                <Flame className="w-5 h-5 text-orange-500" /> AI Coach
              </h3>
              <button onClick={handleGetInsight} className="text-xs bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-semibold hover:bg-blue-600/30 transition">
                Analyze
              </button>
            </div>
            {insight ? (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#0B0F19] p-4 rounded-xl border border-gray-800">{insight}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">Click analyze to get personalized AI feedback on your recent workouts.</p>
            )}
          </div>
        </div>


        {/* Right Side */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-[#151C2C] p-5 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Quick Start</h3>
            <div className="space-y-2">
              <button onClick={() => { handleTypeChange('Strength'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#0B0F19] rounded-xl hover:bg-gray-800 transition border border-gray-800">
                <div className="bg-blue-500/10 p-2 rounded-lg"><Dumbbell className="w-4 h-4 text-blue-400" /></div>
                <span className="text-sm font-medium text-gray-200">Strength Training</span>
              </button>
              <button onClick={() => { handleTypeChange('Cardio'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#0B0F19] rounded-xl hover:bg-gray-800 transition border border-gray-800">
                <div className="bg-emerald-500/10 p-2 rounded-lg"><Activity className="w-4 h-4 text-emerald-400" /></div>
                <span className="text-sm font-medium text-gray-200">Cardio / Running</span>
              </button>
              <button onClick={() => { handleTypeChange('Flexibility'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 p-3 bg-[#0B0F19] rounded-xl hover:bg-gray-800 transition border border-gray-800">
                <div className="bg-purple-500/10 p-2 rounded-lg"><Bike className="w-4 h-4 text-purple-400" /></div>
                <span className="text-sm font-medium text-gray-200">Flexibility / Yoga</span>
              </button>
            </div>
          </div>


          <div className="bg-[#151C2C] p-5 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Recent Activity</h3>
            <div className="space-y-2">
              {workouts.map(w => (
                <div key={w.id} className="flex justify-between items-center bg-[#0B0F19] p-3 rounded-xl border border-gray-800 group">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="bg-gray-800/50 p-1.5 rounded-md mt-0.5 shrink-0">
                      {w.workout_type === 'Strength' && <Dumbbell className="w-3.5 h-3.5 text-blue-400" />}
                      {w.workout_type === 'Cardio' && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
                      {w.workout_type === 'Flexibility' && <Bike className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-xs capitalize text-gray-200 truncate">{w.exercise_name}</h4>
                      <p className="text-[10px] text-gray-500 capitalize truncate mt-0.5">
                        {Object.entries(w.details).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <button onClick={() => handleCopy(w)} className="p-1.5 text-gray-400 hover:text-blue-400 bg-gray-800 rounded-md" title="Copy Workout">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800 rounded-md" title="Delete Workout">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {workouts.length === 0 && <p className="text-gray-600 text-xs text-center">No recent workouts.</p>}
            </div>
          </div>
        </div>
      </div>


      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#151C2C] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-800">
            <h2 className="text-lg font-bold mb-5 text-white">Log {selectedType} Workout</h2>
           
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Exercise Name</label>
                <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} required placeholder={selectedType === 'Strength' ? 'e.g. Bench Press' : 'e.g. Treadmill Run'} className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>


              {selectedType === 'Strength' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Sets</label>
                    <input type="number" value={details.sets} onChange={e => setDetails({...details, sets: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Reps</label>
                    <input type="number" value={details.reps} onChange={e => setDetails({...details, reps: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Weight</label>
                    <input type="number" step="0.1" value={details.weight} onChange={e => setDetails({...details, weight: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}


              {selectedType === 'Cardio' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Distance (mi)</label>
                    <input type="number" step="0.1" value={details.distance} onChange={e => setDetails({...details, distance: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Time (min)</label>
                    <input type="number" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}


              {selectedType === 'Flexibility' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Duration (min)</label>
                  <input type="number" value={details.duration} onChange={e => setDetails({...details, duration: e.target.value})} required className="w-full p-2.5 text-sm bg-[#0B0F19] border border-gray-800 text-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              )}


              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition shadow-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

