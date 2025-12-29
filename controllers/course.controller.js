const httpStatus = require('http-status');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const Lecturer = require('../models/lecturer.model');
const Category = require('../models/category');
const Week = require('../models/weeks');
const Lesson = require('../models/lessons');
const LessonStatus = require('../models/lessonStatus');
const { responseHandler } = require('../helpers/index');
const upload = require('../middlewares/multer');
const { parseFilters, sendErrorResponse, sendQueryResponse, sendSuccessResponse } = responseHandler;
const helper = require('../helpers/mailer');

const uploadImage = upload.single('image');

// ======================= CREATE COURSE (HYBRID APPROACH) =======================
exports.createCourse = async (req, res) => {
  try {
    uploadImage(req, res, async err => {
      if (err) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: 'Failed to upload image: ' + err.message 
        });
      }

      const { 
        courseTitle, 
        courseDesc, 
        courseShortDesc, 
        duration, 
        weekly_study, 
        learn_type, 
        category, 
        price, 
        tags, 
        discount, 
        embeddedUrl,
        requirements 
      } = req.body;

      // Check if course already exists
      const existingCourse = await Course.findOne({ 
        courseTitle, 
        category 
      });
      
      if (existingCourse) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.CONFLICT, 
          msg: 'Course with this title already exists in this category.' 
        });
      }

      // Parse tags if string
      let tagsArray = [];
      if (tags) {
        if (typeof tags === 'string') {
          tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(tags)) {
          tagsArray = tags;
        }
      }

      // Determine status based on user role
      let status = 'draft';
      let creatorType = 'lecturer';
      let lecturers = [];

      if (req.user.roles.includes('SUPERADMIN') || req.user.roles.includes('ADMIN')) {
        // Admin can create and publish directly
        status = 'approved';
        creatorType = req.user.roles.includes('SUPERADMIN') ? 'superadmin' : 'admin';
        
        // If admin specifies lecturers, use them
        if (req.body.lecturers && req.body.lecturers.length > 0) {
          lecturers = req.body.lecturers;
        } else {
          // If no lecturers specified, check if current user is a lecturer
          const userLecturer = await Lecturer.findOne({ 
            user: req.user._id,
            requestStatus: 'approved',
            isActive: true 
          });
          if (userLecturer) {
            lecturers = [userLecturer._id];
          }
        }
      } else if (req.user.roles.includes('LECTURER')) {
        // Lecturer creates course - needs approval
        status = 'pending_approval';
        creatorType = 'lecturer';
        
        // Get lecturer profile
        const lecturer = await Lecturer.findOne({ 
          user: req.user._id,
          requestStatus: 'approved',
          isActive: true 
        });
        
        if (!lecturer) {
          return sendErrorResponse({ 
            res, 
            status: httpStatus.FORBIDDEN, 
            msg: 'Your lecturer account is not approved or active.' 
          });
        }
        
        lecturers = [lecturer._id];
      } else {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.FORBIDDEN, 
          msg: 'Only lecturers and admins can create courses.' 
        });
      }

      // Validate price for PAID courses
      if (learn_type === 'PAID' && (!price || price <= 0)) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: 'Price is required for PAID courses.' 
        });
      }

      // Create course
      const course = await Course.create({
        courseTitle,
        courseDesc,
        courseShortDesc: courseShortDesc || courseDesc.substring(0, 150) + '...',
        duration: parseInt(duration) || 0,
        weekly_study: parseInt(weekly_study) || 0,
        learn_type,
        category,
        price: learn_type === 'PAID' ? parseFloat(price) || 0 : 0,
        discount: parseFloat(discount) || 0,
        tags: tagsArray,
        embeddedUrl,
        requirements,
        image: req.file ? req.file.path : null,
        status,
        createdBy: req.user._id,
        creatorType,
        lecturers,
        published: status === 'approved'
      });

      // Populate response data
      await course.populate([
        {
          path: 'category',
          select: 'categoryName categorySlug'
        },
        {
          path: 'lecturers',
          select: 'user joinDate',
          populate: {
            path: 'user',
            select: 'firstname lastname email userImage'
          }
        },
        {
          path: 'createdBy',
          select: 'firstname lastname email userImage'
        }
      ]);

      // Notify admins if course is pending approval
      if (status === 'pending_approval') {
        try {
          await notifyAdminsAboutCourseRequest(course, req.user);
        } catch (notifyError) {
          console.error('Failed to notify admins:', notifyError);
        }
      }

      return sendSuccessResponse({ 
        res, 
        status: httpStatus.CREATED, 
        msg: status === 'pending_approval' 
          ? 'Course created successfully. Waiting for admin approval.' 
          : 'Course created and published successfully.',
        data: course 
      });
    });
  } catch (err) {
    console.error('Create course error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to create course.', 
      err: err.message 
    });
  }
};
// ======================= SEARCH COURSES =======================
exports.search = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, learn_type, page = 1, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return sendSuccessResponse({
        res,
        status: httpStatus.OK,
        data: [],
        msg: 'Search query must be at least 2 characters long.'
      });
    }

    // Build search filter
    let filter = {
      status: 'approved',
      published: true
    };

    // Fuzzy search on courseTitle and courseDesc
    const searchResults = await Course.fuzzySearch(query)
      .where(filter);

    // Apply additional filters
    if (category) {
      const categoryObj = await Category.findOne({ categorySlug: category });
      if (categoryObj) {
        // Get all descendant categories
        const descendantCategories = await categoryObj.getDescendantCategories();
        const allCategoryIds = [categoryObj._id, ...descendantCategories.map(cat => cat._id)];
        
        searchResults.find({ category: { $in: allCategoryIds } });
      }
    }

    if (learn_type) {
      searchResults.find({ learn_type });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      searchResults.find({ price: priceFilter });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const courses = await searchResults
      .populate([
        {
          path: 'category',
          select: 'categoryName categorySlug'
        },
        {
          path: 'lecturers',
          select: 'user',
          populate: {
            path: 'user',
            select: 'firstname lastname email userImage'
          }
        },
        {
          path: 'createdBy',
          select: 'firstname lastname email userImage'
        }
      ])
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-courseTitle_fuzzy -courseDesc_fuzzy');

    const total = await Course.fuzzySearch(query)
      .where(filter)
      .countDocuments();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      msg: 'Search results retrieved successfully.'
    });
  } catch (error) {
    console.error('Search courses error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to search courses.' 
    });
  }
};
// ======================= ADMIN: APPROVE/REJECT COURSE =======================
exports.processCourseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, publishDirectly = false } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: "Invalid action. Use 'approve' or 'reject'." 
      });
    }

    // Check admin privileges
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: 'Admin privileges required.' 
      });
    }

    const course = await Course.findById(id)
      .populate('createdBy', 'firstname lastname email')
      .populate({
        path: 'lecturers',
        populate: {
          path: 'user',
          select: 'firstname lastname email'
        }
      });

    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    if (course.status !== 'pending_approval') {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Course is not pending approval.' 
      });
    }

    if (action === 'approve') {
      // Update course status
      course.status = 'approved';
      course.published = publishDirectly;
      
      if (publishDirectly) {
        course.publishedAt = new Date();
      }

      // Add admin note
      course.adminNotes.push({
        note: `Course approved by ${req.user.firstname} ${req.user.lastname}. ${reason ? 'Reason: ' + reason : ''}`,
        addedBy: req.user._id
      });

      await course.save();

      // Notify course creator
      try {
        await helper.sendCourseApprovalMail({
          email: course.createdBy.email,
          firstname: course.createdBy.firstname,
          lastname: course.createdBy.lastname,
          courseTitle: course.courseTitle,
          courseLink: `${process.env.FRONTEND_URI}/courses/${course.courseSlug}`,
          publishDirectly
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      return sendSuccessResponse({
        res,
        status: httpStatus.OK,
        msg: publishDirectly 
          ? 'Course approved and published successfully.' 
          : 'Course approved successfully.',
        data: course
      });

    } else { // reject
      if (!reason || reason.trim().length < 10) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: 'Rejection reason is required (minimum 10 characters).' 
        });
      }

      // Update course status
      course.status = 'rejected';
      course.rejectionReason = reason;
      
      // Add admin note
      course.adminNotes.push({
        note: `Course rejected by ${req.user.firstname} ${req.user.lastname}. Reason: ${reason}`,
        addedBy: req.user._id
      });

      await course.save();

      // Notify course creator
      try {
        await helper.sendCourseRejectionMail({
          email: course.createdBy.email,
          firstname: course.createdBy.firstname,
          lastname: course.createdBy.lastname,
          courseTitle: course.courseTitle,
          reason: reason
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      return sendSuccessResponse({
        res,
        status: httpStatus.OK,
        msg: 'Course rejected successfully.',
        data: course
      });
    }

  } catch (err) {
    console.error('Process course request error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to process course request.', 
      err: err.message 
    });
  }
};

