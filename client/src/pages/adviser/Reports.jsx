import { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Printer, 
  Search, 
  FileText as FileTextIcon, 
  Loader2, 
  ChevronDown,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { activityService } from '../../services/activityService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';

export const Reports = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    course: 'ALL',
    year: 'ALL',
  });
  const componentRef = useRef();

  useEffect(() => {
    fetchActivities();
    fetchStudents();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data.map(a => ({ id: a._id, name: a.name, date: a.date })));
      if (data.length > 0) {
        setSelectedActivity(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedActivity) {
      Swal.fire({
        icon: 'warning',
        title: 'No Activity Selected',
        text: 'Please select an activity first',
        confirmButtonColor: '#16a34a',
      });
      return;
    }

    setLoading(true);
    try {
      const attendance = await attendanceService.getAttendanceByActivity(selectedActivity);
      
      // Map attendance with student details
      const mappedData = attendance.map(record => {
        const student = students.find(s => s.studentId === record.studentId);
        return {
          id: record._id,
          student: {
            name: student?.name || 'Unknown',
            idNumber: student?.studentId || 'N/A',
            course: student?.course || 'N/A',
            yearLevel: student?.year || 'N/A',
            photo: student?.photo || null,
          },
          session: record.period,
          status: record.status,
          timestamp: record.timestamp,
        };
      });

      // Apply filters
      let filtered = mappedData;
      if (filters.course !== 'ALL') {
        filtered = filtered.filter(d => d.student.course === filters.course);
      }
      if (filters.year !== 'ALL') {
        filtered = filtered.filter(d => d.student.yearLevel === filters.year);
      }

      setAttendanceData(filtered);
      
      if (filtered.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Records Found',
          text: 'No attendance records match the selected filters',
          confirmButtonColor: '#16a34a',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate report',
        confirmButtonColor: '#16a34a',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Attendance_Report_${new Date().toISOString().split('T')[0]}`,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present':
        return 'bg-green-100 text-green-700';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700';
      case 'Absent':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get unique courses from students
  const uniqueCourses = [...new Set(students.map(s => s.course))].filter(Boolean);

  const navItems = [
    { path: '/adviser/overview', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/adviser/students', label: 'Manage Students', icon: UserCog },
    { path: '/adviser/activities', label: 'Activities', icon: CalendarDays },
    { path: '/adviser/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/adviser/fines', label: 'Fines', icon: PesoIcon },
    { path: '/adviser/reports', label: 'Reports', icon: FileText },
    { path: '/adviser/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 text-sm">Generate, filter, and print activity attendance summaries.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={generateReport}
              disabled={loading || !selectedActivity}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Generate
            </button>
            <button 
              disabled={attendanceData.length === 0}
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Printer className="w-5 h-5" /> Print Report
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase">Select Activity</label>
            <div className="relative">
              <select 
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {activities.length === 0 ? (
                  <option value="">No activities available</option>
                ) : (
                  activities.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatDate(a.date)})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase">Course Filter</label>
            <select 
              value={filters.course}
              onChange={(e) => setFilters({...filters, course: e.target.value})}
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase">Year Level</label>
            <select 
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[400px]">
          {attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-400">No Data to Display</h3>
                <p className="text-slate-400 text-sm max-w-xs">Select an activity and click "Generate" to view the attendance report summary here.</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" /> Report Preview
                </h3>
                <span className="text-sm font-medium text-slate-400 uppercase">
                  {attendanceData.length} records found
                </span>
              </div>

              {/* Printable Area */}
              <div ref={componentRef} className="printable-report bg-white">
                {/* Report Header for Print */}
                <div className="hidden print:block mb-12 text-center space-y-2">
                  <h1 className="text-3xl font-black uppercase tracking-tighter">AFM System Attendance Report</h1>
                  <p className="text-slate-500 font-bold">
                    {activities.find(a => a.id === selectedActivity)?.name} Summary
                  </p>
                  <div className="text-sm text-slate-400">
                    Report Generated on {new Date().toLocaleString()}
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">Photo</th>
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">Student Name</th>
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">ID Number</th>
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">Course/Year</th>
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">Session & Status</th>
                      <th className="p-3 border border-slate-200 text-xs font-medium uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 border border-slate-200">
                          {row.student.photo ? (
                            <img src={row.student.photo} alt={row.student.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center font-semibold text-xs text-slate-600">
                              {row.student.name?.substring(0, 1).toUpperCase() || '?'}
                            </div>
                          )}
                        </td>
                        <td className="p-3 border border-slate-200 font-medium text-sm">{row.student.name}</td>
                        <td className="p-3 border border-slate-200 font-mono text-xs">{row.student.idNumber}</td>
                        <td className="p-3 border border-slate-200 text-sm">
                          {row.student.course} - {row.student.yearLevel}
                        </td>
                        <td className="p-3 border border-slate-200">
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium uppercase">
                              {row.session}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(row.status)}`}>
                              {row.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 border border-slate-200 text-sm text-slate-500">
                          {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Report Footer for Print */}
                <div className="hidden print:flex justify-between mt-20 pt-8 border-t border-slate-200">
                  <div className="text-center">
                    <div className="w-48 border-b border-black mx-auto mb-2"></div>
                    <div className="text-xs font-bold uppercase">Prepared By</div>
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b border-black mx-auto mb-2"></div>
                    <div className="text-xs font-bold uppercase">Approved By</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
