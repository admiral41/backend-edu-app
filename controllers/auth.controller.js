const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Lecturer = require("../models/lecturer.model");
const httpStatus = require("http-status");
const helper = require("../helpers/mailer");
const { generator, responseHandler } = require("../helpers/index");
const { sendErrorResponse, sendSuccessResponse } = responseHandler;
const { generateRandomNum } = generator;
const { validationResult } = require("express-validator");
const upload = require('../middlewares/multer');

// ======================= LEARNER SIGNUP =======================
exports.learnerSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: errors.array()[0].msg 
      });
    }

    const { 
      email, 
      password, 
      firstname, 
      lastname, 
      phone, 
      dob, 
      gender, 
      address,
      city,
      province,
      currentLevel,
      stream,
      schoolCollege
    } = req.body;

    // Check if user exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.CONFLICT, 
        msg: "Email already registered" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const verificationCode = generateRandomNum(100000, 999999);

    // Create learner user
    const user = await User.create({
      email,
      firstname,
      lastname,
      phone,
      dob: dob ? new Date(dob) : null,
      gender,
      address,
      city,
      province,
      currentLevel,
      stream,
      schoolCollege,
      hash,
      salt,
      verificationCode,
      roles: ['LEARNER'],
      isVerified: false
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URI}/verify-email/${user._id}/${verificationCode}`;
    try {
      await helper.sendVerificationMail({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        link: verificationLink
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate token
    const token = await generateToken(user._id);

    const { hash: _, salt: __, verificationCode: ___, ...responseBody } = user.toJSON();
    
    return sendSuccessResponse({
      res,
      status: httpStatus.CREATED,
      msg: "Learner registration successful. Please verify your email.",
      data: responseBody,
      token
    });

  } catch (err) {
    console.error('Learner signup error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to register learner.", 
      err: err.message 
    });
  }
};

// ======================= LECTURER SIGNUP =======================
exports.lecturerSignup = async (req, res) => {
  const uploadFile = upload.any();
  
  uploadFile(req, res, async (err) => {
    try {
      if (err) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: "File upload failed: " + err.message 
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: errors.array()[0].msg 
        });
      }

      const {
        email,
        password,
        firstname,
        lastname,
        phone,
        dob,
        gender,
        address,
        city,
        province,
        highestEducation,
        universityCollege,
        majorSpecialization,
        teachingExperience,
        employmentStatus,
        preferredLevel,
        subjects,
        availability,
        teachingMotivation
      } = req.body;

      // Check if user exists
      let userExists = await User.findOne({ email });
      if (userExists) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.CONFLICT, 
          msg: "Email already registered" 
        });
      }

      // Parse subjects if it's a string
      let subjectsArray = [];
      if (subjects) {
        if (typeof subjects === 'string') {
          subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
        } else if (Array.isArray(subjects)) {
          subjectsArray = subjects;
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const verificationCode = generateRandomNum(100000, 999999);

      // Create lecturer user (ONLY LEARNER role initially)
      const user = await User.create({
        email,
        firstname,
        lastname,
        phone,
        dob: dob ? new Date(dob) : null,
        gender,
        address,
        city,
        province,
        highestEducation,
        universityCollege,
        majorSpecialization,
        teachingExperience: parseInt(teachingExperience) || 0,
        employmentStatus,
        preferredLevel,
        subjects: subjectsArray,
        availability,
        teachingMotivation,
        hash,
        salt,
        verificationCode,
        roles: ['LEARNER'], // Only LEARNER role initially
        isLecturerApplicant: true, // Flag to identify lecturer applicants
        isVerified: false
      });

      // Handle file uploads
      let cvPath = '';
      let certificates = [];

      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.fieldname === 'cv') {
            cvPath = file.path;
          } else if (file.fieldname === 'certificates') {
            certificates.push(file.path);
          }
        });
      }

      if (!cvPath) {
        // Rollback user creation if CV is missing
        await User.findByIdAndDelete(user._id);
        return sendErrorResponse({
          res,
          status: httpStatus.BAD_REQUEST,
          msg: "CV file is required"
        });
      }

      // Create lecturer request
      const lecturerRequest = await Lecturer.create({
        user: user._id,
        cv: cvPath,
        certificates: certificates,
        requestStatus: 'pending'
      });

      // Send verification email
      const verificationLink = `${process.env.FRONTEND_URI}/verify-email/${user._id}/${verificationCode}`;
      try {
        await helper.sendVerificationMail({
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          link: verificationLink
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      // Notify admin about new lecturer request
      try {
        await notifyAdminAboutLecturerRequest(user, lecturerRequest);
      } catch (notifyError) {
        console.error('Failed to notify admin:', notifyError);
      }

      // Generate token (they can login as learner while waiting for approval)
      const token = await generateToken(user._id);

      const { hash: _, salt: __, verificationCode: ___, ...responseBody } = user.toJSON();
      
      return sendSuccessResponse({
        res,
        status: httpStatus.CREATED,
        msg: "Lecturer registration submitted. Please verify your email. Your application is pending admin approval. You can login as a learner in the meantime.",
        data: {
          user: responseBody,
          lecturerRequest: {
            id: lecturerRequest._id,
            requestStatus: lecturerRequest.requestStatus
          }
        },
        token
      });

    } catch (err) {
      console.error('Lecturer signup error:', err);
      return sendErrorResponse({ 
        res, 
        status: httpStatus.INTERNAL_SERVER_ERROR, 
        msg: "Failed to register as lecturer.", 
        err: err.message 
      });
    }
  });
};

// ======================= LOGIN (UPDATED FOR LECTURER APPLICANTS) =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Email and password are required." 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Invalid email or password." 
      });
    }

    // Check if suspended
    if (user.isSuspended) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "Account is suspended. Contact administrator." 
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.UNAUTHORIZED, 
        msg: "Please verify your email first." 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.hash);
    if (!validPassword) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.UNAUTHORIZED, 
        msg: "Invalid email or password." 
      });
    }

    // Generate token
    const token = await generateToken(user._id);

    // Remove sensitive data
    const { hash, salt, verificationCode, ...responseBody } = user.toJSON();
    
    // Check lecturer status
    if (user.roles.includes('LECTURER')) {
      // User already has LECTURER role - check if approved
      const lecturerProfile = await Lecturer.findOne({ 
        user: user._id,
        requestStatus: 'approved'
      });
      
      if (!lecturerProfile || !lecturerProfile.isActive) {
        responseBody.lecturerStatus = 'pending';
      } else {
        responseBody.lecturerStatus = 'approved';
        responseBody.lecturerProfile = lecturerProfile;
      }
    } else if (user.isLecturerApplicant) {
      // User applied for lecturer but not approved yet
      const lecturerRequest = await Lecturer.findOne({ 
        user: user._id 
      });
      
      responseBody.lecturerStatus = lecturerRequest ? lecturerRequest.requestStatus : 'not_applied';
      responseBody.isLecturerApplicant = true;
    }

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Login successful.",
      data: responseBody, 
      token 
    });

  } catch (err) {
    console.error('Login error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Login failed.", 
      err: err.message 
    });
  }
};

// ======================= VERIFY EMAIL =======================
exports.verifyEmail = async (req, res) => {
  try {
    const { id, code } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "User not found." 
      });
    }

    if (user.isVerified) {
      return sendSuccessResponse({ 
        res, 
        status: httpStatus.OK, 
        msg: "Email already verified." 
      });
    }

    if (!user.verificationCode || user.verificationCode.toString() !== code.toString()) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Invalid verification code." 
      });
    }

    user.isVerified = true;
    await user.save();

    // If this is a lecturer applicant, notify admin again
    if (user.isLecturerApplicant) {
      const lecturerRequest = await Lecturer.findOne({ user: user._id });
      if (lecturerRequest && lecturerRequest.requestStatus === 'pending') {
        try {
          await notifyAdminAboutLecturerRequest(user, lecturerRequest);
        } catch (notifyError) {
          console.error('Failed to notify admin after verification:', notifyError);
        }
      }
    }

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Email verified successfully. You can now login." 
    });

  } catch (err) {
    console.error('Email verification error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Email verification failed.", 
      err: err.message 
    });
  }
};

// ======================= GET PROFILE =======================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-hash -salt -verificationCode -__v')
      .lean();

    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.NOT_FOUND,
        msg: "User not found."
      });
    }

    // Check lecturer status
    if (user.roles.includes('LECTURER')) {
      const lecturerProfile = await Lecturer.findOne({ 
        user: user._id,
        requestStatus: 'approved'
      }).lean();
      
      if (lecturerProfile) {
        user.lecturerProfile = lecturerProfile;
        user.lecturerStatus = 'approved';
      }
    } else if (user.isLecturerApplicant) {
      const lecturerRequest = await Lecturer.findOne({ user: user._id }).lean();
      user.lecturerStatus = lecturerRequest ? lecturerRequest.requestStatus : 'not_applied';
    }

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: user,
      msg: "Profile retrieved successfully."
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to get profile.",
      err: err.message
    });
  }
};

// ======================= FORGOT PASSWORD =======================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendErrorResponse({
        res,
        status: httpStatus.BAD_REQUEST,
        msg: "Email is required."
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return sendSuccessResponse({
        res,
        status: httpStatus.OK,
        msg: "If an account exists with this email, you will receive a password reset link."
      });
    }

    // Generate reset token
    const resetToken = generateRandomNum(100000, 999999);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URI}/reset-password/${resetToken}`;
    
    try {
      await helper.sendPasswordResetMail({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        link: resetLink
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      msg: "If an account exists with this email, you will receive a password reset link."
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to process password reset.",
      err: err.message
    });
  }
};

