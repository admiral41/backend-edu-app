const User = require("../models/user.model");
const Lecturer = require("../models/lecturer.model");
const Course = require("../models/course.model");
const httpStatus = require("http-status");
const { responseHandler } = require("../helpers/index");
const { sendErrorResponse, sendSuccessResponse } = responseHandler;

// ======================= DASHBOARD STATS =======================
exports.getDashboardStats = async (req, res) => {
  try {
    // Get date for "this month" calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User counts
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      newUsersThisMonth,
      suspendedUsers
    ] = await Promise.all([
      User.countDocuments({ roles: { $nin: ['SUPERADMIN'] } }),
      User.countDocuments({
        roles: { $in: ['LEARNER'], $nin: ['LECTURER', 'ADMIN', 'SUPERADMIN'] }
      }),
      User.countDocuments({ roles: { $in: ['LECTURER'] } }),
      User.countDocuments({
        roles: { $nin: ['SUPERADMIN'] },
        createdAt: { $gte: startOfMonth }
      }),
      User.countDocuments({
        roles: { $nin: ['SUPERADMIN'] },
        isSuspended: true
      })
    ]);

    // Course counts
    const [
      totalCourses,
      publishedCourses,
      pendingCourses,
      draftCourses
    ] = await Promise.all([
      Course.countDocuments({}),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'pending_approval' }),
      Course.countDocuments({ status: 'draft' })
    ]);

    // Pending instructor applications
    const pendingApplications = await Lecturer.countDocuments({
      requestStatus: 'pending'
    });

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          newThisMonth: newUsersThisMonth,
          suspended: suspendedUsers
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          pendingApproval: pendingCourses,
          draft: draftCourses
        },
        applications: {
          pending: pendingApplications
        }
      },
      msg: "Dashboard stats retrieved successfully."
    });

  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to get dashboard stats.",
      err: err.message
    });
  }
};

// ======================= GET ALL USERS =======================
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = 'all',
      status = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};

    // Exclude superadmins from list
    query.roles = { $nin: ['SUPERADMIN'] };

    // Role filter
    if (role === 'student') {
      query.roles = { $in: ['LEARNER'], $nin: ['LECTURER', 'ADMIN', 'SUPERADMIN'] };
    } else if (role === 'instructor') {
      query.roles = { $in: ['LECTURER'] };
    } else if (role === 'admin') {
      query.roles = { $in: ['ADMIN'] };
    }

    // Status filter
    if (status === 'active') {
      query.isSuspended = false;
    } else if (status === 'suspended') {
      query.isSuspended = true;
    }

    // Search filter
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-hash -salt -verificationCode')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get counts for tabs
    const studentCount = await User.countDocuments({
      roles: { $in: ['LEARNER'], $nin: ['LECTURER', 'ADMIN', 'SUPERADMIN'] }
    });
    const instructorCount = await User.countDocuments({
      roles: { $in: ['LECTURER'] }
    });

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        counts: {
          total: studentCount + instructorCount,
          students: studentCount,
          instructors: instructorCount
        }
      },
      msg: "Users retrieved successfully."
    });

  } catch (err) {
    console.error('Get all users error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to get users.",
      err: err.message
    });
  }
};

// ======================= GET USER BY ID =======================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-hash -salt -verificationCode');

    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.NOT_FOUND,
        msg: "User not found."
      });
    }

    // If user is a lecturer, get lecturer details
    let lecturerDetails = null;
    if (user.roles.includes('LECTURER')) {
      lecturerDetails = await Lecturer.findOne({ user: id });
    }

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: {
        user,
        lecturerDetails
      },
      msg: "User retrieved successfully."
    });

  } catch (err) {
    console.error('Get user by ID error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to get user.",
      err: err.message
    });
  }
};

// ======================= SUSPEND USER =======================
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.NOT_FOUND,
        msg: "User not found."
      });
    }

    // Don't allow suspending admins
    if (user.roles.includes('ADMIN') || user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({
        res,
        status: httpStatus.FORBIDDEN,
        msg: "Cannot suspend admin users."
      });
    }

    user.isSuspended = true;
    await user.save();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: { user },
      msg: "User suspended successfully."
    });

  } catch (err) {
    console.error('Suspend user error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to suspend user.",
      err: err.message
    });
  }
};

// ======================= ACTIVATE USER =======================
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.NOT_FOUND,
        msg: "User not found."
      });
    }

    user.isSuspended = false;
    await user.save();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: { user },
      msg: "User activated successfully."
    });

  } catch (err) {
    console.error('Activate user error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to activate user.",
      err: err.message
    });
  }
};

// ======================= DELETE USER =======================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse({
        res,
        status: httpStatus.NOT_FOUND,
        msg: "User not found."
      });
    }

    // Don't allow deleting admins
    if (user.roles.includes('ADMIN') || user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({
        res,
        status: httpStatus.FORBIDDEN,
        msg: "Cannot delete admin users."
      });
    }

    // Delete associated lecturer record if exists
    if (user.roles.includes('LECTURER')) {
      await Lecturer.findOneAndDelete({ user: id });
    }

    await User.findByIdAndDelete(id);

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      msg: "User deleted successfully."
    });

  } catch (err) {
    console.error('Delete user error:', err);
    return sendErrorResponse({
      res,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      msg: "Failed to delete user.",
      err: err.message
    });
  }
};