// ======================= UPDATE COURSE =======================
exports.updateCourse = async (req, res) => {
  try {
    uploadImage(req, res, async err => {
      if (err) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.BAD_REQUEST, 
          msg: 'Failed to upload image.' 
        });
      }

      const { slug } = req.params;
      const { 
        courseTitle, 
        courseDesc, 
        courseShortDesc, 
        duration, 
        weekly_study, 
        learn_type, 
        category, 
        price, 
        tags, 
        discount, 
        embeddedUrl,
        requirements 
      } = req.body;

      // Find course
      const course = await Course.findOne({ courseSlug: slug });
      
      if (!course) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.NOT_FOUND, 
          msg: 'Course not found.' 
        });
      }

      // Check if user can edit this course
      const canEdit = await course.canUserEdit(req.user._id, req.user.roles);
      if (!canEdit) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.FORBIDDEN, 
          msg: 'You do not have permission to edit this course.' 
        });
      }

      // Check for duplicate title in same category
      if (courseTitle && courseTitle !== course.courseTitle) {
        const existingCourse = await Course.findOne({ 
          courseTitle, 
          category: category || course.category,
          _id: { $ne: course._id }
        });
        
        if (existingCourse) {
          return sendErrorResponse({ 
            res, 
            status: httpStatus.CONFLICT, 
            msg: 'Course with this title already exists in this category.' 
          });
        }
      }

      // Parse tags if provided
      let tagsArray = course.tags;
      if (tags) {
        if (typeof tags === 'string') {
          tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(tags)) {
          tagsArray = tags;
        }
      }

      // Prepare update data
      const updateData = {
        courseTitle: courseTitle || course.courseTitle,
        courseDesc: courseDesc || course.courseDesc,
        courseShortDesc: courseShortDesc || course.courseShortDesc,
        duration: parseInt(duration) || course.duration,
        weekly_study: parseInt(weekly_study) || course.weekly_study,
        learn_type: learn_type || course.learn_type,
        category: category || course.category,
        price: learn_type === 'PAID' ? parseFloat(price) || course.price : 0,
        discount: parseFloat(discount) || course.discount,
        tags: tagsArray,
        embeddedUrl: embeddedUrl || course.embeddedUrl,
        requirements: requirements || course.requirements
      };

      // Add image if uploaded
      if (req.file) {
        updateData.image = req.file.path;
      }

      // If lecturer is updating, set status to pending_approval for review
      if (req.user.roles.includes('LECTURER') && !req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
        if (course.status === 'approved' || course.status === 'published') {
          updateData.status = 'pending_approval';
          updateData.published = false;
        }
      }

      // Update course
      const updatedCourse = await Course.findByIdAndUpdate(
        course._id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate([
        {
          path: 'category',
          select: 'categoryName categorySlug'
        },
        {
          path: 'lecturers',
          select: 'user joinDate',
          populate: {
            path: 'user',
            select: 'firstname lastname email userImage'
          }
        }
      ]);

      // Notify admins if course needs re-approval
      if (updateData.status === 'pending_approval' && course.status !== 'pending_approval') {
        try {
          await notifyAdminsAboutCourseRequest(updatedCourse, req.user);
        } catch (notifyError) {
          console.error('Failed to notify admins:', notifyError);
        }
      }

      return sendSuccessResponse({ 
        res, 
        status: httpStatus.OK, 
        msg: updatedCourse.status === 'pending_approval'
          ? 'Course updated successfully. Waiting for admin re-approval.'
          : 'Course updated successfully.',
        data: updatedCourse 
      });
    });
  } catch (err) {
    console.error('Update course error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to update course.', 
      err: err.message 
    });
  }
};

