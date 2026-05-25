// import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
// import config from '../config/config.js';
import admin from '../config/firebaseAdmin.js'; // Ensure this path is correct


export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);

    const decodedToken = await admin.auth().verifyIdToken(token); //it is part of firebase authentication it checks if token is valid or not
    console.log('Decoded Token:', decodedToken);
  
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    console.log("User found in database:", user);
    if (!user) {
      return res.status(401).send({ message: 'User not found' });
    }

    req.user = {
      _id: user._id,
      firebaseUid: decodedToken.uid,
      email: user.email,
      name: user.name || 'Anonymous', // Default if name is missing
      role: user.role || 'student'   // Default if role is missing
    };

    next();
  } catch (error) {
    res.status(401).send({ message: 'Not authorized', error: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User Role:", req.user.role);
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ 
        message: 'Not authorized to access this route' 
      });
    }
    next();
  };
};