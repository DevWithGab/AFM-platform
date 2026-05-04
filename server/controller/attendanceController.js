const Attendance = require('../model/Attendance');
const Activity = require('../model/Activity');
const Fine = require('../model/Fine');
const Student = require('../model/Student');
const ActivityLog = require('../model/ActivityLog');

exports.recordAttendance = async (req, res) => {
  try {
    const { studentId, activityId, period } = req.body;

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

    // Determine if this is time-in or time-out based on current time and activity schedule
    let isTimeIn = false;
    let isTimeOut = false;
    let isLateTimeIn = false;

    if (period === 'AM') {
      // Check if too early for time-in
      if (currentTime < activity.amTimeInStart) {
        return res.status(400).json({ 
          message: `Too early! Time-in starts at ${activity.amTimeInStart}`,
          code: 'TOO_EARLY'
        });
      }
      // Check if current time is within time-in window
      else if (currentTime >= activity.amTimeInStart && currentTime <= activity.amTimeInCutoff) {
        isTimeIn = true;
      }
      // Check if current time is late for time-in (after cutoff but before time-out starts)
      else if (currentTime > activity.amTimeInCutoff && currentTime < activity.amTimeOutStart) {
        isTimeIn = true;
        isLateTimeIn = true;
      }
      // Check if too early for time-out (within late time-in period)
      else if (currentTime >= activity.amTimeOutStart && currentTime < activity.amTimeOutStart) {
        return res.status(400).json({ 
          message: `Too early for time-out! Time-out starts at ${activity.amTimeOutStart}`,
          code: 'TOO_EARLY_TIMEOUT'
        });
      }
      // Check if current time is within time-out window
      else if (currentTime >= activity.amTimeOutStart && currentTime <= activity.amTimeOutCutoff) {
        isTimeOut = true;
      }
    } else if (period === 'PM') {
      // Check if too early for time-in
      if (currentTime < activity.pmTimeInStart) {
        return res.status(400).json({ 
          message: `Too early! Time-in starts at ${activity.pmTimeInStart}`,
          code: 'TOO_EARLY'
        });
      }
      // Check if current time is within time-in window
      else if (currentTime >= activity.pmTimeInStart && currentTime <= activity.pmTimeInCutoff) {
        isTimeIn = true;
      }
      // Check if current time is late for time-in (after cutoff but before time-out starts)
      else if (currentTime > activity.pmTimeInCutoff && currentTime < activity.pmTimeOutStart) {
        isTimeIn = true;
        isLateTimeIn = true;
      }
      // Check if current time is within time-out window
      else if (currentTime >= activity.pmTimeOutStart && currentTime <= activity.pmTimeOutCutoff) {
        isTimeOut = true;
      }
    }

    // Check if attendance record exists
    let existingAttendance = await Attendance.findOne({
      studentId,
      activityId,
      period,
    });

    if (isTimeIn) {
      // TIME-IN LOGIC
      if (existingAttendance && existingAttendance.timeIn) {
        return res.status(400).json({ message: 'Time-in already recorded for this session' });
      }

      let status = 'Present';
      let fineAmount = 0;
      let fineReason = '';

      // Determine status based on time
      if (isLateTimeIn) {
        status = 'Late';
        fineAmount = activity.fines?.lateAmount || 0;
        fineReason = `Late attendance for ${activity.name} (${period})`;
      } else {
        // Check if within cutoff
        if (period === 'AM' && currentTime > activity.amTimeInCutoff) {
          status = 'Late';
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late attendance for ${activity.name} (AM)`;
        } else if (period === 'PM' && currentTime > activity.pmTimeInCutoff) {
          status = 'Late';
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late attendance for ${activity.name} (PM)`;
        }
      }

      if (existingAttendance) {
        // Update existing record with time-in
        existingAttendance.timeIn = now;
        existingAttendance.status = status;
        await existingAttendance.save();
      } else {
        // Create new attendance record
        existingAttendance = new Attendance({
          studentId,
          activityId,
          period,
          timeIn: now,
          status,
        });
        await existingAttendance.save();
      }

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

      return res.status(201).json(existingAttendance);
    } 
    else if (isTimeOut) {
      // TIME-OUT LOGIC
      if (!existingAttendance || !existingAttendance.timeIn) {
        return res.status(400).json({ 
          message: 'No time-in record found. Please check in first.',
          code: 'NO_TIME_IN'
        });
      }

      if (existingAttendance.timeOut) {
        return res.status(400).json({ 
          message: 'Time-out already recorded for this session',
          code: 'DUPLICATE_TIME_OUT'
        });
      }

      // Check if time-out is late
      let status = existingAttendance.status; // Keep existing status
      let fineAmount = 0;
      let fineReason = '';

      if (period === 'AM') {
        if (currentTime > activity.amTimeOutCutoff) {
          // Late time-out
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late time-out for ${activity.name} (AM)`;
        }
      } else if (period === 'PM') {
        if (currentTime > activity.pmTimeOutCutoff) {
          // Late time-out
          fineAmount = activity.fines?.lateAmount || 0;
          fineReason = `Late time-out for ${activity.name} (PM)`;
        }
      }

      // Update with time-out
      existingAttendance.timeOut = now;
      await existingAttendance.save();

      if (fineAmount > 0) {
        await Fine.create({
          studentId: student._id,
          amount: fineAmount,
          reason: fineReason,
        });
      }

      await ActivityLog.create({
        action: 'attendance_out',
        description: `${student.name} checked out for ${period} session`,
        details: { studentId, activityId, period },
      });

      return res.json(existingAttendance);
    } 
    else {
      // Not within any valid time window
      let message = 'Not within any valid time window for this activity.';
      
      if (period === 'AM') {
        message = `Current time (${currentTime}) is outside the valid windows. Time-in: ${activity.amTimeInStart}-${activity.amTimeInCutoff}, Time-out: ${activity.amTimeOutStart}-${activity.amTimeOutCutoff}`;
      } else if (period === 'PM') {
        message = `Current time (${currentTime}) is outside the valid windows. Time-in: ${activity.pmTimeInStart}-${activity.pmTimeInCutoff}, Time-out: ${activity.pmTimeOutStart}-${activity.pmTimeOutCutoff}`;
      }
      
      return res.status(400).json({ 
        message,
        code: 'INVALID_TIME'
      });
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