// ======================= DELETE COURSE =======================
exports.deleteCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ courseSlug: slug });
    
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Check permissions
    const canEdit = await course.canUserEdit(req.user._id, req.user.roles);
    if (!canEdit) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: 'You do not have permission to delete this course.' 
      });
    }

    // Check if course has enrollments
    if (course.learners.length > 0) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Cannot delete course with enrolled students. Archive instead.' 
      });
    }

    // Soft delete (archive) instead of hard delete
    course.status = 'archived';
    await course.save();

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: 'Course archived successfully.' 
    });
  } catch (err) {
    console.error('Delete course error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to delete course.', 
      err: err.message 
    });
  }
};

// ======================= PUBLISH/UNPUBLISH COURSE =======================
exports.toggleCoursePublish = async (req, res) => {
  try {
    const { slug } = req.params;
    const { publish } = req.body;

    // Check admin privileges
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: 'Admin privileges required to publish/unpublish courses.' 
      });
    }

    const course = await Course.findOne({ courseSlug: slug });
    
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Check if course is approved
    if (course.status !== 'approved') {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Only approved courses can be published.' 
      });
    }

    course.published = publish === true;
    
    if (publish === true && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    return sendSuccessResponse({ 
      res, 
      status: httpStatus.OK, 
      msg: publish 
        ? 'Course published successfully.' 
        : 'Course unpublished successfully.',
      data: course 
    });
  } catch (err) {
    console.error('Toggle publish error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to update course status.', 
      err: err.message 
    });
  }
};

