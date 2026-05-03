const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      enum: ['AM Only', 'PM Only', 'Full Day'],
      default: 'Full Day',
    },
    // AM Time-In
    amTimeInStart: {
      type: String,
      default: '08:00',
    },
    amTimeInCutoff: {
      type: String,
      default: '08:30',
    },
    // AM Time-Out
    amTimeOutStart: {
      type: String,
      default: '11:30',
    },
    amTimeOutCutoff: {
      type: String,
      default: '12:00',
    },
    // PM Time-In
    pmTimeInStart: {
      type: String,
      default: '13:00',
    },
    pmTimeInCutoff: {
      type: String,
      default: '13:30',
    },
    // PM Time-Out
    pmTimeOutStart: {
      type: String,
      default: '16:30',
    },
    pmTimeOutCutoff: {
      type: String,
      default: '17:00',
    },
    fines: {
      lateAmount: {
        type: Number,
        default: 50,
      },
      absentAmount: {
        type: Number,
        default: 100,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
