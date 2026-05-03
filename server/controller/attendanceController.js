const Attendance = require('../model/Attendance');
const Activity = require('../model/Activity');
const Fine = require('../model/Fine');
const Student = require('../model/Student');
const ActivityLog = require('../model/ActivityLog');

exports.recordAttendance = async (req, res) => {
  try {
    const { studentId, activityId, period, scanType } = req.body;
    // scanType: 'in' for time-in, 'out' for time-out (defaults to 'in' for backward compatibility)
    const type = scanType || 'in';

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate period matches activity configuration
    if (activity.period === 'AM Only' && period === 'PM') {
      return res.status(400).json({ 
        message: 'This activity is AM Only. Please scan for AM session.',
        code: 'INVALID_PERIOD'
      });
    }
    if (activity.period === 'PM Only' && period === 'AM') {
      return res.status(400).json({ 
        message: 'This activity is PM Only. Please scan for PM session.',
        code: 'INVALID_PERIOD'
      });
    }

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // Check if attendance record exists
    let existingAttendance = await Attendance.findOne({
      studentId,
      activityId,
      period,
    });

    if (type === 'in') {
      // Time-in validation and status determination
      let status = 'Absent';
      let fineAmount = 0;
      let fineReason = '';

      if (period === 'AM') {
        if (currentTime < activity.amTimeInStart) {
          return res.status(400).json({ 
            message: `Too early! Time-in starts at ${activity.amTimeInStart}`,
            code: 'TOO_EARLY'
          });
        }
        else if (currentTime >= activity.amTimeInStart && currentTime <= activity.amTimeInCutoff) {
          status = 'Present';
        } 
        else if (currentTime > activity.amTimeInCutoff && currentTime <= activity.amTimeOutCutoff) {
          status = 'Late';
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late attendance for ${activity.name} (AM)`;
        } 
        else {
          return res.status(400).json({ 
            message: `Too late! Time-out cutoff was at ${activity.amTimeOutCutoff}`,
            code: 'TOO_LATE'
          });
        }
      } else if (period === 'PM') {
        if (currentTime < activity.pmTimeInStart) {
          return res.status(400).json({ 
            message: `Too early! Time-in starts at ${activity.pmTimeInStart}`,
            code: 'TOO_EARLY'
          });
        }
        else if (currentTime >= activity.pmTimeInStart && currentTime <= activity.pmTimeInCutoff) {
          status = 'Present';
        } 
        else if (currentTime > activity.pmTimeInCutoff && currentTime <= activity.pmTimeOutCutoff) {
          status = 'Late';
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late attendance for ${activity.name} (PM)`;
        } 
        else {
          return res.status(400).json({ 
            message: `Too late! Time-out cutoff was at ${activity.pmTimeOutCutoff}`,
            code: 'TOO_LATE'
          });
        }
      }

      if (existingAttendance) {
        return res.status(400).json({ message: 'Time-in already recorded for this session' });
      }

      // Create new attendance record with time-in
      const attendance = new Attendance({
        studentId,
        activityId,
        period,
        timeIn: now,
        status,
      });

      await attendance.save();

      if (fineAmount > 0) {
        await Fine.create({
          studentId: student._id,
          amount: fineAmount,
          reason: fineReason,
        });
      }

      await ActivityLog.create({
        action: 'attendance_in',
        description: `${student.name} checked in for ${period} session - ${status}`,
        details: { studentId, activityId, status, period },
      });

      res.status(201).json(attendance);
    } else if (type === 'out') {
      // Time-out handling
      if (!existingAttendance) {
        return res.status(400).json({ message: 'No check-in record found. Please check in first.' });
      }

      if (existingAttendance.timeOut) {
        return res.status(400).json({ message: 'Time-out already recorded for this session' });
      }

      // Update with time-out
      existingAttendance.timeOut = now;
      await existingAttendance.save();

      await ActivityLog.create({
        action: 'attendance_out',
        description: `${student.name} checked out for ${period} session`,
        details: { studentId, activityId, period },
      });

      res.json(existingAttendance);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceByActivity = async (req, res) => {
  try {
    const attendance = await Attendance.find({ activityId: req.params.activityId });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId }).populate('activityId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('activityId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