// ======================= GET ALL COURSES WITH FILTERS =======================
exports.getAllCourses = async (req, res) => {
  try {
    let { page, size, sortQuery, searchQuery, selectQuery, populate } = parseFilters(req);
    
    // Add status filter for non-admins
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      searchQuery = {
        ...searchQuery,
        status: 'approved',
        published: true
      };
    }

    // Filter by category if provided
    if (req.query.category) {
      let ids = [req.query.category];
      let category = await Category.findOne({ _id: req.query.category });
      
      if (category && category.parentCategory == null) {
        let childCategory = await Category.distinct('_id', { parentCategory: category._id });
        ids = ids.concat(childCategory);
      }
      
      searchQuery = {
        ...searchQuery,
        category: { $in: ids },
      };
    }

    // Filter by status if provided
    if (req.query.status) {
      searchQuery = {
        ...searchQuery,
        status: req.query.status
      };
    }

    // Filter by creator if provided (for admins)
    if (req.query.createdBy && (req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPERADMIN'))) {
      searchQuery = {
        ...searchQuery,
        createdBy: req.query.createdBy
      };
    }

    // Filter by lecturer
    if (req.query.lecturer) {
      searchQuery = {
        ...searchQuery,
        lecturers: req.query.lecturer
      };
    }

    selectQuery = '-courseTitle_fuzzy -courseDesc_fuzzy';

    populate = [
      {
        path: 'category',
        select: '_id categoryName categorySlug parentCategory',
        populate: {
          path: 'parentCategory',
          select: '_id categoryName categorySlug',
        },
      },
      {
        path: 'lecturers',
        select: 'user joinDate',
        populate: {
          path: 'user',
          select: 'firstname lastname email userImage',
        },
      },
      {
        path: 'createdBy',
        select: 'firstname lastname email'
      }
    ];

    const result = await sendQueryResponse({
      model: Course,
      page,
      size,
      sortQuery,
      searchQuery,
      selectQuery,
      populate,
    });

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: result.data,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(size) || 10,
        total: result.totalData,
        totalPages: result.totalPage
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to get courses.' 
    });
  }
};

