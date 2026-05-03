const ActivityLog = require('../model/ActivityLog');

exports.getAllLogs = async (req, res) => {
  try {
    const { action } = req.query;

    let query = {};
    if (action) {
      query.action = action;
    }

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogsByAction = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ action: req.params.action })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogsByUser = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
