import { useState, useEffect, useContext } from 'react';
import { Users, Activity, AlertCircle, TrendingUp, Calendar, CheckCircle, AlertTriangle, LayoutDashboard, UserCog, CalendarDays, ClipboardCheck, FileText, ActivitySquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { AuthContext } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { activityService } from '../../services/activityService';
import { fineService } from '../../services/fineService';
import { attendanceService } from '../../services/attendanceService';
import { cn } from '../../lib/utils';

export const AdviserOverview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeActivities: 0,
    totalFines: 0,
    unpaidFines: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsData, activities, fines, attendance] = await Promise.all([
          studentService.getAllStudents(),
          activityService.getAllActivities(),
          fineService.getAllFines(),
          attendanceService.getAllAttendance(),
        ]);

        const activeActivitiesList = activities.filter((a) => a.isActive);
        const unpaidFines = fines.filter((f) => !f.isPaid).length;

        setStats({
          totalStudents: studentsData.length,
          activeActivities: activeActivitiesList.length,
          totalFines: fines.length,
          unpaidFines,
        });

        setStudents(studentsData);
        
        // Set the first active activity
        if (activeActivitiesList.length > 0) {
          setActiveActivity(activeActivitiesList[0]);
        }

        // Get recent 4 attendance records
        const sortedAttendance = attendance
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 4);
        
        setRecentAttendance(sortedAttendance);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navItems = [
    { path: '/adviser/overview', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/adviser/students', label: 'Manage Students', icon: UserCog },
    { path: '/adviser/activities', label: 'Activities', icon: CalendarDays },
    { path: '/adviser/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/adviser/fines', label: 'Fines', icon: PesoIcon },
    { path: '/adviser/reports', label: 'Reports', icon: FileText },
    { path: '/adviser/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Total Activities', value: stats.activeActivities, icon: Calendar, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Present Today', value: stats.presentToday || 0, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Unpaid Fines', value: stats.unpaidFines, icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/5' },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 lg:space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-500 text-sm">Monitoring activity across the organization</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.map((card, i) => (
            <div
              key={card.label}
              className="bg-white p-4 lg:p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-3 lg:mb-4", card.bg)}>
                <card.icon className={cn("w-5 h-5 lg:w-6 lg:h-6", card.color)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">{card.label}</div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900">{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent Attendance */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-slate-900">Recent Attendance</h3>
                <p className="text-xs lg:text-sm text-slate-500 mt-0.5">Latest attendance records</p>
              </div>
            </div>
            
            <div className="space-y-2 lg:space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Loading...
                </div>
              ) : recentAttendance.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No attendance records yet
                </div>
              ) : (
                recentAttendance.map((record, i) => {
                  const student = students.find(s => s.studentId === record.studentId);
                  const studentName = student?.name || `Student ${record.studentId}`;
                  const timestamp = new Date(record.timestamp);
                  const timeStr = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={record._id || i} 
                      className="flex items-center justify-between p-3 lg:p-4 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs lg:text-sm font-semibold shrink-0">
                          {student?.name?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 text-sm truncate">{studentName}</div>
                          <div className="text-xs text-slate-500 truncate">{student?.course || 'N/A'} • {timeStr}</div>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 lg:px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ml-2",
                        record.status === 'Present' ? "bg-green-50 text-green-700" :
                        record.status === 'Late' ? "bg-yellow-50 text-yellow-700" :
                        "bg-red-50 text-red-700"
                      )}>
                        <span className="hidden sm:inline">{record.period} </span>{record.status}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Session */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4 lg:mb-6">Active Session</h3>
            
            <div className="space-y-4 lg:space-y-6">
              {activeActivity ? (
                <div className="space-y-4">
                  <div className="p-4 lg:p-5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-primary uppercase">Current Session</span>
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 mb-2 text-sm lg:text-base">
                      {activeActivity.name}
                    </div>
                    <div className="text-xs text-slate-500 mb-4">
                      {new Date(activeActivity.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Activity Period Info */}
                    <div className="space-y-2 pt-3 border-t border-primary/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Period:</span>
                        <span className="font-semibold text-slate-900 uppercase">{activeActivity.period}</span>
                      </div>
                      
                      {activeActivity.period === 'Full Day' || activeActivity.period === 'AM Only' ? (
                        <div className="bg-white/50 p-2 rounded-md">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">AM Session</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Time In:</span>
                              <div className="font-semibold text-slate-900">
                                {activeActivity.amTimeInStart} - {activeActivity.amTimeInCutoff}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Time Out:</span>
                              <div className="font-semibold text-slate-900">
                                {activeActivity.amTimeOutStart} - {activeActivity.amTimeOutCutoff}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      
                      {activeActivity.period === 'Full Day' || activeActivity.period === 'PM Only' ? (
                        <div className="bg-white/50 p-2 rounded-md">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">PM Session</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Time In:</span>
                              <div className="font-semibold text-slate-900">
                                {activeActivity.pmTimeInStart} - {activeActivity.pmTimeInCutoff}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Time Out:</span>
                              <div className="font-semibold text-slate-900">
                                {activeActivity.pmTimeOutStart} - {activeActivity.pmTimeOutCutoff}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No active session</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdviserOverview;
