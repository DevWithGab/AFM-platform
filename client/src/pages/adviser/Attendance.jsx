import { useState, useEffect } from 'react';
import { 
  Calendar,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare,
  ChevronDown,
  Edit,
  Trash2,
  RefreshCw,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { activityService } from '../../services/activityService';

export const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      fetchAttendanceData();
    }
  }, [selectedActivity]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsData, activitiesData] = await Promise.all([
        studentService.getAllStudents(),
        activityService.getAllActivities(),
      ]);
      
      setStudents(studentsData);
      setActivities(activitiesData);
      
      if (activitiesData.length > 0) {
        setSelectedActivity(activitiesData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const attendanceData = await attendanceService.getAttendanceByActivity(selectedActivity);
      
      const attendanceMap = {};
      attendanceData.forEach((record) => {
        if (!attendanceMap[record.studentId]) {
          attendanceMap[record.studentId] = {
            AM_IN: null,
            AM_OUT: null,
            PM_IN: null,
            PM_OUT: null
          };
        }
        
        // Map data to time in/out structure
        // Handle both new format (with timeIn/timeOut) and old format (without)
        const timeInValue = record.timeIn || record.timestamp; // Fallback to timestamp if timeIn not set
        
        if (record.period === 'AM') {
          if (timeInValue) {
            // Always keep the most recent record (by timestamp)
            if (!attendanceMap[record.studentId].AM_IN || 
                new Date(record.createdAt) > new Date(attendanceMap[record.studentId].AM_IN.createdAt)) {
              attendanceMap[record.studentId].AM_IN = {
                time: timeInValue,
                status: record.status,
                id: record._id,
                createdAt: record.createdAt
              };
            }
          }
          if (record.timeOut) {
            if (!attendanceMap[record.studentId].AM_OUT || 
                new Date(record.createdAt) > new Date(attendanceMap[record.studentId].AM_OUT.createdAt)) {
              attendanceMap[record.studentId].AM_OUT = {
                time: record.timeOut,
                id: record._id,
                createdAt: record.createdAt
              };
            }
          }
        } else if (record.period === 'PM') {
          if (timeInValue) {
            // Always keep the most recent record (by timestamp)
            if (!attendanceMap[record.studentId].PM_IN || 
                new Date(record.createdAt) > new Date(attendanceMap[record.studentId].PM_IN.createdAt)) {
              attendanceMap[record.studentId].PM_IN = {
                time: timeInValue,
                status: record.status,
                id: record._id,
                createdAt: record.createdAt
              };
            }
          }
          if (record.timeOut) {
            if (!attendanceMap[record.studentId].PM_OUT || 
                new Date(record.createdAt) > new Date(attendanceMap[record.studentId].PM_OUT.createdAt)) {
              attendanceMap[record.studentId].PM_OUT = {
                time: record.timeOut,
                id: record._id,
                createdAt: record.createdAt
              };
            }
          }
        }
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTime = async (studentId, period, timeType, currentTime) => {
    const { value: newTime } = await Swal.fire({
      title: `Edit ${period} ${timeType === 'in' ? 'Check-In' : 'Check-Out'} Time`,
      input: 'time',
      inputValue: currentTime ? new Date(currentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update',
    });

    if (newTime) {
      try {
        const recordKey = `${period}_${timeType === 'in' ? 'IN' : 'OUT'}`;
        const record = attendance[studentId]?.[recordKey];
        
        if (record?.id) {
          await attendanceService.updateAttendance(record.id, { 
            [timeType === 'in' ? 'timeIn' : 'timeOut']: new Date(`1970-01-01T${newTime}:00`) 
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            text: 'Time updated successfully',
            confirmButtonColor: '#16a34a',
          });
          
          fetchAttendanceData();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update time',
          confirmButtonColor: '#16a34a',
        });
      }
    }
  };

  const handleDeleteTime = async (studentId, period) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: `This will remove the ${period} session record`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });

    if (result.isConfirmed) {
      try {
        const amRecord = attendance[studentId]?.AM_IN?.id;
        const pmRecord = attendance[studentId]?.PM_IN?.id;
        const recordId = period === 'AM' ? amRecord : pmRecord;
        
        if (recordId) {
          await attendanceService.deleteAttendance(recordId);
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Record deleted successfully',
            confirmButtonColor: '#16a34a',
          });
          
          fetchAttendanceData();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete record',
          confirmButtonColor: '#16a34a',
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Late':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Absent':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { path: '/adviser/overview', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/adviser/students', label: 'Manage Students', icon: UserCog },
    { path: '/adviser/activities', label: 'Activities', icon: CalendarDays },
    { path: '/adviser/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/adviser/fines', label: 'Fines', icon: PesoIcon },
    { path: '/adviser/reports', label: 'Reports', icon: FileText },
    { path: '/adviser/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  // Calculate stats - considering both AM and PM sessions
  const selectedActivityObj = activities.find(a => a._id === selectedActivity);
  const isPMOnly = selectedActivityObj?.period === 'PM Only';
  const isAMOnly = selectedActivityObj?.period === 'AM Only';
  const isFullDay = selectedActivityObj?.period === 'Full Day';
  
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;

  students.forEach(student => {
    const studentAttendance = attendance[student.studentId] || {};
    
    // Count AM session
    if (!isPMOnly) {
      const amStatus = studentAttendance.AM_IN?.status;
      if (amStatus === 'Present') totalPresent++;
      else if (amStatus === 'Late') totalLate++;
      else totalAbsent++; // No record or Absent status = Absent
    }
    
    // Count PM session
    if (!isAMOnly) {
      const pmStatus = studentAttendance.PM_IN?.status;
      if (pmStatus === 'Present') totalPresent++;
      else if (pmStatus === 'Late') totalLate++;
      else totalAbsent++; // No record or Absent status = Absent
    }
  });

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Records</h1>
            <p className="text-slate-500 text-sm">View and monitor student attendance by activity.</p>
          </div>
          <button
            onClick={() => fetchAttendanceData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 lg:p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Present</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">{totalPresent}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 lg:p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Late</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">{totalLate}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 lg:p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Absent</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">{totalAbsent}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-medium text-slate-500 uppercase">Select Activity</label>
            <div className="relative">
              <select 
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full p-3 bg-white rounded-lg border border-slate-200 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {activities.length === 0 ? (
                  <option value="">No activities available</option>
                ) : (
                  activities.map(activity => (
                    <option key={activity._id} value={activity._id}>
                      {activity.name} - {new Date(activity.date).toLocaleDateString()}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <label className="text-xs font-medium text-slate-500 uppercase">Search Students</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">Student Info</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">ID</th>
                  <th colSpan={2} className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 border-l border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded text-blue-700 text-xs flex items-center justify-center font-bold">A</div>
                      AM Session
                    </div>
                  </th>
                  <th colSpan={2} className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 border-l border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-100 rounded text-orange-700 text-xs flex items-center justify-center font-bold">P</div>
                      PM Session
                    </div>
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 text-right border-l border-slate-200">Actions</th>
                </tr>
                <tr className="bg-white border-t border-slate-200">
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400"></th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400"></th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400 border-l border-slate-200">Time In</th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400">Time Out</th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400 border-l border-slate-200">Time In</th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400">Time Out</th>
                  <th className="px-4 lg:px-6 py-2 text-xs font-medium text-slate-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-slate-500 font-medium">Loading attendance...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400 font-medium">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const amIn = attendance[student.studentId]?.AM_IN;
                    const amOut = attendance[student.studentId]?.AM_OUT;
                    const pmIn = attendance[student.studentId]?.PM_IN;
                    const pmOut = attendance[student.studentId]?.PM_OUT;
                    const hasAmRecord = amIn || amOut;
                    const hasPmRecord = pmIn || pmOut;
                    
                    return (
                      <tr key={student._id} className="hover:bg-slate-50/50 transition-colors text-sm group">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2 lg:gap-3">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={student.name} 
                                className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center font-semibold shrink-0 text-xs lg:text-sm">
                                {student.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="font-medium text-slate-900 text-sm truncate">{student.name}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-mono text-slate-600 text-xs lg:text-sm">{student.studentId}</td>
                        
                        {/* AM Time In */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4 border-l border-slate-200">
                          {amIn ? (
                            <div className="flex items-center gap-2 group/cell">
                              <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(amIn.status)}`}>
                                {getStatusIcon(amIn.status)}
                                {formatTime(amIn.time)}
                              </span>
                              <button
                                onClick={() => handleEditTime(student.studentId, 'AM', 'in', amIn.time)}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 text-blue-600 transition-all"
                                title="Edit time"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        
                        {/* AM Time Out */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {amOut ? (
                            <div className="flex items-center gap-2 group/cell">
                              <LogOut className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-medium text-slate-700">{formatTime(amOut.time)}</span>
                              <button
                                onClick={() => handleEditTime(student.studentId, 'AM', 'out', amOut.time)}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 text-blue-600 transition-all"
                                title="Edit time"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        
                        {/* PM Time In */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4 border-l border-slate-200">
                          {pmIn ? (
                            <div className="flex items-center gap-2 group/cell">
                              <LogIn className="w-4 h-4 text-orange-600 shrink-0" />
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(pmIn.status)}`}>
                                {getStatusIcon(pmIn.status)}
                                {formatTime(pmIn.time)}
                              </span>
                              <button
                                onClick={() => handleEditTime(student.studentId, 'PM', 'in', pmIn.time)}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 text-blue-600 transition-all"
                                title="Edit time"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        
                        {/* PM Time Out */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {pmOut ? (
                            <div className="flex items-center gap-2 group/cell">
                              <LogOut className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-medium text-slate-700">{formatTime(pmOut.time)}</span>
                              <button
                                onClick={() => handleEditTime(student.studentId, 'PM', 'out', pmOut.time)}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 text-blue-600 transition-all"
                                title="Edit time"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right border-l border-slate-200">
                          <div className="flex items-center justify-end gap-1 lg:gap-2">
                            {(hasAmRecord || hasPmRecord) && (
                              <>
                                {hasAmRecord && (
                                  <button 
                                    onClick={() => handleDeleteTime(student.studentId, 'AM')}
                                    className="p-1.5 lg:p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 transition-all"
                                    title="Delete AM record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                  </button>
                                )}
                                {hasPmRecord && (
                                  <button 
                                    onClick={() => handleDeleteTime(student.studentId, 'PM')}
                                    className="p-1.5 lg:p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 transition-all"
                                    title="Delete PM record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            {!hasAmRecord && !hasPmRecord && (
                              <span className="text-xs text-slate-400">No records</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
