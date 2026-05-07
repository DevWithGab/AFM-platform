const Activity = require('../model/Activity');
const ActivityLog = require('../model/ActivityLog');
const Student = require('../model/Student');
const Fine = require('../model/Fine');
const Attendance = require('../model/Attendance');

exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();

    // Get all students
    const students = await Student.find();

    // Create fines for all students (default: Absent)
    const fineAmount = activity.fines?.absentAmount || 0;
    
    if (fineAmount > 0 && students.length > 0) {
      const finePromises = students.map(student => {
        // Create fines based on activity period
        const fines = [];
        
        if (activity.period === 'Full Day' || activity.period === 'AM Only') {
          // AM Time-In fine
          fines.push(Fine.create({
            studentId: student._id,
            activityId: activity._id,
            amount: fineAmount,
            reason: `Absent - ${activity.name} (AM Time-In)`,
            period: 'AM',
            scanType: 'in',
            isPaid: false,
          }));
          
          // AM Time-Out fine
          fines.push(Fine.create({
            studentId: student._id,
            activityId: activity._id,
            amount: fineAmount,
            reason: `Absent - ${activity.name} (AM Time-Out)`,
            period: 'AM',
            scanType: 'out',
            isPaid: false,
          }));
        }
        
        if (activity.period === 'Full Day' || activity.period === 'PM Only') {
          // PM Time-In fine
          fines.push(Fine.create({
            studentId: student._id,
            activityId: activity._id,
            amount: fineAmount,
            reason: `Absent - ${activity.name} (PM Time-In)`,
            period: 'PM',
            scanType: 'in',
            isPaid: false,
          }));
          
          // PM Time-Out fine
          fines.push(Fine.create({
            studentId: student._id,
            activityId: activity._id,
            amount: fineAmount,
            reason: `Absent - ${activity.name} (PM Time-Out)`,
            period: 'PM',
            scanType: 'out',
            isPaid: false,
          }));
        }
        
        return Promise.all(fines);
      });

      await Promise.all(finePromises);
    }

    await ActivityLog.create({
      action: 'activity_created',
      description: `Activity ${activity.name} created${fineAmount > 0 ? ' and fines assigned to all students' : ''}`,
      details: { activityId: activity._id, studentsCount: students.length, fineAmount },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete all fines associated with this activity
    await Fine.deleteMany({ activityId: activity._id });

    await ActivityLog.create({
      action: 'activity_deleted',
      description: `Activity ${activity.name} deleted and associated fines removed`,
      details: { activityId: activity._id },
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateActivity = async (req, res) => {
  try {
    // Deactivate all other activities first
    await Activity.updateMany({}, { isActive: false });

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await ActivityLog.create({
      action: 'activity_activated',
      description: `Activity ${activity.name} activated`,
      details: { activityId: activity._id },
    });

    res.json(activity);
  } catch (error) {
    console.error('Activate activity error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deactivateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
