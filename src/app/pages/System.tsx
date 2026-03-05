import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import { Server, Database, Shield, Users, Settings as SettingsIcon, Bell, Mail, Globe, HardDrive, Activity, Cpu } from "lucide-react";
import { useState } from "react";

export default function System() {
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />
      
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
              System Configuration
            </h1>
            <p className="text-slate-400">Manage system settings and monitor infrastructure</p>
          </motion.div>

          {/* System Health */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Server Status</p>
                  <Server className="text-green-400" size={20} />
                </div>
                <p className="text-2xl font-bold text-green-400">Online</p>
                <p className="text-slate-400 text-sm mt-1">Uptime: 99.98%</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Database</p>
                  <Database className="text-blue-400" size={20} />
                </div>
                <p className="text-2xl font-bold text-blue-400">Healthy</p>
                <p className="text-slate-400 text-sm mt-1">3.2 GB used</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">CPU Usage</p>
                  <Cpu className="text-amber-400" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">42%</p>
                <p className="text-slate-400 text-sm mt-1">Normal load</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <Users className="text-purple-400" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">1,247</p>
                <p className="text-slate-400 text-sm mt-1">234 online now</p>
              </GlassCard>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* System Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="text-blue-400" size={24} />
                    <h2 className="text-xl font-semibold text-white">System Settings</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium mb-1">Auto Assignment</h3>
                        <p className="text-slate-400 text-sm">Automatically assign grievances to teams</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoAssignment}
                          onChange={(e) => setAutoAssignment(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium mb-1">Maintenance Mode</h3>
                        <p className="text-slate-400 text-sm">Temporarily disable public access</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h3 className="text-white font-medium mb-3">Priority Thresholds</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Critical Response Time</span>
                            <span className="text-white">2 hours</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="24"
                            defaultValue="2"
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">High Priority Response</span>
                            <span className="text-white">6 hours</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="48"
                            defaultValue="6"
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Notification Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="text-amber-400" size={24} />
                    <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="text-blue-400" size={20} />
                        <div>
                          <h3 className="text-white font-medium">Email Notifications</h3>
                          <p className="text-slate-400 text-sm">Send email updates to citizens</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="text-green-400" size={20} />
                        <div>
                          <h3 className="text-white font-medium">SMS Notifications</h3>
                          <p className="text-slate-400 text-sm">Send SMS alerts for critical issues</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsNotifications}
                          onChange={(e) => setSmsNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-green-400" size={24} />
                    <h2 className="text-xl font-semibold text-white">Security</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Enabled</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">Enhanced security for admin accounts</p>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Manage 2FA Settings
                      </button>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h3 className="text-white font-medium mb-3">API Keys</h3>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Production Key</span>
                          <span className="font-mono text-slate-300">sk_prod_••••••••</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Development Key</span>
                          <span className="font-mono text-slate-300">sk_dev_••••••••</span>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Regenerate Keys
                      </button>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Session Timeout</h3>
                      <p className="text-slate-400 text-sm mb-3">Auto-logout after inactivity</p>
                      <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Storage & Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <HardDrive className="text-purple-400" size={24} />
                    <h2 className="text-xl font-semibold text-white">Storage & Performance</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Database Storage</span>
                        <span className="text-white">3.2 GB / 10 GB</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '32%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">File Storage</span>
                        <span className="text-white">1.8 GB / 5 GB</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '36%' }} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h3 className="text-white font-medium mb-3">Cache Settings</h3>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Clear Cache
                        </button>
                        <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Optimize DB
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h3 className="text-white font-medium mb-3">Backup</h3>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Backup</span>
                          <span className="text-white">Today, 3:00 AM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Next Scheduled</span>
                          <span className="text-white">Tomorrow, 3:00 AM</span>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Backup Now
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-blue-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Recent System Activity</h2>
              </div>
              <div className="space-y-3">
                {[
                  { action: "Database backup completed", time: "5 minutes ago", type: "success" },
                  { action: "Security patch applied", time: "2 hours ago", type: "info" },
                  { action: "API rate limit adjusted", time: "5 hours ago", type: "warning" },
                  { action: "User permissions updated", time: "1 day ago", type: "info" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === "success" ? "bg-green-400" :
                        log.type === "warning" ? "bg-amber-400" :
                        "bg-blue-400"
                      }`} />
                      <span className="text-white">{log.action}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{log.time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
