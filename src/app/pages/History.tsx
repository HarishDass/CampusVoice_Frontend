import { motion } from "motion/react";
import { Sidebar } from "../components/Sidebar";
import { GlassCard } from "../components/GlassCard";
import { CheckCircle2, XCircle, Clock, Calendar, MapPin, Filter, Search, Download } from "lucide-react";
import { useState } from "react";

export default function History() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allGrievances = [
    {
      id: "GRV45231",
      title: "Water Leakage on Main Street",
      status: "In Progress",
      category: "Water",
      location: "Main Street, Sector 21",
      submittedDate: "Feb 10, 2026",
      resolvedDate: null,
      priority: "High",
      resolution: null
    },
    {
      id: "GRV45189",
      title: "Street Light Not Working",
      status: "Pending",
      category: "Electricity",
      location: "Park Avenue, Block C",
      submittedDate: "Feb 9, 2026",
      resolvedDate: null,
      priority: "Medium",
      resolution: null
    },
    {
      id: "GRV44987",
      title: "Road Repair Needed",
      status: "Resolved",
      category: "Roads",
      location: "Highway 5, Junction 12",
      submittedDate: "Feb 5, 2026",
      resolvedDate: "Feb 8, 2026",
      priority: "High",
      resolution: "Pothole filled and road resurfaced. Quality inspection completed."
    },
    {
      id: "GRV44856",
      title: "Garbage Collection Missed",
      status: "Resolved",
      category: "Sanitation",
      location: "Green Valley, Sector 15",
      submittedDate: "Feb 3, 2026",
      resolvedDate: "Feb 4, 2026",
      priority: "Medium",
      resolution: "Extra collection scheduled. Area cleaned and sanitized."
    },
    {
      id: "GRV44723",
      title: "Water Supply Disruption",
      status: "Resolved",
      category: "Water",
      location: "Sunset Boulevard, Zone 8",
      submittedDate: "Jan 28, 2026",
      resolvedDate: "Jan 30, 2026",
      priority: "High",
      resolution: "Pipeline leak repaired. Water supply restored to normal."
    },
    {
      id: "GRV44612",
      title: "Broken Traffic Signal",
      status: "Closed",
      category: "Roads",
      location: "Main Intersection, Downtown",
      submittedDate: "Jan 25, 2026",
      resolvedDate: "Jan 26, 2026",
      priority: "High",
      resolution: "Signal controller replaced. System tested and operational."
    },
  ];

  const filteredGrievances = allGrievances.filter(g => {
    const matchesStatus = filterStatus === "all" || g.status === filterStatus;
    const matchesCategory = filterCategory === "all" || g.category === filterCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         g.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "#10b981";
      case "Closed": return "#10b981";
      case "In Progress": return "#3b82f6";
      case "Pending": return "#f59e0b";
      default: return "#ffffff";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": return CheckCircle2;
      case "Closed": return CheckCircle2;
      case "In Progress": return Clock;
      case "Pending": return Clock;
      default: return XCircle;
    }
  };

  const stats = {
    total: allGrievances.length,
    resolved: allGrievances.filter(g => g.status === "Resolved" || g.status === "Closed").length,
    active: allGrievances.filter(g => g.status === "In Progress" || g.status === "Pending").length,
  };

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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">
                Grievance History
              </h1>
              <p className="text-slate-400">Complete record of all your submitted grievances</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export Report
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Total Grievances</p>
                  <p className="text-4xl font-bold text-white">{stats.total}</p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Resolved</p>
                  <p className="text-4xl font-bold text-green-400">{stats.resolved}</p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Success Rate</p>
                  <p className="text-4xl font-bold text-blue-400">
                    {Math.round((stats.resolved / stats.total) * 100)}%
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <GlassCard>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by ID or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="Water">Water</option>
                  <option value="Roads">Roads</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Sanitation">Sanitation</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="Resolved">Resolved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </GlassCard>
          </motion.div>

          {/* History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">ID</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Title</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Category</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Location</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Submitted</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrievances.map((grievance, index) => {
                      const StatusIcon = getStatusIcon(grievance.status);
                      const statusColor = getStatusColor(grievance.status);

                      return (
                        <motion.tr
                          key={grievance.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-4">
                            <span className="font-mono text-blue-400 text-sm">{grievance.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-white font-medium">{grievance.title}</p>
                              {grievance.resolution && (
                                <p className="text-slate-400 text-sm mt-1">{grievance.resolution}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
                              {grievance.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <MapPin size={14} />
                              <span>{grievance.location}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span 
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                              style={{ 
                                background: `${statusColor}20`, 
                                color: statusColor,
                                border: `1px solid ${statusColor}40`
                              }}
                            >
                              <StatusIcon size={14} />
                              {grievance.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <Calendar size={14} />
                              <span>{grievance.submittedDate}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-400 text-sm">
                              {grievance.resolvedDate || "-"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
