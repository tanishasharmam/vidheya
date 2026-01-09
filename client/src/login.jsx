import { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Layout, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login/Register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState(""); // Only for registration
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = isRegistering ? "/register" : "/login";
        const payload = isRegistering ? { name, email, password } : { email, password };

        try {
            const res = await axios.post(API_BASE + endpoint, payload);

            // Save Token to LocalStorage (So you stay logged in)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success(isRegistering ? "Account created!" : "Welcome back!");
            onLogin(); // Navigate to Dashboard

        } catch (err) {
            toast.error(err.response?.data?.error || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 flex justify-center items-center overflow-hidden font-sans">

            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[90px] opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[90px] opacity-50 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md p-4"
            >
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl p-8">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
                            <Layout size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                            {isRegistering ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isRegistering ? "Join us to manage your tasks" : "Please sign in to continue"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name Field (Only for Register) */}
                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text" required={isRegistering}
                                        className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="John Doe"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email" required
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="you@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password" required
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-300 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    {isRegistering ? "Sign Up" : "Sign In"} <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            {isRegistering ? "Already have an account?" : "Don't have an account?"}{' '}
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                {isRegistering ? "Login here" : "Create Account"}
                            </button>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default Login;