// ======================= REFRESH TOKEN =======================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendErrorResponse({
        res,
        status: httpStatus.BAD_REQUEST,
        msg: "Refresh token is required."
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || process.env.SESSION_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.UNAUTHORIZED,
        msg: "Invalid refresh token."
      });
    }

    // Generate new access token
    const newAccessToken = await generateToken(user._id);

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: { accessToken: newAccessToken },
      msg: "Token refreshed successfully."
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.UNAUTHORIZED,
      msg: "Invalid or expired refresh token."
    });
  }
};

// ======================= HELPER FUNCTIONS =======================
const generateToken = async (userId) => {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const token = jwt.sign(
    payload, 
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-secret-key-change-in-production', 
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
  
  return { token, refreshToken };
};

const notifyAdminAboutLecturerRequest = async (user, lecturerRequest) => {
  try {
    // Find all admin users
    const admins = await User.find({ 
      roles: { $in: ['ADMIN', 'SUPERADMIN'] } 
    });

    // Send email notification to each admin
    for (const admin of admins) {
      try {
        await helper.sendLecturerRequestNotification({
          adminEmail: admin.email,
          adminName: `${admin.firstname} ${admin.lastname}`,
          applicantName: `${user.firstname} ${user.lastname}`,
          applicantEmail: user.email,
          applicationId: lecturerRequest._id,
          dashboardLink: `${process.env.ADMIN_DASHBOARD_URI || process.env.FRONTEND_URI}/admin/lecturers/pending`
        });
      } catch (emailError) {
        console.error(`Failed to send notification to admin ${admin.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Failed to notify admin:', error);
    throw error;
  }
};

// NEW: Send approval email to lecturer
const sendLecturerApprovalEmail = async (user) => {  
  try {
    await helper.sendLecturerApprovalMail({  
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      loginLink: `${process.env.FRONTEND_URI}/login`,
      dashboardLink: `${process.env.FRONTEND_URI}/lecturer/dashboard`
    });
  } catch (error) {
    console.error('Failed to send lecturer approval email:', error);
    throw error;
  }
};

// NEW: Send rejection email to lecturer
const sendLecturerRejectionEmail = async (user, reason = '') => {  
  try {
    await helper.sendLecturerRejectionMail({ 
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      reason: reason
    });
  } catch (error) {
    console.error('Failed to send lecturer rejection email:', error);
    throw error;
  }
};