import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import { User, Mail, Phone, MapPin, Bell, Shield, Eye, Save, Camera } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    updates: true,
  });

  return (
    <div className="min-h-screen">
      <Sidebar role="citizen" />
      
      <div className="ml-64 min-h-screen bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        {/* Background */}
        <div 
          className="fixed inset-0 ml-64 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 text-white">
              Settings
            </h1>
            <p className="text-slate-400">Manage your account and preferences</p>
          </motion.div>

          <div className="max-w-4xl space-y-6">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
                  <Shield className="text-blue-400" size={24} />
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-700">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User size={40} className="text-white" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera size={14} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">John Citizen</h3>
                    <p className="text-slate-400 mb-2">Member since Jan 2026</p>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      Change Profile Picture
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="text"
                          defaultValue="John Citizen"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="tel"
                          defaultValue="+1 234 567 8900"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="email"
                        defaultValue="john.citizen@email.com"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                      <textarea
                        defaultValue="123 Main Street, Sector 21, City Name"
                        rows={3}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save size={18} />
                    Save Changes
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Notification Preferences</h2>
                  <Bell className="text-amber-400" size={24} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium mb-1">Email Notifications</h3>
                      <p className="text-slate-400 text-sm">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium mb-1">SMS Notifications</h3>
                      <p className="text-slate-400 text-sm">Receive text message alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium mb-1">Push Notifications</h3>
                      <p className="text-slate-400 text-sm">Receive browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium mb-1">Status Updates</h3>
                      <p className="text-slate-400 text-sm">Get notified when grievance status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.updates}
                        onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Security</h2>
                  <Eye className="text-green-400" size={24} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Update Password
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
