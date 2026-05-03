import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Mail, Lock, Loader2, Shield, UserCheck, GraduationCap, ArrowLeft, ArrowRight, DollarSign, Activity, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import loginBg from '../assets/background/login-logo.png';

const LoginPage = () => {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) return;
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // Verify role matches
      if (response.user.role !== role) {
        setError(`User is not registered as ${role}`);
        setIsLoading(false);
        return;
      }

      login(response.user, response.token);

      Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        confirmButtonColor: '#16a34a',
        timer: 2000,
      });

      // Navigate based on role
      navigate(`/${role}${role === 'student' ? '/overview' : role === 'adviser' ? '/overview' : '/scanner'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex overflow-hidden">
      <div className="w-full flex">
        
        {/* Left Panel: Branding & Features - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-16 flex-col justify-between text-white relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${loginBg})` }}
          />
          
          {/* Gradient Overlay - Left to Right Fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/80" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12 xl:mb-20">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">AFM Platform</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 xl:space-y-6 mb-12 xl:mb-16">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                Attendance &<br />
                Fine Management
              </h1>
              
              <p className="text-white/60 text-base xl:text-lg max-w-md leading-relaxed">
                Track attendance and manage fines efficiently for your organization.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 xl:space-y-4">
              {[
                { icon: QrCode, title: 'QR Code Scanning', desc: 'Quick student identification' },
                { icon: DollarSign, title: 'Fine Management', desc: 'Track and manage penalties' },
                { icon: Activity, title: 'Activity Logs', desc: 'Complete audit trail' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">{feature.title}</div>
                    <div className="text-xs text-white/50">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10">
            <div className="text-xs text-white/30 uppercase tracking-wider">© 2026 AFM Platform</div>
          </div>
        </div>

        {/* Right Panel: Role Selection / Login */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-4 sm:p-6 lg:p-12 xl:p-16 flex flex-col justify-center overflow-y-auto min-h-screen">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">AFM</span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              {!role ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8 lg:mb-10">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome to AFM</h2>
                    <p className="text-slate-500 text-sm lg:text-base">Attendance & Fine Management System</p>
                    <p className="text-xs lg:text-sm text-slate-400 mt-3 lg:mt-4">
                      Select your role to access your personalized dashboard. Each role has specific permissions and features tailored to your responsibilities.
                    </p>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    {[
                      { 
                        id: 'adviser', 
                        title: 'Adviser', 
                        icon: Shield, 
                        desc: 'Manage students, activities, attendance records, and generate reports',
                      },
                      { 
                        id: 'officer', 
                        title: 'Officer', 
                        icon: UserCheck, 
                        desc: 'Scan QR codes and record real-time attendance for active sessions',
                      },
                      { 
                        id: 'student', 
                        title: 'Student', 
                        icon: GraduationCap, 
                        desc: 'View your attendance records, fines, and activity participation',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setRole(item.id)}
                        className="group flex items-start gap-3 lg:gap-4 p-4 lg:p-5 w-full bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-slate-900 text-base lg:text-lg mb-1">{item.title}</div>
                          <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1 mt-2" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 lg:mt-8 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Need Help?</p>
                    <p className="text-xs lg:text-sm text-slate-500">Contact your administrator for account access</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 lg:space-y-8"
                >
                  <button 
                    onClick={() => {
                      setRole(null);
                      setError('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all text-xs lg:text-sm font-semibold"
                  >
                    <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    Back to selection
                  </button>
                  
                  {/* Role-specific header */}
                  <div 
                    className="p-5 lg:p-6 rounded-xl border-2"
                    style={{
                      backgroundColor: role === 'adviser' ? '#EEF2FF' : role === 'officer' ? '#F0FDF4' : '#EFF6FF',
                      borderColor: role === 'adviser' ? '#C7D2FE' : role === 'officer' ? '#BBF7D0' : '#BFDBFE'
                    }}
                  >
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div 
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: role === 'adviser' ? '#E0E7FF' : role === 'officer' ? '#DCFCE7' : '#DBEAFE'
                        }}
                      >
                        {role === 'adviser' && <Shield className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: '#4F46E5' }} />}
                        {role === 'officer' && <UserCheck className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: '#16a34a' }} />}
                        {role === 'student' && <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: '#2563eb' }} />}
                      </div>
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 capitalize">{role} Login</h2>
                        <p 
                          className="text-xs lg:text-sm font-medium"
                          style={{
                            color: role === 'adviser' ? '#4F46E5' : role === 'officer' ? '#16a34a' : '#2563eb'
                          }}
                        >
                          {role === 'adviser' && 'Administrative Access'}
                          {role === 'officer' && 'Attendance Recording'}
                          {role === 'student' && 'Student Portal'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@school.edu"
                          className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-slate-200 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                          style={{
                            '--focus-color': role === 'adviser' ? '#6366F1' : role === 'officer' ? '#22c55e' : '#3B82F6'
                          }}
                          onFocus={(e) => e.target.style.borderColor = role === 'adviser' ? '#6366F1' : role === 'officer' ? '#22c55e' : '#3B82F6'}
                          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="off"
                          className="w-full p-4 pl-12 pr-12 rounded-xl bg-white border-2 border-slate-200 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                          onFocus={(e) => e.target.style.borderColor = role === 'adviser' ? '#6366F1' : role === 'officer' ? '#22c55e' : '#3B82F6'}
                          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        backgroundColor: role === 'adviser' ? '#4F46E5' : role === 'officer' ? '#16a34a' : '#2563eb',
                        boxShadow: role === 'adviser' ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 
                                   role === 'officer' ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' : 
                                   '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = role === 'adviser' ? '#4338CA' : role === 'officer' ? '#15803d' : '#1d4ed8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = role === 'adviser' ? '#4F46E5' : role === 'officer' ? '#16a34a' : '#2563eb';
                      }}
                      className="w-full py-4 text-white rounded-xl font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
