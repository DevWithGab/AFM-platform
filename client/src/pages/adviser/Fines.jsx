import { useState, useEffect } from 'react';
import { 
  Trash2, 
  Check, 
  Search, 
  Loader2,
  AlertCircle,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';
import { activityService } from '../../services/activityService';

export const Fines = () => {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [finesData, studentsData, activitiesData] = await Promise.all([
        fineService.getAllFines(),
        studentService.getAllStudents(),
        activityService.getAllActivities(),
      ]);
      setFines(finesData);
      setStudents(studentsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await fineService.markAsPaid(id);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fine marked as paid',
        confirmButtonColor: '#16a34a',
      });
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to mark fine as paid',
        confirmButtonColor: '#16a34a',
      });
    }
  };

  const handleDeleteFine = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Fine?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });

    if (result.isConfirmed) {
      try {
        await fineService.deleteFine(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Fine deleted successfully',
          confirmButtonColor: '#16a34a',
        });
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete fine',
          confirmButtonColor: '#16a34a',
        });
      }
    }
  };

  const getStudentName = (studentId) => {
    // studentId is already populated as a full student object from the API
    if (typeof studentId === 'object' && studentId?.name) {
      return studentId.name;
    }
    // Fallback to searching in students array if it's just an ID
    const student = students.find((s) => s._id === studentId);
    return student?.name || 'Unknown';
  };

  const getStudentDetails = (studentId) => {
    // studentId is already populated as a full student object from the API
    if (typeof studentId === 'object' && studentId?.name) {
      return studentId;
    }
    // Fallback to searching in students array if it's just an ID
    return students.find((s) => s._id === studentId);
  };

  const filteredFines = fines.filter(fine => {
    const student = getStudentDetails(fine.studentId);
    const studentName = student?.name || '';
    const studentId = student?.studentId || '';
    
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'PAID' && fine.isPaid) ||
                         (statusFilter === 'UNPAID' && !fine.isPaid);
    
    // Activity filter logic
    let matchesActivity = true;
    if (activityFilter === 'MANUAL') {
      // Show only manual fines (no activityId)
      matchesActivity = !fine.activityId;
    } else if (activityFilter !== 'ALL') {
      // Show fines for specific activity
      if (!fine.activityId) {
        matchesActivity = false;
      } else {
        const fineActivityId = typeof fine.activityId === 'object' ? fine.activityId?._id : fine.activityId;
        matchesActivity = fineActivityId === activityFilter;
      }
    }
    
    return matchesSearch && matchesStatus && matchesActivity;
  });

  // Group fines by student
  const groupedFines = filteredFines.reduce((acc, fine) => {
    const student = getStudentDetails(fine.studentId);
    const studentKey = typeof fine.studentId === 'object' ? fine.studentId._id : fine.studentId;
    
    if (!acc[studentKey]) {
      acc[studentKey] = {
        student: student,
        fines: [],
        totalAmount: 0,
        unpaidAmount: 0,
        paidAmount: 0,
      };
    }
    
    acc[studentKey].fines.push(fine);
    acc[studentKey].totalAmount += fine.amount;
    if (fine.isPaid) {
      acc[studentKey].paidAmount += fine.amount;
    } else {
      acc[studentKey].unpaidAmount += fine.amount;
    }
    
    return acc;
  }, {});

  const groupedFinesArray = Object.values(groupedFines);

  // Calculate stats based on filtered fines
  const totalFines = filteredFines.reduce((sum, fine) => sum + fine.amount, 0);
  const paidFines = filteredFines.filter(f => f.isPaid).reduce((sum, fine) => sum + fine.amount, 0);
  const unpaidFines = totalFines - paidFines;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fine Management</h1>
            <p className="text-slate-500 text-sm">Track and manage student fines and payments.</p>
          </div>
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
                <PesoIcon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Total Fines</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">₱{totalFines}</div>
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
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Paid</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">₱{paidFines}</div>
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
                <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Unpaid</div>
                <div className="text-xl lg:text-2xl font-bold text-slate-900">₱{unpaidFines}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-5 py-3 bg-white border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]"
          >
            <option value="ALL">All Activities</option>
            <option value="MANUAL">Manual Fines</option>
            {activities.map((activity) => (
              <option key={activity._id} value={activity._id}>
                {activity.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 bg-white border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">Student</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">Amount</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 hidden lg:table-cell">Activity</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 hidden sm:table-cell">Reason</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-slate-500 font-medium">Loading fines...</p>
                    </td>
                  </tr>
                ) : groupedFinesArray.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                      No fines found.
                    </td>
                  </tr>
                ) : (
                  groupedFinesArray.map((group) => {
                    const student = group.student;
                    const hasUnpaid = group.unpaidAmount > 0;
                    
                    return (
                      <tr key={student?._id || Math.random()} className="hover:bg-slate-50/50 transition-colors group text-sm">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2 lg:gap-3">
                            {student?.photo ? (
                              <img 
                                src={student.photo} 
                                alt={student.name} 
                                className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center font-semibold shrink-0 text-xs lg:text-sm">
                                {student?.name?.substring(0, 2).toUpperCase() || 'UK'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 truncate">{student?.name || 'Unknown'}</div>
                              <div className="text-xs text-slate-400 font-mono truncate">{student?.studentId || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-base lg:text-lg text-slate-900 whitespace-nowrap">
                              ₱{group.totalAmount}
                            </div>
                            <div className="text-xs text-slate-500">
                              {group.fines.length} fine{group.fines.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
                          <div className="space-y-1.5 max-w-xs">
                            {/* Group fines by activity */}
                            {Object.entries(
                              group.fines.reduce((acc, fine) => {
                                const activityName = fine.activityId 
                                  ? (typeof fine.activityId === 'object' ? fine.activityId.name : 'Activity')
                                  : 'Manual Fine';
                                if (!acc[activityName]) {
                                  acc[activityName] = [];
                                }
                                acc[activityName].push(fine);
                                return acc;
                              }, {})
                            ).map(([activityName, activityFines]) => (
                              <div key={activityName} className="text-xs">
                                <div className="font-medium text-slate-900 truncate">{activityName}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {activityFines.map((fine, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                      {fine.period && fine.scanType && (
                                        <>
                                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            fine.period === 'AM' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                          }`}>
                                            {fine.period}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                            {fine.scanType === 'in' ? 'In' : 'Out'}
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">
                          <div className="space-y-1 text-xs text-slate-600 max-w-xs">
                            {group.fines.slice(0, 2).map((fine, idx) => (
                              <div key={idx} className="truncate">{fine.reason}</div>
                            ))}
                            {group.fines.length > 2 && (
                              <div className="text-slate-400">+{group.fines.length - 2} more</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="space-y-1">
                            {hasUnpaid && (
                              <span className="inline-block px-2 lg:px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
                                ₱{group.unpaidAmount} Unpaid
                              </span>
                            )}
                            {group.paidAmount > 0 && (
                              <span className="inline-block px-2 lg:px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                                ₱{group.paidAmount} Paid
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 lg:gap-2">
                            {hasUnpaid && (
                              <button
                                onClick={async () => {
                                  // Mark all unpaid fines as paid
                                  const unpaidFines = group.fines.filter(f => !f.isPaid);
                                  for (const fine of unpaidFines) {
                                    await handleMarkAsPaid(fine._id);
                                  }
                                }}
                                className="p-1.5 lg:p-2 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 text-green-600 transition-all"
                                title="Mark All as Paid"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: 'Delete All Fines?',
                                  text: `This will delete all ${group.fines.length} fine(s) for ${student?.name}`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#dc2626',
                                  cancelButtonColor: '#6b7280',
                                  confirmButtonText: 'Delete All',
                                });
                                
                                if (result.isConfirmed) {
                                  for (const fine of group.fines) {
                                    await fineService.deleteFine(fine._id);
                                  }
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Deleted',
                                    text: 'All fines deleted successfully',
                                    confirmButtonColor: '#16a34a',
                                  });
                                  fetchData();
                                }
                              }}
                              className="p-1.5 lg:p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 transition-all"
                              title="Delete All"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

export default Fines;
