import userModel from "../models/userModel.js";
import admin from "../config/firebaseAdmin.js";

export const register = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the Firebase token (if Firebase Admin is configured). If not,
    // fall back to using `firebaseUid` provided in the request body.
    let firebaseUid;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      console.log("Register attempt - decoded Firebase UID:", firebaseUid);
    } catch (err) {
      console.warn('Firebase verification failed or is not configured, falling back to request body:', err?.message || err);
      firebaseUid = req.body?.firebaseUid;
    }
    console.log("Register attempt - request body:", req.body);

    // Check if user already exists
    let user = await userModel.findOne({ firebaseUid });
    console.log("Register attempt - user found in DB:", !!user);
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const { name, email, role = "student" } = req.body;
    user = await userModel.create({
      firebaseUid,
      name,
      email,
      role,
    });

    console.log("Register attempt - created user id:", user?._id);

    // Temporary: include decoded uid in response for debugging
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      decodedUid: firebaseUid,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

export const login = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the Firebase token (if configured). If verification fails,
    // fall back to finding the user by email (provided by the client).
    let firebaseUid;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      console.log("Login attempt - decoded Firebase UID:", firebaseUid);
    } catch (err) {
      console.warn('Firebase verification failed or is not configured during login:', err?.message || err);
    }

    // Find user in MongoDB either by firebaseUid (if available) or by email
    const lookup = firebaseUid ? { firebaseUid } : { email: req.body?.email };
    const user = await userModel.findOne(lookup);
    console.log("Login attempt - user found in DB:", user ? user._id : null);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the Firebase token (if configured) and determine firebaseUid.
    let firebaseUid;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      firebaseUid = decodedToken.uid;
    } catch (err) {
      console.warn('Firebase verification failed or is not configured while updating FCM token:', err?.message || err);
      firebaseUid = req.body?.firebaseUid;
    }

    // Update FCM token for the user
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    // Find and update the user
    const user = await userModel.findOneAndUpdate(
      { firebaseUid },
      { fcmToken },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Error updating FCM token",
    });
  }
};
