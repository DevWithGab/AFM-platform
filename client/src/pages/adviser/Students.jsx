import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Download, 
  Loader2, 
  X, 
  UserPlus, 
  Camera, 
  Upload,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ActivitySquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { studentService } from '../../services/studentService';
import { StudentQRCode } from '../../components/StudentQRCode';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    studentId: '',
    course: '',
    year: '',
    photo: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      console.log('Fetched students:', data); // Debug log
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'Please select an image under 5MB',
        confirmButtonColor: '#16a34a',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 and compress by resizing
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas and resize image to max 600x600
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 600;
          
          if (width > height) {
            if (width > maxDim) {
              height = Math.floor((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.floor((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, photo: compressedBase64 }));
          setIsUploading(false);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to process image',
        confirmButtonColor: '#16a34a',
      });
      setIsUploading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.studentId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#16a34a',
      });
      return;
    }
    
    setLoading(true);
    try {
      await studentService.createStudent(formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Student registered successfully',
        confirmButtonColor: '#16a34a',
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', studentId: '', course: '', year: '', photo: '' });
      fetchStudents();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add student';
      console.error('Student creation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#16a34a',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.studentId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#16a34a',
      });
      return;
    }
    
    setLoading(true);
    try {
      await studentService.updateStudent(selectedStudent._id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Student updated successfully',
        confirmButtonColor: '#16a34a',
      });
      setIsEditModalOpen(false);
      setFormData({ name: '', email: '', password: 'password123', studentId: '', course: '', year: '', photo: '' });
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update student';
      console.error('Student update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#16a34a',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: 'password123',
      studentId: student.studentId,
      course: student.course,
      year: student.year,
      photo: student.photo || '',
    });
    setIsEditModalOpen(true);
  };

  const handleClearAllStudents = async () => {
    const result = await Swal.fire({
      title: 'Clear All Students?',
      text: 'This will delete ALL student records. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete all',
      input: 'text',
      inputPlaceholder: 'Type "DELETE" to confirm',
      inputValidator: (value) => {
        if (value !== 'DELETE') {
          return 'You must type DELETE to confirm';
        }
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Delete all students one by one
        for (const student of students) {
          await studentService.deleteStudent(student._id);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Cleared',
          text: 'All students have been deleted',
          confirmButtonColor: '#16a34a',
        });
        fetchStudents();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to clear students',
          confirmButtonColor: '#16a34a',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Student?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });

    if (result.isConfirmed) {
      try {
        await studentService.deleteStudent(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Student deleted successfully',
          confirmButtonColor: '#16a34a',
        });
        fetchStudents();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete student',
          confirmButtonColor: '#16a34a',
        });
      }
    }
  };

  const navItems = [
    { path: '/adviser/overview', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/adviser/students', label: 'Manage Students', icon: UserCog },
    { path: '/adviser/activities', label: 'Activities', icon: CalendarDays },
    { path: '/adviser/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/adviser/fines', label: 'Fines', icon: PesoIcon },
    { path: '/adviser/reports', label: 'Reports', icon: FileText },
    { path: '/adviser/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Students</h1>
            <p className="text-slate-500 text-sm">Register, update, and manage student information.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-all text-slate-700">
              <Download className="w-5 h-5" /> Export
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              <Plus className="w-5 h-5" /> Add Student
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-all text-slate-700">
            <Filter className="w-5 h-5" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500">Student Info</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500">ID Number</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500">Course & Year</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500">Email</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-slate-500 font-medium">Fetching students...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-500 font-medium text-lg">No students found in the system.</p>
                      <p className="text-slate-400 text-sm mt-2">Click "Add Student" to register a new student.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.name} 
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center font-semibold shrink-0">
                              {student.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="font-medium text-slate-900 truncate max-w-[200px]">{student.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 text-sm">{student.studentId || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{student.course || 'N/A'}</div>
                        <div className="text-xs text-slate-400">{student.year ? `${student.year} Year` : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{student.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowQRModal(true);
                            }}
                            className="p-2 hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 text-primary transition-all"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(student)}
                            className="p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 text-slate-600 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Modal */}
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
                className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Register New Student</h3>
                      <p className="text-sm text-slate-500">Fill in the student's personal details.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStudent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Juan Dela Cruz"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Student ID Number</label>
                      <input
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        placeholder="2021-0000"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Course</label>
                      <input
                        type="text"
                        required
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        placeholder="BSEMC"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Year Level</label>
                      <select
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="juan@school.edu"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Login Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Enter a secure password"
                          className="w-full p-3 pr-12 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="font-medium text-slate-700">Student Photo</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-5 rounded-lg bg-slate-50 border border-slate-200 border-dashed transition-all hover:bg-slate-100/50">
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                            {formData.photo ? (
                              <img 
                                src={formData.photo} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <h4 className="font-medium text-slate-900 text-sm">Upload profile picture</h4>
                            <p className="text-xs text-slate-500">Max file size 5MB. Supported formats: JPG, PNG.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" /> {formData.photo ? 'Change Photo' : 'Choose File'}
                            </button>
                            {formData.photo && (
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                                className="px-3 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-all"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
                      {loading ? 'Adding...' : 'Register Student'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Student Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Edit Student</h3>
                      <p className="text-sm text-slate-500">Update the student's personal details.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditStudent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Juan Dela Cruz"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Student ID Number</label>
                      <input
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        placeholder="2021-0000"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Course</label>
                      <input
                        type="text"
                        required
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        placeholder="BSEMC"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Year Level</label>
                      <select
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="juan@school.edu"
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-slate-700">Login Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Enter a secure password"
                          className="w-full p-3 pr-12 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="font-medium text-slate-700">Student Photo</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-5 rounded-lg bg-slate-50 border border-slate-200 border-dashed transition-all hover:bg-slate-100/50">
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                            {formData.photo ? (
                              <img 
                                src={formData.photo} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <h4 className="font-medium text-slate-900 text-sm">Upload profile picture</h4>
                            <p className="text-xs text-slate-500">Max file size 5MB. Supported formats: JPG, PNG.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" /> {formData.photo ? 'Change Photo' : 'Choose File'}
                            </button>
                            {formData.photo && (
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                                className="px-3 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-all"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Student'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* QR Code Modal */}
        {showQRModal && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-500">Student QR Code</p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <StudentQRCode
                studentId={selectedStudent.studentId}
                studentName={selectedStudent.name}
              />
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Students;
