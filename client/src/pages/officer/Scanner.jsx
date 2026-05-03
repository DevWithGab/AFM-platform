import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  QrCode, 
  User, 
  Users, 
  RotateCcw,
  ScanLine,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { attendanceService } from '../../services/attendanceService';
import { activityService } from '../../services/activityService';
import { studentService } from '../../services/studentService';
import { cn } from '../../lib/utils';

export const Scanner = () => {
  const [activeActivity, setActiveActivity] = useState(null);
  const [session, setSession] = useState('AM_IN');
  const [scanningStatus, setScanningStatus] = useState('idle');
  const [scanResult, setScanResult] = useState(null);
  const [stats, setStats] = useState({ totalScanned: 0, yourScans: 0 });
  
  const scannerInstanceRef = useRef(null);
  const cooldownRef = useRef(null);
  const clearTimeoutRef = useRef(null);

  useEffect(() => {
    fetchActiveActivity();
    fetchStats();
    
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear();
      }
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const fetchActiveActivity = async () => {
    try {
      const activities = await activityService.getAllActivities();
      const active = activities.find((a) => a.isActive);
      setActiveActivity(active || null);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const attendance = await attendanceService.getAllAttendance();
      setStats({
        totalScanned: attendance.length,
        yourScans: attendance.length, // In a real app, filter by current officer
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const startScanner = async () => {
    if (!activeActivity) {
      Swal.fire({
        icon: 'warning',
        title: 'No Active Activity',
        text: 'Please wait for an adviser to activate an activity',
        confirmButtonColor: '#16a34a',
      });
      return;
    }

    // Request camera permission first
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Camera Access Denied',
        html: '<p class="text-left">We need camera access to scan QR codes. Please:</p><ol class="text-left list-decimal list-inside mt-2"><li>Check your browser permissions</li><li>Allow camera access when prompted</li><li>Refresh and try again</li></ol>',
        confirmButtonColor: '#16a34a',
      });
      return;
    }

    setScanningStatus('scanning');

    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        showTorchButtonIfSupported: true,
      },
      false
    );

    // Hide the default html5-qrcode UI elements
    setTimeout(() => {
      const qrcodeContainer = document.getElementById('reader');
      if (qrcodeContainer) {
        const buttons = qrcodeContainer.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.style.display = 'none';
        });
        const fileInput = qrcodeContainer.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.style.display = 'none';
        }
      }
    }, 100);

    scanner.render(
      async (decodedText) => {
        if (cooldownRef.current) return;

        cooldownRef.current = true;
        scanner.pause();

        try {
          // Get student details
          const student = await studentService.getStudentById(decodedText);
          
          // Determine period (AM or PM) from session
          const period = session.startsWith('AM') ? 'AM' : 'PM';
          
          // Record attendance
          const attendanceResponse = await attendanceService.recordAttendance({
            studentId: decodedText,
            activityId: activeActivity._id,
            period: period,
          });

          // Show success result with actual status
          const actualStatus = attendanceResponse.status || 'Present';
          setScanResult({
            status: 'success',
            message: `Marked as ${actualStatus}`,
            attendanceStatus: actualStatus,
            student: {
              name: student.name,
              idNumber: student.studentId,
              course: student.course,
              yearLevel: student.year,
              photoUrl: student.photo,
            },
          });

          // Update stats
          fetchStats();

          // Auto-clear after 4 seconds
          clearTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            cooldownRef.current = false;
            scanner.resume();
          }, 4000);

        } catch (error) {
          console.error('Scan error:', error);
          
          setScanResult({
            status: 'error',
            message: error.response?.data?.message || 'Failed to record attendance',
            student: {
              name: 'Unknown',
              idNumber: decodedText,
              course: 'N/A',
              yearLevel: 'N/A',
              photoUrl: null,
            },
          });

          // Auto-clear error after 4 seconds
          clearTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            cooldownRef.current = false;
            scanner.resume();
          }, 4000);
        }
      },
      (error) => {
        // Ignore scanning errors (they happen continuously)
        console.log('Scanner error:', error);
      }
    );

    scannerInstanceRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear();
      scannerInstanceRef.current = null;
    }
    setScanningStatus('idle');
  };

  const navItems = [
    { path: '/officer/scanner', label: 'Scanner', icon: ScanLine },
    { path: '/officer/overview', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">QR Attendance Scanner</h1>
          <p className="text-slate-500">Scan student QR codes to record real-time attendance.</p>
        </div>

        {!activeActivity ? (
          <div className="bg-orange-50 border border-orange-100 p-8 rounded-3xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
            <h3 className="text-xl font-bold text-orange-900">No Active Activity</h3>
            <p className="text-orange-700">Please wait for an adviser to set an activity as active before scanning.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scanner Side */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Active Event</div>
                    <div className="font-bold text-lg">{activeActivity.name}</div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
                    LIVE
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSession(s)}
                      disabled={scanningStatus === 'scanning'}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all font-bold text-sm",
                        session === s 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100",
                        scanningStatus === 'scanning' && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden group">
                  <div id="reader" className="w-full h-full"></div>
                  
                  {scanningStatus === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity group-hover:bg-slate-900/40">
                      <button 
                        onClick={startScanner}
                        className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse hover:scale-110 transition-transform"
                      >
                        <Camera className="w-10 h-10" />
                      </button>
                      <p className="text-white font-bold mt-4 uppercase tracking-widest text-sm">Start Scanning</p>
                      <p className="text-white/60 text-xs mt-2">Camera access required</p>
                    </div>
                  )}
                </div>

                {scanningStatus === 'scanning' && (
                  <button
                    onClick={stopScanner}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-200"
                  >
                    Stop Scanner
                  </button>
                )}
              </div>
            </div>

            {/* Results Side */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {scanResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "bg-white p-8 rounded-3xl border shadow-xl flex flex-col items-center text-center space-y-6",
                      scanResult.status === 'success' ? "border-green-100" : "border-red-100"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center",
                      scanResult.status === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {scanResult.status === 'success' ? (
                        <CheckCircle2 className="w-12 h-12" />
                      ) : (
                        <AlertCircle className="w-12 h-12" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className={cn(
                        "text-2xl font-bold uppercase tracking-tight",
                        scanResult.status === 'success' ? "text-green-600" : "text-red-600"
                      )}>
                        {scanResult.status.toUpperCase()}
                      </h3>
                      <p className="text-slate-500 font-medium">{scanResult.message}</p>
                      
                      {/* Show attendance status badge for successful scans */}
                      {scanResult.status === 'success' && scanResult.attendanceStatus && (
                        <div className="pt-2">
                          <span className={cn(
                            "inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider",
                            scanResult.attendanceStatus === 'Present' ? "bg-green-100 text-green-700 border-2 border-green-200" :
                            scanResult.attendanceStatus === 'Late' ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-200" :
                            "bg-red-100 text-red-700 border-2 border-red-200"
                          )}>
                            {scanResult.attendanceStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-full p-6 bg-slate-50 rounded-3xl space-y-4">
                      {scanResult.student.photoUrl ? (
                        <img 
                          src={scanResult.student.photoUrl} 
                          alt={scanResult.student.name}
                          className="w-24 h-24 rounded-2xl mx-auto object-cover ring-4 ring-white" 
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-2xl mx-auto flex items-center justify-center ring-4 ring-white">
                          <User className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      
                      <div>
                        <div className="text-xl font-bold text-slate-900">{scanResult.student.name}</div>
                        <div className="text-sm font-semibold text-slate-400">{scanResult.student.idNumber}</div>
                        <div className="text-xs font-bold text-primary mt-1 uppercase tracking-widest">
                          {scanResult.student.course} - Year {scanResult.student.yearLevel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-4 h-4" /> Auto-clearing in 4s...
                    </div>
                  </motion.div>
                ) : (
                  <div 
                    key="placeholder" 
                    className="h-full bg-white/50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[400px]"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <QrCode className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-500">Scan Ready</h3>
                      <p className="text-sm text-slate-400">Position the student's QR code within the scanner frame.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* Quick Stats for Officer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Total Scanned</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.totalScanned}</div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 text-cyan-600 mb-2">
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Your Scans</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.yourScans}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
