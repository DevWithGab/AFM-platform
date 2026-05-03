import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Filter,
  Loader2,
  X,
  AlertCircle,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';

export const Fines = () => {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [finesData, studentsData] = await Promise.all([
        fineService.getAllFines(),
        studentService.getAllStudents(),
      ]);
      setFines(finesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFine = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fineService.createFine(formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fine added successfully',
        confirmButtonColor: '#16a34a',
      });
      setIsAddModalOpen(false);
      setFormData({ studentId: '', amount: '', reason: '' });
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add fine',
        confirmButtonColor: '#16a34a',
      });
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
    return matchesSearch && matchesStatus;
  });

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
  const paidFines = fines.filter(f => f.isPaid).reduce((sum, fine) => sum + fine.amount, 0);
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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Fine
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
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 hidden sm:table-cell">Reason</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-medium uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-slate-500 font-medium">Loading fines...</p>
                    </td>
                  </tr>
                ) : filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                      No fines found.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map((fine) => {
                    const student = getStudentDetails(fine.studentId);
                    return (
                      <tr key={fine._id} className="hover:bg-slate-50/50 transition-colors group text-sm">
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
                          <div className="font-semibold text-base lg:text-lg text-slate-900 whitespace-nowrap">₱{fine.amount}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600 hidden sm:table-cell max-w-xs">
                          <div className="truncate">{fine.reason}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`px-2 lg:px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                            fine.isPaid
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {fine.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 lg:gap-2">
                            {!fine.isPaid && (
                              <button
                                onClick={() => handleMarkAsPaid(fine._id)}
                                className="p-1.5 lg:p-2 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 text-green-600 transition-all"
                                title="Mark as Paid"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteFine(fine._id)}
                              className="p-1.5 lg:p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 transition-all"
                              title="Delete"
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

        {/* Add Fine Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <div className="p-4 lg:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <PesoIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold">Add New Fine</h3>
                      <p className="text-xs lg:text-sm text-slate-500">Issue a fine to a student</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddFine} className="p-4 lg:p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium text-slate-700">Select Student</label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                      className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    >
                      <option value="">Choose a student...</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-slate-700">Amount (₱)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-slate-700">Reason</label>
                    <textarea
                      placeholder="Enter reason for fine..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      rows={3}
                      className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Fine'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Fines;
