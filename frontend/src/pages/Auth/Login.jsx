import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { motion } from "framer-motion";
import { Shield, Users, GraduationCap, ArrowRight, School } from "lucide-react";

const roles = [
  { 
    name: "Admin", 
    icon: <Shield className="w-8 h-8" />, 
    path: "/admin/login", 
    gradient: "from-blue-500 to-indigo-500",
    darkGradient: "from-blue-600 to-indigo-600",
    description: "Manage system and users",
    color: "blue"
  },
  { 
    name: "Teacher", 
    icon: <Users className="w-8 h-8" />, 
    path: "/teacher/login", 
     gradient: "from-red-500 to-pink-500",
    darkGradient: "from-red-600 to-pink-600",
    description: "Teach and manage classes",
    color: "red"
  },
  { 
    name: "Student", 
    icon: <GraduationCap className="w-8 h-8" />, 
    path: "/student/login", 
    gradient: "from-green-500 to-emerald-500",
    darkGradient: "from-green-600 to-emerald-600",
    description: "Learn and grow",
    color: "green"
  },
];

const LandingLoginPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 dark:bg-indigo-800/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <School className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            EduPortal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Welcome to your educational gateway. Choose your role to access the platform.
          </p>
        </motion.div>

        {/* Role Cards Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                y: -8,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative group cursor-pointer`}
              onClick={() => navigate(role.path)}
            >
              {/* Main Card */}
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center text-center">
                
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} dark:${role.darkGradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                
                {/* Icon Container */}
                <div className={`relative mb-6 p-5 rounded-2xl bg-gradient-to-br ${role.gradient} dark:${role.darkGradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <div className="text-white">
                    {role.icon}
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '20%',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {role.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1">
                  {role.description}
                </p>

                {/* Action Button */}
                <div className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-${role.color}-50 dark:bg-${role.color}-900/30 text-${role.color}-700 dark:text-${role.color}-300 font-semibold group-hover:bg-${role.color}-100 dark:group-hover:bg-${role.color}-800/40 transition-all duration-300`}>
                  <span>Continue as {role.name}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Corner Accent */}
                <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-${role.color}-500 dark:border-${role.color}-400 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-${role.color}-500 dark:border-${role.color}-400 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>

              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} dark:${role.darkGradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700/50"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Secure access to your educational platform • Built for modern learning
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-xs text-blue-600 dark:text-blue-400">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-xs text-purple-600 dark:text-purple-400">24/7 Access</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating particles in background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-500/20 rounded-full"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            style={{
              left: `${10 + i * 12}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LandingLoginPage;