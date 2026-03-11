import { requestPermission } from '@/utils/fcm';
import API from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSuccess } from '@/redux/slices/authSlice'
import { ArrowLeft, Eye, EyeOff, User, Lock, BookOpen, Users, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { saveFcmToken } from '@/utils/saveFcmToken'

const TeacherLogin = () => {
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

            const res = await API.post('/teacher/auth/login', input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (res.data.success) {
                const { token, user } = res.data;
                dispatch(loginSuccess({ user, token, role: 'teacher' }));

                // ✅ Request notification permission & save FCM token
                const fcmToken = await requestPermission();
                if (fcmToken) {
                    await saveFcmToken(token);
                }

                toast.success(res.data.message);
                navigate('/teacher');
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-red-900/20 p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-800/30 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 dark:bg-amber-800/30 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-200 dark:bg-red-800/20 rounded-full blur-3xl opacity-30"></div>
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
                    className="cursor-pointer absolute left-6 top-6 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-xl"
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
                        className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                        <Users className="w-8 h-8 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent"
                    >
                        Teacher Portal
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 dark:text-gray-400 mt-2 text-lg"
                    >
                        Inspire minds and shape futures
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
                                className="pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
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
                                className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline transition-all"
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
                                className="pl-11 pr-12 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
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
                            className="cursor-pointer w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Access Teacher Dashboard
                                </div>
                            )}
                        </Button>
                    </motion.div>
                </motion.form>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center my-6"
                >
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                    <span className="mx-4 text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                            Contact your school administrator
                        </span>
                    </p>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Secure Educator Portal</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-orange-400/30 dark:bg-orange-500/20 rounded-full"
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

export default TeacherLogin