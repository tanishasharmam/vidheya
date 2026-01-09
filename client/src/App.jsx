import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Plus, Trash2, Check, CalendarDays, Trophy, Search, X, Loader2,
  Github, Linkedin, Twitter, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Login from './login'; // Make sure Login.jsx exists in the same folder

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- 1. THE TO-DO DASHBOARD COMPONENT (Your main app logic) ---
function TodoApp({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [popupActive, setPopupActive] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // Configure global token for all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    }
  }, []);

  useEffect(() => {
    GetTodos();
  }, []);

  const GetTodos = async () => {
    try {
      const res = await axios.get(API_BASE + "/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Error: ", err);
      toast.error("Could not load tasks");
    } finally {
      setIsLoading(false);
    }
  }

  const completeTodo = async (id) => {
    setTodos(prev => prev.map(todo => {
      if (todo._id === id) return { ...todo, completed: !todo.completed };
      return todo;
    }));
    try { await axios.put(API_BASE + "/todos/" + id); }
    catch (err) { toast.error("Failed to update task"); }
  }

  const deleteTodo = async (id) => {
    const backupTodos = [...todos];
    setTodos(prev => prev.filter(todo => todo._id !== id));
    try {
      await axios.delete(API_BASE + "/todos/" + id);
      toast.success("Task deleted");
    } catch (err) {
      setTodos(backupTodos);
      toast.error("Could not delete task");
    }
  }

  const addTodo = async () => {
    if (newTodo.trim() === "") return toast.error("Please enter a task");
    if (isAdding) return;
    setIsAdding(true);
    try {
      const data = await axios.post(API_BASE + "/todos", { text: newTodo });
      setTodos(prev => [data.data, ...prev]);
      setPopupActive(false);
      setNewTodo("");
      toast.success("New task added!");
    } catch (err) { toast.error("Failed to create task"); }
    finally { setIsAdding(false); }
  }

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = filter === "all" ? true : filter === "completed" ? todo.completed : !todo.completed;
    const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[90px] opacity-50 animate-blob z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[90px] opacity-50 animate-blob animation-delay-2000 z-0"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Layout className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">TaskMaster</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center pt-24 pb-12 px-4 z-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-xl overflow-hidden ring-1 ring-black/5">
            {/* Header */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tasks</h1>
                  <div className="flex items-center text-slate-500 mt-1 font-medium text-sm">
                    <CalendarDays size={16} className="mr-2 text-indigo-500" />
                    <p>{dateString}</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-center w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-gray-200" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * progress) / 100} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-xs font-bold text-indigo-800">{progress}%</span>
                </div>
              </div>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <div className="relative flex-1 group">
                  <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="text" placeholder="Search tasks..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm" onChange={(e) => setSearch(e.target.value)} value={search} />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['all', 'active', 'completed'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="bg-white/50 min-h-[400px] p-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-16 bg-gray-200/50 rounded-xl mb-3 animate-pulse" />
                  ))
                ) : filteredTodos.length > 0 ? (
                  filteredTodos.map(todo => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} key={todo._id} className={`group flex items-center justify-between p-4 mb-3 rounded-xl transition-all border select-none ${todo.completed ? "bg-indigo-50/50 border-indigo-100" : "bg-white border-transparent shadow-sm hover:border-indigo-100 hover:shadow-md"}`}>
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => completeTodo(todo._id)}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${todo.completed ? "bg-indigo-500 border-indigo-500 scale-110" : "border-gray-300 group-hover:border-indigo-400"}`}>
                          {todo.completed && <Check size={14} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[15px] font-medium transition-all duration-300 ${todo.completed ? "text-gray-400 line-through decoration-gray-300" : "text-slate-700"}`}>{todo.text}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo._id); }} className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50"><Trash2 size={18} /></button>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
                    <Trophy size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No tasks found</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white/80 border-t border-white/50 backdrop-blur-md">
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-md shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={() => setPopupActive(true)}>
                <Plus size={20} /> Create New Task
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/40 backdrop-blur-md border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left"><h3 className="font-bold text-gray-700">TaskMaster</h3><p className="text-xs text-gray-500 mt-1">© 2026 Madhur Gupta. All rights reserved.</p></div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md"><Github size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {popupActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPopupActive(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800">Add Task</h3><button onClick={() => setPopupActive(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button></div>
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white p-4 rounded-xl text-lg outline-none transition-all placeholder-gray-400 mb-6" placeholder="e.g., Buy groceries..." onChange={e => setNewTodo(e.target.value)} value={newTodo} onKeyDown={e => e.key === 'Enter' && addTodo()} autoFocus disabled={isAdding} />
                <button className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" onClick={addTodo} disabled={isAdding}>{isAdding ? <Loader2 className="animate-spin" size={20} /> : "Save Task"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 2. MAIN ROUTING LOGIC (The part you asked about) ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  return (
    <Router>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <TodoApp onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;