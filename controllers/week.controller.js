const httpStatus = require('http-status');
const Week = require('../models/weeks');
const Course = require('../models/course.model');
const Lesson = require('../models/lessons');
const { responseHandler } = require('../helpers/index');
const { sendErrorResponse, sendSuccessResponse } = responseHandler;

// ======================= CREATE WEEK =======================
exports.createWeek = async (req, res) => {
  try {
    const { courseId, title, description, objectives } = req.body;

    // Check if course exists and user has permission
    const course = await Course.findById(courseId);
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Course not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to add weeks to this course" 
      });
    }

    // Get next week number
    const lastWeek = await Week.findOne({ course: courseId })
      .sort({ weekNumber: -1 })
      .select('weekNumber');

    const weekNumber = lastWeek ? lastWeek.weekNumber + 1 : 1;

    // Create week
    const week = await Week.create({
      course: courseId,
      title,
      weekNumber,
      description: description || '',
      objectives: objectives || [],
      createdBy: req.user._id
    });

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.CREATED, 
      msg: "Week created successfully", 
      data: week 
    });
  } catch (error) {
    console.error('Create week error:', error);
    
    // Handle duplicate week number error
    if (error.code === 11000) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.CONFLICT, 
        msg: "Week number already exists for this course" 
      });
    }
    
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to create week" 
    });
  }
};

// ======================= UPDATE WEEK =======================
exports.updateWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    const { title, description, objectives, isPublished } = req.body;

    const week = await Week.findById(weekId).populate('course');
    if (!week) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Week not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await week.course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to update this week" 
      });
    }

    // Update week
    const updatedWeek = await Week.findByIdAndUpdate(
      weekId,
      {
        $set: {
          title: title || week.title,
          description: description !== undefined ? description : week.description,
          objectives: objectives || week.objectives,
          isPublished: isPublished !== undefined ? isPublished : week.isPublished
        }
      },
      { new: true, runValidators: true }
    );

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Week updated successfully", 
      data: updatedWeek 
    });
  } catch (error) {
    console.error('Update week error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to update week" 
    });
  }
};

// ======================= DELETE WEEK =======================
exports.deleteWeek = async (req, res) => {
  try {
    const { weekId } = req.params;

    const week = await Week.findById(weekId).populate('course');
    if (!week) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Week not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await week.course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to delete this week" 
      });
    }

    // Check if week has lessons
    const lessonCount = await Lesson.countDocuments({ week: weekId });
    if (lessonCount > 0) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Cannot delete week with existing lessons. Delete lessons first." 
      });
    }

    await Week.findByIdAndDelete(weekId);

    // Reorder remaining weeks
    await Week.updateMany(
      { 
        course: week.course._id,
        weekNumber: { $gt: week.weekNumber }
      },
      { $inc: { weekNumber: -1 } }
    );

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Week deleted successfully" 
    });
  } catch (error) {
    console.error('Delete week error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to delete week" 
    });
  }
};

// ======================= GET WEEK BY ID =======================
exports.getWeek = async (req, res) => {
  try {
    const { weekId } = req.params;

    const week = await Week.findById(weekId)
      .populate('course', 'courseTitle courseSlug')
      .populate('createdBy', 'firstname lastname email');

    if (!week) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Week not found" 
      });
    }

    // Get lessons for this week
    const lessons = await Lesson.find({ week: weekId })
      .sort({ order: 1 })
      .select('lessonTitle lessonSlug lessonType duration order isPublished');

    const weekData = week.toObject();
    weekData.lessons = lessons;
    weekData.lessonCount = lessons.length;

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Week retrieved successfully", 
      data: weekData 
    });
  } catch (error) {
    console.error('Get week error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to get week" 
    });
  }
};

// ======================= GET ALL WEEKS FOR COURSE =======================
exports.getCourseWeeks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Course not found" 
      });
    }

    // Filter based on user role
    let filter = { course: courseId };
    
    // Non-admins and non-lecturers can only see published weeks
    if (!req.user.roles.includes('ADMIN') && 
        !req.user.roles.includes('SUPERADMIN') && 
        !req.user.roles.includes('LECTURER')) {
      filter.isPublished = true;
    }

    const weeks = await Week.find(filter)
      .sort({ weekNumber: 1 })
      .populate({
        path: 'lessons',
        select: 'lessonTitle lessonSlug lessonType duration order',
        match: { isPublished: true }
      });

    // Add lesson count to each week
    const weeksWithStats = await Promise.all(
      weeks.map(async (week) => {
        const weekObj = week.toObject();
        const lessonCount = await Lesson.countDocuments({ week: week._id, isPublished: true });
        weekObj.lessonCount = lessonCount;
        return weekObj;
      })
    );

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Weeks retrieved successfully", 
      data: weeksWithStats 
    });
  } catch (error) {
    console.error('Get course weeks error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to get weeks" 
    });
  }
};

// ======================= REORDER WEEKS =======================
exports.reorderWeeks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { weekOrder } = req.body; // Array of week IDs in new order

    if (!Array.isArray(weekOrder) || weekOrder.length === 0) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Week order array is required" 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Course not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to reorder weeks" 
      });
    }

    // Update week numbers
    const bulkOps = weekOrder.map((weekId, index) => ({
      updateOne: {
        filter: { _id: weekId, course: courseId },
        update: { weekNumber: index + 1 }
      }
    }));

    await Week.bulkWrite(bulkOps);

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Weeks reordered successfully" 
    });
  } catch (error) {
    console.error('Reorder weeks error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to reorder weeks" 
    });
  }
};