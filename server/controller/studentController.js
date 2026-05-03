const Student = require('../model/Student');
const ActivityLog = require('../model/ActivityLog');
const bcryptjs = require('bcryptjs');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, course, year, photo } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const defaultPassword = password || 'password123';
    const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      studentId,
      course,
      year,
      photo: photo || null,
    });

    await student.save();

    await ActivityLog.create({
      action: 'student_registered',
      description: `Student ${name} registered`,
      details: { studentId: student._id },
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // Hash password if it's being updated
    if (password) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Log the activity
    await ActivityLog.create({
      action: 'student_updated',
      description: `Student ${student.name} (${student.studentId}) updated`,
      details: { 
        studentId: student._id,
        updatedFields: Object.keys(updateData)
      },
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Log the activity
    await ActivityLog.create({
      action: 'student_deleted',
      description: `Student ${student.name} (${student.studentId}) deleted`,
      details: { studentId: student._id },
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!req.body.photo) {
      return res.status(400).json({ message: 'No photo provided' });
    }

    student.photo = req.body.photo;
    await student.save();

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