// ======================= GET COURSE DETAILS =======================
exports.getCourseDetails = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ courseSlug: slug })
      .populate([
        {
          path: 'category',
          select: '_id categoryName categorySlug'
        },
        {
          path: 'lecturers',
          select: 'user joinDate',
          populate: {
            path: 'user',
            select: 'firstname lastname email userImage bio'
          }
        },
        {
          path: 'createdBy',
          select: 'firstname lastname email userImage'
        },
        {
          path: 'learners',
          select: 'firstname lastname email userImage',
          match: { _id: req.user?._id }
        }
      ]);

    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Check if user can view this course
    if (course.status !== 'approved' && course.status !== 'published') {
      const canView = await course.canUserEdit(req.user?._id, req.user?.roles || []);
      if (!canView) {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.FORBIDDEN, 
          msg: 'You do not have permission to view this course.' 
        });
      }
    }

    // Get weeks and lessons count
    const weeks = await Week.find({ course: course._id });
    const lessons = await Lesson.find({ week: { $in: weeks.map(w => w._id) } });
    
    course.totalWeeks = weeks.length;
    course.totalLessons = lessons.length;

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: course,
      msg: 'Course details retrieved successfully.'
    });
  } catch (error) {
    console.error('Get course details error:', error);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to get course details.' 
    });
  }
};

// ======================= GET PENDING COURSE REQUESTS (ADMIN) =======================
exports.getPendingCourseRequests = async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: 'Admin privileges required.' 
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const pendingRequests = await Course.find({ 
      status: 'pending_approval',
      creatorType: 'lecturer'
    })
    .populate([
      {
        path: 'createdBy',
        select: 'firstname lastname email phone'
      },
      {
        path: 'category',
        select: 'categoryName'
      },
      {
        path: 'lecturers',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstname lastname email'
        }
      }
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Course.countDocuments({ 
      status: 'pending_approval',
      creatorType: 'lecturer'
    });

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: pendingRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      msg: 'Pending course requests retrieved successfully.'
    });
  } catch (err) {
    console.error('Get pending requests error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to get pending course requests.', 
      err: err.message 
    });
  }
};

// ======================= ASSIGN LECTURERS TO COURSE =======================
exports.assignLecturers = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lecturers } = req.body;

    // Check admin privileges
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.FORBIDDEN, 
        msg: 'Admin privileges required to assign lecturers.' 
      });
    }

    if (!lecturers || !Array.isArray(lecturers) || lecturers.length === 0) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Lecturers array is required.' 
      });
    }

    const course = await Course.findOne({ courseSlug: slug });
    
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Verify all lecturers exist and are approved
    const lecturerDocs = await Lecturer.find({
      _id: { $in: lecturers },
      requestStatus: 'approved',
      isActive: true
    });

    if (lecturerDocs.length !== lecturers.length) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'One or more lecturers are not approved or active.' 
      });
    }

    course.lecturers = [...new Set([...course.lecturers, ...lecturers])]; // Merge and remove duplicates
    await course.save();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      msg: 'Lecturers assigned successfully.',
      data: course
    });
  } catch (err) {
    console.error('Assign lecturers error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to assign lecturers.', 
      err: err.message 
    });
  }
};

// ======================= REMOVE LECTURER FROM COURSE =======================
exports.removeLecturer = async (req, res) => {
  try {
    const { slug, lecturerId } = req.params;

    // Check admin privileges
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPERADMIN')) {
      // Lecturer can only remove themselves
      if (req.user.roles.includes('LECTURER')) {
        const lecturer = await Lecturer.findOne({ user: req.user._id });
        if (!lecturer || lecturer._id.toString() !== lecturerId) {
          return sendErrorResponse({ 
            res, 
            status: httpStatus.FORBIDDEN, 
            msg: 'You can only remove yourself from the course.' 
          });
        }
      } else {
        return sendErrorResponse({ 
          res, 
          status: httpStatus.FORBIDDEN, 
          msg: 'Permission denied.' 
        });
      }
    }

    const course = await Course.findOne({ courseSlug: slug });
    
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Check if lecturer is assigned to course
    if (!course.lecturers.includes(lecturerId)) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Lecturer is not assigned to this course.' 
      });
    }

    // Cannot remove the creator if they're the only lecturer
    if (course.createdBy.toString() === lecturerId && course.lecturers.length === 1) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Cannot remove course creator. Assign another lecturer first.' 
      });
    }

    course.lecturers = course.lecturers.filter(id => id.toString() !== lecturerId);
    await course.save();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      msg: 'Lecturer removed successfully.',
      data: course
    });
  } catch (err) {
    console.error('Remove lecturer error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to remove lecturer.', 
      err: err.message 
    });
  }
};

