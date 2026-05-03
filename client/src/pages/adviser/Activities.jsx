import { useState, useEffect } from 'react';
import { Plus, Trash2, Power, Calendar, Clock, Loader2, X, LayoutDashboard, UserCog, CalendarDays, ClipboardCheck, FileText, ActivitySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PesoIcon } from '../../components/PesoIcon';
import { activityService } from '../../services/activityService';
import { cn } from '../../lib/utils';

export const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    period: 'Full Day',
    amTimeInStart: '08:00',
    amTimeInCutoff: '08:30',
    amTimeOutStart: '11:30',
    amTimeOutCutoff: '12:00',
    pmTimeInStart: '13:00',
    pmTimeInCutoff: '13:30',
    pmTimeOutStart: '16:30',
    pmTimeOutCutoff: '17:00',
    fines: {
      lateAmount: 50,
      absentAmount: 100,
    },
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await activityService.createActivity(formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Activity created successfully',
        confirmButtonColor: '#16a34a',
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        date: '',
        period: 'Full Day',
        amTimeInStart: '08:00',
        amTimeInCutoff: '08:30',
        amTimeOutStart: '11:30',
        amTimeOutCutoff: '12:00',
        pmTimeInStart: '13:00',
        pmTimeInCutoff: '13:30',
        pmTimeOutStart: '16:30',
        pmTimeOutCutoff: '17:00',
        fines: { lateAmount: 50, absentAmount: 100 },
      });
      fetchActivities();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create activity',
        confirmButtonColor: '#16a34a',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Activity?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });

    if (result.isConfirmed) {
      try {
        await activityService.deleteActivity(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Activity deleted successfully',
          confirmButtonColor: '#16a34a',
        });
        fetchActivities();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete activity',
          confirmButtonColor: '#16a34a',
        });
      }
    }
  };

  const handleToggleStatus = async (activity) => {
    try {
      if (activity.isActive) {
        await activityService.deactivateActivity(activity._id);
      } else {
        await activityService.activateActivity(activity._id);
      }
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Activity ${activity.isActive ? 'deactivated' : 'activated'} successfully`,
        confirmButtonColor: '#16a34a',
      });
      fetchActivities();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update activity',
        confirmButtonColor: '#16a34a',
      });
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

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activities & Schedules</h1>
            <p className="text-slate-500 text-sm">Create events and manage real-time attendance cutoffs.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-5 h-5" /> New Activity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            </div>
          ) : activities.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm bg-white rounded-lg border border-dashed border-slate-200">
              No activities scheduled yet.
            </div>
          ) : (
            activities.map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      activity.isActive ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                    )}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{activity.name}</div>
                      <div className="text-xs text-slate-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium",
                    activity.isActive 
                      ? "bg-green-50 text-green-600" 
                      : "bg-slate-50 text-slate-400"
                  )}>
                    {activity.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {(activity.period === 'Full Day' || activity.period === 'AM Only') && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-blue-900 font-bold mb-2">AM Session</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-blue-700">
                          <span className="text-blue-600/70">Time-In:</span>
                          <span className="font-medium">{activity.amTimeInStart} - {activity.amTimeInCutoff}</span>
                        </div>
                        <div className="flex items-center justify-between text-blue-700">
                          <span className="text-blue-600/70">Time-Out:</span>
                          <span className="font-medium">{activity.amTimeOutStart} - {activity.amTimeOutCutoff}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(activity.period === 'Full Day' || activity.period === 'PM Only') && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="text-orange-900 font-bold mb-2">PM Session</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-orange-700">
                          <span className="text-orange-600/70">Time-In:</span>
                          <span className="font-medium">{activity.pmTimeInStart} - {activity.pmTimeInCutoff}</span>
                        </div>
                        <div className="flex items-center justify-between text-orange-700">
                          <span className="text-orange-600/70">Time-Out:</span>
                          <span className="font-medium">{activity.pmTimeOutStart} - {activity.pmTimeOutCutoff}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => handleToggleStatus(activity)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                      activity.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    )}
                  >
                    <Power className="w-4 h-4" />
                    {activity.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteActivity(activity._id)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Activity Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                  <h3 className="text-lg font-semibold">New Activity Setup</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddActivity} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Activity Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="General Assembly 2024"
                      className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Type</label>
                      <select
                        value={formData.period}
                        onChange={(e) => setFormData({...formData, period: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <option value="Full Day">Whole Day</option>
                        <option value="AM Only">AM Only</option>
                        <option value="PM Only">PM Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Time Schedules</div>
                    
                    {/* AM Session - Show if Full Day or AM Only */}
                    {(formData.period === 'Full Day' || formData.period === 'AM Only') && (
                      <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-sm font-bold text-blue-900">AM Session</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-In Start</label>
                            <input
                              type="time"
                              value={formData.amTimeInStart}
                              onChange={(e) => setFormData({...formData, amTimeInStart: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-In Cutoff</label>
                            <input
                              type="time"
                              value={formData.amTimeInCutoff}
                              onChange={(e) => setFormData({...formData, amTimeInCutoff: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-Out Start</label>
                            <input
                              type="time"
                              value={formData.amTimeOutStart}
                              onChange={(e) => setFormData({...formData, amTimeOutStart: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-Out Cutoff</label>
                            <input
                              type="time"
                              value={formData.amTimeOutCutoff}
                              onChange={(e) => setFormData({...formData, amTimeOutCutoff: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PM Session - Show if Full Day or PM Only */}
                    {(formData.period === 'Full Day' || formData.period === 'PM Only') && (
                      <div className="space-y-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="text-sm font-bold text-orange-900">PM Session</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-In Start</label>
                            <input
                              type="time"
                              value={formData.pmTimeInStart}
                              onChange={(e) => setFormData({...formData, pmTimeInStart: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-In Cutoff</label>
                            <input
                              type="time"
                              value={formData.pmTimeInCutoff}
                              onChange={(e) => setFormData({...formData, pmTimeInCutoff: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-Out Start</label>
                            <input
                              type="time"
                              value={formData.pmTimeOutStart}
                              onChange={(e) => setFormData({...formData, pmTimeOutStart: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Time-Out Cutoff</label>
                            <input
                              type="time"
                              value={formData.pmTimeOutCutoff}
                              onChange={(e) => setFormData({...formData, pmTimeOutCutoff: e.target.value})}
                              className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-lg font-medium transition-all disabled:opacity-50 hover:bg-primary/90"
                  >
                    Create Activity
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Activities;
