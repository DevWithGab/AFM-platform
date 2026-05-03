import { useState, useEffect } from 'react';
import { 
  Activity,
  Calendar,
  UserPlus,
  Trash2,
  CheckCircle,
  Filter,
  Loader2,
  Clock,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { logService } from '../../services/logService';

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await logService.getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action) => {
    const configs = {
      activity_created: {
        label: 'Activity Created',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Calendar,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      activity_deleted: {
        label: 'Activity Deleted',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: Trash2,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600'
      },
      attendance_recorded: {
        label: 'Attendance Recorded',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600'
      },
      attendance_in: {
        label: 'Check-In',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        icon: CheckCircle,
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600'
      },
      attendance_out: {
        label: 'Check-Out',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: CheckCircle,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      },
      student_registered: {
        label: 'Student Registered',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: UserPlus,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
    };
    return configs[action] || {
      label: action,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Activity,
      iconBg: 'bg-slate-50',
      iconColor: 'text-slate-600'
    };
  };

  const getStatusConfig = (status) => {
    const configs = {
      success: {
        label: 'Success',
        color: 'bg-green-100 text-green-700 border-green-200',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        dotColor: 'bg-green-500'
      },
      failed: {
        label: 'Failed',
        color: 'bg-red-100 text-red-700 border-red-200',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        dotColor: 'bg-red-500'
      },
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        dotColor: 'bg-yellow-500'
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter((log) => log.action === filter);

  const navItems = [
    { path: '/adviser/overview', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/adviser/students', label: 'Manage Students', icon: UserCog },
    { path: '/adviser/activities', label: 'Activities', icon: CalendarDays },
    { path: '/adviser/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/adviser/fines', label: 'Fines', icon: PesoIcon },
    { path: '/adviser/reports', label: 'Reports', icon: FileText },
    { path: '/adviser/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Logs</h1>
            <p className="text-slate-500 text-sm">Track all system activities and changes.</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Actions</option>
              <option value="activity_created">Activity Created</option>
              <option value="activity_deleted">Activity Deleted</option>
              <option value="attendance_recorded">Attendance Recorded</option>
              <option value="attendance_in">Check-In</option>
              <option value="attendance_out">Check-Out</option>
              <option value="student_registered">Student Registered</option>
            </select>
            <div className="text-sm font-medium text-slate-400">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg border border-slate-200 p-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-slate-500 font-medium">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400">No Logs Found</h3>
              <p className="text-slate-400 mt-2 text-sm">No activity logs match the selected filter.</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const config = getActionConfig(log.action);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 relative ${config.iconBg}`}>
                      <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      {log.status && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusConfig(log.status).dotColor} border-2 border-white`}></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-md text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          {log.status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusConfig(log.status).color}`}>
                              {getStatusConfig(log.status).label}
                            </span>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 font-medium mb-2">{log.description}</p>
                      
                      {log.details && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="text-xs font-medium text-slate-400 uppercase mb-1">Details</div>
                          <div className="text-sm text-slate-600">
                            {typeof log.details === 'string' ? (
                              <p>{log.details}</p>
                            ) : typeof log.details === 'object' && !Array.isArray(log.details) && Object.keys(log.details).length > 0 ? (
                              <div className="space-y-1">
                                {Object.entries(log.details).map(([key, value]) => (
                                  <div key={key} className="flex items-start gap-2">
                                    <span className="font-medium text-slate-700">{key}:</span>
                                    <span className="text-slate-600 font-mono break-all text-xs">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500 italic text-xs">No additional details</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
