const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
    },
    period: {
      type: String,
      enum: ['AM', 'PM'],
      required: true,
    },
    timeIn: {
      type: Date,
      default: null,
    },
    timeOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent'],
      default: 'Absent',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
