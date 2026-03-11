import { requestPermission } from '@/utils/fcm';
import API from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSuccess } from '@/redux/slices/authSlice'
import { ArrowLeft, Eye, EyeOff, Shield, User, Lock, School } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { saveFcmToken } from '@/utils/saveFcmToken';

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            // Admin login API call
            const res = await API.post('/admin/auth/login', input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (res.data.success) {
                const { token, user } = res.data;
                dispatch(loginSuccess({ user, token, role: 'admin' }));

                // ✅ Request notification permission & get FCM token
                const fcmToken = await requestPermission();
                if (fcmToken) {
                    await saveFcmToken(token); // save FCM token in backend
                }

                toast.success(res.data.message);
                navigate('/admin');
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/30 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800/30 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 dark:bg-indigo-800/20 rounded-full blur-3xl opacity-30"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 max-w-md w-full border border-white/20 dark:border-gray-700/50"
            >
                {/* Back button */}
                <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer absolute left-6 top-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* Header Section */}
                <div className="text-center mb-8 pt-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                        <Shield className="w-8 h-8 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                    >
                        Admin Portal
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 dark:text-gray-400 mt-2 text-lg"
                    >
                        Welcome back to your dashboard
                    </motion.p>
                </div>

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Username Field */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Username
                        </Label>
                        <div className="relative">
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                value={input.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                className="pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                                required
                                disabled={isLoading}
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password
                            </Label>
                            <Link
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all"
                                to="/forgot-password"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={input.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="pl-11 pr-12 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                                required
                                disabled={isLoading}
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <School className="w-5 h-5" />
                                    Sign In to Dashboard
                                </div>
                            )}
                        </Button>
                    </motion.div>
                </motion.form>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50"
                >
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Secure access to your institution's management system
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">System Secure</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Encrypted</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-500/20 rounded-full"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        style={{
                            left: `${20 + i * 15}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default AdminLogin