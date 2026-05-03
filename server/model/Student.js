const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    course: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

studentSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
