import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Scan, 
  QrCode,
  Activity,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { activityService } from '../../services/activityService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { cn } from '../../lib/utils';

export const OfficerOverview = () => {
  const [stats, setStats] = useState({
    totalContribution: 0,
    successfulScans: 0,
    currentTimeline: 'AM IN',
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activities, attendance, students] = await Promise.all([
          activityService.getAllActivities(),
          attendanceService.getAllAttendance(),
          studentService.getAllStudents(),
        ]);

        const activeActivities = activities.filter((a) => a.isActive).length;
        
        // Get current time period
        const currentHour = new Date().getHours();
        const currentPeriod = currentHour < 12 ? 'AM IN' : 'PM IN';

        // Get recent scans (last 5)
        const sortedAttendance = attendance
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
          .map((record, index) => ({
            id: record._id || index,
            studentId: record.studentId,
            session: `${record.period} ${record.status}`,
            timestamp: record.timestamp,
          }));

        setStats({
          totalContribution: students.length,
          successfulScans: attendance.filter(a => a.status === 'Present').length,
          currentTimeline: currentPeriod,
        });
        
        setRecentScans(sortedAttendance);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/officer/scanner', label: 'Scanner', icon: Scan },
    { path: '/officer/overview', label: 'Overview', icon: Activity },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Officer Dashboard</h1>
            <p className="text-slate-500 text-sm">Capture attendance with precision and speed</p>
          </div>
          <Link 
            to="/officer/scanner"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium transition-all hover:bg-primary/90 group"
          >
            <Scan className="w-5 h-5 transition-transform group-hover:rotate-90" /> 
            <span>Launch Scanner</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Contribution', val: stats.totalContribution, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Successful Scans', val: stats.successfulScans, icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Current Timeline', val: stats.currentTimeline, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-4"
            >
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase mb-0.5">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Scans</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Sync Active
              </div>
            </div>
            
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No activity yet
                </div>
              ) : (
                recentScans.map((scan) => (
                  <div 
                    key={scan.id} 
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">Student ID: {scan.studentId.substring(0, 8)}</div>
                        <div className="text-xs font-medium text-primary uppercase">{scan.session}</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 uppercase italic">Success</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scanner Best Practices */}
          <div className="bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[350px]">
            <Scan className="absolute top-0 right-0 w-64 h-64 text-white/5 -mr-16 -mt-16 rotate-12" />
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 text-white/90">Scanner Best Practices</h3>
              <ul className="space-y-4">
                {[
                  'Ensure sufficient lighting for clear QR recognition.',
                  'Wait for the success ping before scanning next student.',
                  'Verify ID mismatch errors instantly with the student.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/40 text-sm">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="relative z-10 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 font-medium transition-all text-xs uppercase active:scale-95 text-white/60">
              Technical Support
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OfficerOverview;
