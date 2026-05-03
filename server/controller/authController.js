const User = require('../model/User');
const Student = require('../model/Student');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Try to find user in User collection first
    let user = await User.findOne({ email });
    let role = null;

    if (user) {
      role = user.role; // Use the role from User model
      console.log('Found in User collection, role:', role);
    }

    // If not found in User collection, try Student collection
    if (!user) {
      user = await Student.findOne({ email });
      if (user) {
        role = 'student';
        console.log('Found in Student collection');
      }
    }

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Comparing password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
    };

    // Add studentId if it's a student
    if (role === 'student' && user.studentId) {
      userResponse.studentId = user.studentId;
    }

    res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Try User collection first
    let user = await User.findById(req.user.id).select('-password');
    let isStudent = false;
    
    // If not found, try Student collection
    if (!user) {
      user = await Student.findById(req.user.id).select('-password');
      if (user) {
        isStudent = true;
        // Add role field for students since it's not in the schema
        user = user.toObject();
        user.role = 'student';
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
