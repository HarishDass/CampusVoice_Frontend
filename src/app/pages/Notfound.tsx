import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Rocket, Star, Moon } from "lucide-react";

export default function PageNotFoundCreative() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1729] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      {/* Floating planets */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-30 blur-sm"
      />

      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -360],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
        }}
        className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-20 blur-sm"
      />

      <div className="relative z-10 max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Astronaut floating */}
            <motion.div
              animate={{
                y: [0, -30, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Helmet glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-blue-400/30 rounded-full blur-3xl"
              />

              {/* Simple astronaut representation */}
              <div className="relative w-64 h-64 mx-auto">
                {/* Body */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-40 bg-gradient-to-b from-slate-100 to-slate-300 rounded-3xl relative">
                    {/* Helmet */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-400/40 to-transparent border-4 border-blue-300/50 rounded-full backdrop-blur-sm">
                      {/* Visor reflection */}
                      <div className="absolute top-2 left-2 w-8 h-8 bg-white/40 rounded-full blur-sm" />
                    </div>

                    {/* Chest panel */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-12 bg-slate-400/30 rounded-lg border-2 border-slate-400/50" />

                    {/* Arms */}
                    <div className="absolute -left-8 top-4 w-6 h-20 bg-slate-200 rounded-full rotate-45" />
                    <div className="absolute -right-8 top-4 w-6 h-20 bg-slate-200 rounded-full -rotate-45" />

                    {/* Legs */}
                    <div className="absolute -bottom-14 left-6 w-8 h-16 bg-slate-200 rounded-full" />
                    <div className="absolute -bottom-14 right-6 w-8 h-16 bg-slate-200 rounded-full" />
                  </div>
                </div>

                {/* Floating tether */}
                <motion.div
                  animate={{
                    pathLength: [0, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute top-1/2 left-full w-20 h-1 opacity-30"
                  style={{
                    background: "linear-gradient(90deg, #60a5fa 0%, transparent 100%)",
                  }}
                />
              </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 right-10"
            >
              <Star className="text-yellow-400" size={24} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
                x: [0, -15, 0],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 left-10"
            >
              <Moon className="text-slate-400" size={32} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, -25, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-32 left-0"
            >
              <Rocket className="text-orange-400" size={28} />
            </motion.div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-8xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                404
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Lost in Space
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-slate-400 text-lg mb-2"
            >
              Houston, we have a problem!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500 mb-8"
            >
              The page you're looking for has drifted off into the void. Let's
              get you back to safety.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Home size={20} />
                Return to Earth
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg font-medium flex items-center justify-center gap-2 border border-slate-700 backdrop-blur-sm transition-all"
              >
                <ArrowLeft size={20} />
                Go Back
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-slate-600 text-xs"
            >
              ERROR: PAGE_NOT_FOUND | STATUS: 404
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}