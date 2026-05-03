const Attendance = require('../model/Attendance');
const Fine = require('../model/Fine');
const Student = require('../model/Student');
const Activity = require('../model/Activity');

exports.generateReport = async (req, res) => {
  try {
    const { course, startDate, endDate } = req.body;

    let studentQuery = {};
    if (course) {
      studentQuery.course = course;
    }

    const students = await Student.find(studentQuery);
    const studentIds = students.map((s) => s._id);

    let attendanceQuery = {};
    if (startDate || endDate) {
      attendanceQuery.createdAt = {};
      if (startDate) attendanceQuery.createdAt.$gte = new Date(startDate);
      if (endDate) attendanceQuery.createdAt.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(attendanceQuery);
    const fines = await Fine.find({ studentId: { $in: studentIds } });

    const studentRecords = students.map((student) => {
      const studentAttendance = attendance.filter((a) => a.studentId === student.studentId);
      const studentFines = fines.filter((f) => f.studentId.toString() === student._id.toString());

      const presentCount = studentAttendance.filter((a) => a.status === 'Present').length;
      const lateCount = studentAttendance.filter((a) => a.status === 'Late').length;
      const absentCount = studentAttendance.filter((a) => a.status === 'Absent').length;
      const totalFines = studentFines.reduce((sum, f) => sum + f.amount, 0);

      return {
        studentId: student._id,
        studentName: student.name,
        presentCount,
        lateCount,
        absentCount,
        totalFines,
      };
    });

    const totalAttendance = attendance.length;
    const totalFinesAmount = fines.reduce((sum, f) => sum + f.amount, 0);

    res.json({
      totalStudents: students.length,
      totalAttendance,
      totalFines: totalFinesAmount,
      studentRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
