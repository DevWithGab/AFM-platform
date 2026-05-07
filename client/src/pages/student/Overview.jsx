import { useState, useEffect, useContext, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  History,
  ArrowUpRight,
  LayoutDashboard,
  Download,
  Printer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';

export const StudentOverview = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [totalFines, setTotalFines] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Get student profile
      const studentData = await studentService.getStudentById(user.studentId || user._id);
      setProfile({
        name: studentData.name,
        idNumber: studentData.studentId,
        course: studentData.course,
        yearLevel: studentData.year,
        photo: studentData.photo,
      });

      // Get attendance records
      const attendanceData = await attendanceService.getAttendanceByStudent(studentData.studentId);
      setAttendance(attendanceData.slice(0, 5).map(record => ({
        id: record._id,
        session: record.period + '_' + record.status.toUpperCase(),
        timestamp: record.timestamp,
        activityName: record.activityId?.name || 'University Assembly',
      })));

      // Get fines for this specific student from backend
      const finesData = await fineService.getFinesByStudent(studentData._id);
      const unpaidFines = finesData.filter(f => !f.isPaid);
      const total = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);
      setTotalFines(total);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR-${profile?.idNumber || 'student'}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    const qrValue = profile?.idNumber || user?.studentId || 'LOADING';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student QR Code - ${profile?.name || 'Student'}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #e2e8f0;
              padding: 40px;
              border-radius: 20px;
              background: white;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1e293b;
            }
            .id {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 24px;
              font-family: monospace;
            }
            .qr-code {
              margin: 20px 0;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #94a3b8;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        </head>
        <body>
          <div class="qr-container">
            <h1>${profile?.name || 'Student Name'}</h1>
            <div class="id">${profile?.idNumber || 'ID Number'}</div>
            <div class="qr-code" id="qrcode"></div>
            <div class="footer">AFM Platform - Attendance & Fine Management</div>
          </div>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${qrValue}', {
              width: 300,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            }, function (error, canvas) {
              if (error) console.error(error);
              document.getElementById('qrcode').appendChild(canvas);
              setTimeout(() => window.print(), 500);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const navItems = [
    { path: '/student/overview', label: 'Dashboard', icon: LayoutDashboard },
  ];

  // Use studentId for QR code (this is what the scanner will read)
  const qrCodeValue = profile?.idNumber || user?.studentId || 'LOADING';

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 lg:space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2">Student Dashboard</h1>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Manage your attendance and organization status</p>
          </div>
          
          {/* Quick QR View */}
          <button 
            onClick={() => setShowQRModal(true)}
            className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-md flex items-center gap-4 lg:gap-6 pr-6 lg:pr-10 hover:shadow-xl hover:border-primary/20 transition-all active:scale-95 cursor-pointer group"
          >
            <div className="p-2 lg:p-3 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
              <QRCodeSVG 
                value={qrCodeValue} 
                size={60} 
                level="H" 
                className="text-slate-900 lg:w-20 lg:h-20" 
              />
            </div>
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Your Identity</div>
              <div className="font-bold text-base lg:text-lg text-slate-900 leading-tight">
                Flash QR for <br /> attendance
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Profile Card */}
          <div className="bg-gray-900 p-6 lg:p-10 rounded-3xl lg:rounded-[40px] text-white relative overflow-hidden shadow-2xl">
            <QrCode className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 text-white/5 -mr-12 lg:-mr-16 -mt-12 lg:-mt-16 rotate-12" />
            
            <div className="relative z-10 space-y-6 lg:space-y-10">
              <div className="flex items-center gap-3 lg:gap-5">
                {profile?.photo ? (
                  <img 
                    src={profile.photo}
                    alt={profile?.name}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl object-cover shrink-0 shadow-lg shadow-primary/20 border-2 border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-xl lg:text-2xl shadow-lg shadow-primary/20 shrink-0">
                    {profile?.name?.substring(0, 1).toUpperCase() || 'S'}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg lg:text-2xl font-bold tracking-tight text-white/90 truncate">{profile?.name || 'Loading...'}</h3>
                  <p className="text-white/30 font-mono text-xs tracking-widest truncate">{profile?.idNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="bg-white/5 p-4 lg:p-5 rounded-2xl lg:rounded-[24px] border border-white/10">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Course</div>
                  <div className="font-bold text-xs lg:text-sm text-white/80 truncate">{profile?.course || 'N/A'}</div>
                </div>
                <div className="bg-white/5 p-4 lg:p-5 rounded-2xl lg:rounded-[24px] border border-white/10">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Year</div>
                  <div className="font-bold text-xs lg:text-sm tracking-widest text-white/80">{profile?.yearLevel || 'N/A'}</div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Balance Due</div>
                <div className="text-4xl lg:text-5xl font-black tracking-tighter text-white">
                  ₱{totalFines.toFixed(0)}
                  <span className="text-lg lg:text-xl text-white/20 font-medium">.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="lg:col-span-2 bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 p-6 lg:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-10 gap-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 text-primary rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0">
                  <History className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                  <p className="text-xs lg:text-sm text-slate-500 font-medium">Your latest participation logs</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 lg:px-6 py-2 lg:py-2.5 rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 border border-primary/5 self-start sm:self-auto">
                Full Logs
              </button>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                  Loading...
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                  No participation found
                </div>
              ) : (
                attendance.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 lg:p-6 bg-slate-50/50 hover:bg-slate-100/50 rounded-2xl lg:rounded-[28px] border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-3 lg:gap-5 min-w-0 flex-1">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg lg:rounded-xl shadow-sm flex items-center justify-center group-hover:text-primary transition-colors text-slate-400 shrink-0">
                        <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm lg:text-base truncate">{record.activityName}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {formatDate(record.timestamp)} • {formatTime(record.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4 shrink-0 ml-2">
                      <div className="px-3 lg:px-5 py-1.5 lg:py-2 bg-primary/5 text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-primary/10 whitespace-nowrap">
                        <span className="hidden sm:inline">{record.session.replace('_', ' ')}</span>
                        <span className="sm:hidden">{record.session.split('_')[1]}</span>
                      </div>
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shrink-0">
                        <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Global Notices */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            <div className="p-6 lg:p-10 bg-orange-500/10 rounded-3xl lg:rounded-[40px] text-orange-600 relative overflow-hidden group border border-orange-500/20">
              <AlertCircle className="absolute bottom-0 right-0 w-32 h-32 lg:w-48 lg:h-48 text-orange-500/10 -mb-8 lg:-mb-12 -mr-8 lg:-mr-12 transition-transform group-hover:scale-110 rotate-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 text-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                    <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600/70">Outstanding Balance</span>
                </div>
                
                <h3 className="text-xl lg:text-2xl font-bold mb-2 tracking-tight">Fines & Penalties</h3>
                <p className="text-orange-600/70 font-medium mb-6 lg:mb-8 leading-relaxed text-xs lg:text-sm">
                  {totalFines > 0 
                    ? 'You have unpaid fines. Please settle your balance to avoid further penalties.'
                    : 'Great! You have no outstanding fines. Keep up the good attendance!'}
                </p>
                
                <div className="bg-orange-500/10 p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-orange-500/20">
                  <div className="text-[10px] font-black text-orange-600/50 uppercase tracking-[0.2em] mb-2">Total Amount Due</div>
                  <div className="text-4xl lg:text-5xl font-black tracking-tighter text-orange-600">
                    ₱{totalFines.toFixed(0)}
                    <span className="text-lg lg:text-xl text-orange-600/30 font-medium">.00</span>
                  </div>
                  {totalFines > 0 && (
                    <div className="mt-3 lg:mt-4 text-xs text-orange-600/60 font-medium">
                      Contact your adviser for payment details
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10 bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 lg:gap-3 text-orange-500 mb-4 lg:mb-6">
                  <AlertCircle className="w-6 h-6 lg:w-7 lg:h-7" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compliance Notice</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3 text-slate-900">Attendance Policy</h3>
                <p className="text-slate-500 font-medium text-xs lg:text-sm leading-relaxed">
                  Students are automatically marked absent for all activities. Scan your QR code during time-in and time-out windows to mark yourself present and avoid fines. Fine amounts vary per activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Your QR Code</h3>
                  <p className="text-sm text-slate-500 mt-1">Use this for attendance scanning</p>
                </div>
                <button 
                  onClick={() => setShowQRModal(false)} 
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center">
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-200 mb-6" ref={qrRef}>
                  <QRCodeSVG 
                    value={qrCodeValue} 
                    size={240} 
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="text-center mb-6">
                  <div className="font-bold text-lg text-slate-900">{profile?.name || 'Loading...'}</div>
                  <div className="text-sm text-slate-500 font-mono">{profile?.idNumber || 'N/A'}</div>
                  <div className="text-xs text-slate-400 mt-1">{profile?.course} - Year {profile?.yearLevel}</div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handlePrintQR}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default StudentOverview;