// ======================= ENROLL IN COURSE =======================
exports.enrollInCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ courseSlug: slug });
    
    if (!course) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.NOT_FOUND, 
        msg: 'Course not found.' 
      });
    }

    // Check if course is published
    if (!course.published || course.status !== 'approved') {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.BAD_REQUEST, 
        msg: 'Course is not available for enrollment.' 
      });
    }

    // Check if already enrolled
    if (course.learners.includes(req.user._id)) {
      return sendErrorResponse({ 
        res, 
        status: httpStatus.CONFLICT, 
        msg: 'You are already enrolled in this course.' 
      });
    }

    // For paid courses, you would add payment logic here
    if (course.learn_type === 'PAID') {
      // Payment integration would go here
      // For now, we'll just enroll
    }

    // Enroll user
    course.learners.push(req.user._id);
    course.totalEnrollments = course.learners.length;
    await course.save();

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      msg: 'Successfully enrolled in the course.',
      data: {
        course: course.courseTitle,
        enrolled: true
      }
    });
  } catch (err) {
    console.error('Enroll in course error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to enroll in course.', 
      err: err.message 
    });
  }
};

// ======================= GET MY COURSES =======================
exports.getMyCourses = async (req, res) => {
  try {
    let { type = 'enrolled' } = req.query; 

    let query = {};
    
    if (type === 'enrolled') {
      query.learners = req.user._id;
      query.published = true;
      query.status = 'approved';
    } else if (type === 'teaching') {
      const lecturer = await Lecturer.findOne({ user: req.user._id });
      if (lecturer) {
        query.lecturers = lecturer._id;
      } else {
        query.lecturers = [];
      }
    } else if (type === 'created') {
      query.createdBy = req.user._id;
    } else if (type === 'pending') {
      query.createdBy = req.user._id;
      query.status = 'pending_approval';
    }

    const courses = await Course.find(query)
      .populate([
        {
          path: 'category',
          select: 'categoryName categorySlug'
        },
        {
          path: 'lecturers',
          select: 'user',
          populate: {
            path: 'user',
            select: 'firstname lastname email userImage'
          }
        }
      ])
      .sort({ createdAt: -1 });

    return sendSuccessResponse({
      res,
      status: httpStatus.OK,
      data: courses,
      msg: 'Courses retrieved successfully.'
    });
  } catch (err) {
    console.error('Get my courses error:', err);
    return sendErrorResponse({ 
      res, 
      status: httpStatus.INTERNAL_SERVER_ERROR, 
      msg: 'Failed to get your courses.', 
      err: err.message 
    });
  }
};

// ======================= HELPER FUNCTIONS =======================

const notifyAdminsAboutCourseRequest = async (course, creator) => {
  try {
    // Find all admin users
    const admins = await User.find({ 
      roles: { $in: ['ADMIN', 'SUPERADMIN'] } 
    });

    // Send email notification to each admin
    for (const admin of admins) {
      try {
        await helper.sendCourseRequestNotification({
          adminEmail: admin.email,
          adminName: `${admin.firstname} ${admin.lastname}`,
          courseTitle: course.courseTitle,
          creatorName: `${creator.firstname} ${creator.lastname}`,
          creatorEmail: creator.email,
          courseId: course._id,
          dashboardLink: `${process.env.ADMIN_DASHBOARD_URI || process.env.FRONTEND_URI}/admin/courses/pending`
        });
      } catch (emailError) {
        console.error(`Failed to send notification to admin ${admin.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
    throw error;
  }
};