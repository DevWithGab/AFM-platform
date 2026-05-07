const Fine = require('../model/Fine');
const Student = require('../model/Student');

exports.getAllFines = async (req, res) => {
  try {
    const fines = await Fine.find()
      .populate('studentId', 'name email studentId photo')
      .populate('activityId', 'name date period');
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFineById = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id)
      .populate('studentId', 'name email studentId photo')
      .populate('activityId', 'name date period');
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }
    res.json(fine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFine = async (req, res) => {
  try {
    const { studentId, amount, reason } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fine = new Fine({
      studentId,
      amount,
      reason,
    });

    await fine.save();
    const populatedFine = await Fine.findById(fine._id)
      .populate('studentId', 'name email studentId photo')
      .populate('activityId', 'name date period');
    res.status(201).json(populatedFine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFine = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate('studentId', 'name email studentId photo')
      .populate('activityId', 'name date period');

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    res.json(fine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFine = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndDelete(req.params.id);

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    res.json({ message: 'Fine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidDate: new Date() },
      { new: true }
    )
      .populate('studentId', 'name email studentId photo')
      .populate('activityId', 'name date period');

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    res.json(fine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinesByStudent = async (req, res) => {
  try {
    const fines = await Fine.find({ studentId: req.params.studentId });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
