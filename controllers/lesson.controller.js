const httpStatus = require('http-status');
const Lesson = require('../models/lessons');
const Week = require('../models/weeks');
const Course = require('../models/course.model');
const { responseHandler } = require('../helpers/index');
const { sendErrorResponse, sendSuccessResponse } = responseHandler;

// ======================= CREATE LESSON =======================
exports.createLesson = async (req, res) => {
  try {
    const { 
      weekId, 
      lessonTitle, 
      lessonContent, 
      lessonType, 
      videoUrl, 
      duration,
      attachments,
      prerequisites
    } = req.body;

    // Check if week exists
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
        msg: "You don't have permission to add lessons to this course" 
      });
    }

    // Get next order number
    const lastLesson = await Lesson.findOne({ week: weekId })
      .sort({ order: -1 })
      .select('order');

    const order = lastLesson ? lastLesson.order + 1 : 1;

    // Validate video URL for video lessons
    if (lessonType === 'video' && !videoUrl) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Video URL is required for video lessons" 
      });
    }

    // Create lesson
    const lesson = await Lesson.create({
      week: weekId,
      lessonTitle,
      lessonContent,
      lessonType: lessonType || 'article',
      videoUrl: lessonType === 'video' ? videoUrl : undefined,
      duration: duration || 0,
      order,
      attachments: attachments || [],
      prerequisites: prerequisites || [],
      createdBy: req.user._id
    });

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.CREATED, 
      msg: "Lesson created successfully", 
      data: lesson 
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    
    if (error.code === 11000) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.CONFLICT, 
        msg: "Lesson with this title already exists" 
      });
    }
    
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to create lesson" 
    });
  }
};

// ======================= UPDATE LESSON =======================
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { 
      lessonTitle, 
      lessonContent, 
      lessonType, 
      videoUrl, 
      duration,
      attachments,
      prerequisites,
      isPublished
    } = req.body;

    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'week',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Lesson not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await lesson.week.course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to update this lesson" 
      });
    }

    // Validate video URL if changing to video type
    if (lessonType === 'video' && !videoUrl && lesson.lessonType !== 'video') {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Video URL is required for video lessons" 
      });
    }

    // Update lesson
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        $set: {
          lessonTitle: lessonTitle || lesson.lessonTitle,
          lessonContent: lessonContent || lesson.lessonContent,
          lessonType: lessonType || lesson.lessonType,
          videoUrl: lessonType === 'video' ? videoUrl : lesson.videoUrl,
          duration: duration !== undefined ? duration : lesson.duration,
          attachments: attachments || lesson.attachments,
          prerequisites: prerequisites || lesson.prerequisites,
          isPublished: isPublished !== undefined ? isPublished : lesson.isPublished
        }
      },
      { new: true, runValidators: true }
    );

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lesson updated successfully", 
      data: updatedLesson 
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to update lesson" 
    });
  }
};

// ======================= DELETE LESSON =======================
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'week',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Lesson not found" 
      });
    }

    // Check if user can modify this course
    const canModify = await lesson.week.course.canUserEdit(req.user._id, req.user.roles);
    if (!canModify) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: "You don't have permission to delete this lesson" 
      });
    }

    await Lesson.findByIdAndDelete(lessonId);

    // Reorder remaining lessons
    await Lesson.updateMany(
      { 
        week: lesson.week._id,
        order: { $gt: lesson.order }
      },
      { $inc: { order: -1 } }
    );

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lesson deleted successfully" 
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to delete lesson" 
    });
  }
};

// ======================= GET LESSON BY ID =======================
exports.getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'week',
        select: 'title weekNumber',
        populate: {
          path: 'course',
          select: 'courseTitle courseSlug'
        }
      })
      .populate('prerequisites', 'lessonTitle lessonSlug')
      .populate('createdBy', 'firstname lastname email userImage');

    if (!lesson) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Lesson not found" 
      });
    }

    // Check if user can view this lesson
    if (!lesson.isPublished) {
      const canView = await lesson.week.course.canUserEdit(req.user._id, req.user.roles);
      if (!canView) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.FORBIDDEN, 
          msg: "This lesson is not published" 
        });
      }
    }

    // Increment view count
    await lesson.incrementViews();

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lesson retrieved successfully", 
      data: lesson 
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to get lesson" 
    });
  }
};

// ======================= GET LESSONS BY WEEK =======================
exports.getWeekLessons = async (req, res) => {
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

    // Build filter
    let filter = { week: weekId };
    
    // Non-admins and non-lecturers can only see published lessons
    if (!req.user.roles.includes('ADMIN') && 
        !req.user.roles.includes('SUPERADMIN') && 
        !req.user.roles.includes('LECTURER')) {
      filter.isPublished = true;
    }

    const lessons = await Lesson.find(filter)
      .sort({ order: 1 })
      .select('lessonTitle lessonSlug lessonType duration order isPublished')
      .populate('prerequisites', 'lessonTitle lessonSlug');

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lessons retrieved successfully", 
      data: lessons 
    });
  } catch (error) {
    console.error('Get week lessons error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to get lessons" 
    });
  }
};

// ======================= REORDER LESSONS =======================
exports.reorderLessons = async (req, res) => {
  try {
    const { weekId } = req.params;
    const { lessonOrder } = req.body; // Array of lesson IDs in new order

    if (!Array.isArray(lessonOrder) || lessonOrder.length === 0) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Lesson order array is required" 
      });
    }

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
        msg: "You don't have permission to reorder lessons" 
      });
    }

    // Update lesson orders
    const bulkOps = lessonOrder.map((lessonId, index) => ({
      updateOne: {
        filter: { _id: lessonId, week: weekId },
        update: { order: index + 1 }
      }
    }));

    await Lesson.bulkWrite(bulkOps);

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lessons reordered successfully" 
    });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to reorder lessons" 
    });
  }
};

// ======================= MARK LESSON AS COMPLETED =======================
exports.markLessonCompleted = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: "Lesson not found" 
      });
    }

    // Increment completion count
    await lesson.incrementCompletions();

    // Here you would typically update user progress
    // For example: UserLessonProgress.findOneAndUpdate()

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: "Lesson marked as completed", 
      data: { 
        lessonId: lesson._id,
        completions: lesson.meta.completions 
      }
    });
  } catch (error) {
    console.error('Mark lesson completed error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: "Failed to mark lesson as completed" 
    });
  }
};