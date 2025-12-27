const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { responseHandler } = require("../helpers/index");
const httpStatus = require("http-status");
const Lecturer = require("../models/lecturer.model");
const { sendErrorResponse } = responseHandler;

// Use consistent JWT secret name
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

const decodeToken = (auth) => {
    try {
        const token = auth.split(" ")[1];
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        console.error('Token decode error:', e.message);
        return null;
    }
};

const getUser = async (userId) => {
    try {
        return await User.findById(userId)
            .select("-hash -salt -verificationCode")
            .lean();
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
};

const getLecturer = async (userId) => {
    try {
        return await Lecturer.findOne({ 
            user: userId,
            requestStatus: 'approved',
            isActive: true,
            isDeleted: false 
        }).select("user joinDate requestStatus isActive");
    } catch (error) {
        console.error('Get lecturer error:', error.message);
        return null;
    }
};

// Base authentication middleware
module.exports.verifyUser = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Authentication required. Please login." 
            });
        }

        let decodedResult = decodeToken(req.headers.authorization);
        
        if (!decodedResult) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Invalid or expired token. Please login again." 
            });
        }

        let userData = await getUser(decodedResult.userId);

        if (!userData) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "User not found. Please login again." 
            });
        }

        // Check if user is suspended
        if (userData.isSuspended) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Your account is suspended. Contact administrator." 
            });
        }

        // Check if email is verified (for all users except admin can bypass)
        if (!userData.isVerified && !userData.roles.includes('ADMIN') && !userData.roles.includes('SUPERADMIN')) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Please verify your email before accessing this resource." 
            });
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return sendErrorResponse({ 
            res, 
            status: httpStatus.INTERNAL_SERVER_ERROR, 
            msg: "Authentication failed. Please try again." 
        });
    }
};

// SUPERADMIN only middleware
module.exports.verifySuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Authentication required." 
            });
        }

        if (!req.user.roles.includes('SUPERADMIN')) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Access denied. SUPERADMIN privileges required." 
            });
        }

        next();
    } catch (error) {
        console.error('SuperAdmin verification error:', error.message);
        return sendErrorResponse({ 
            res, 
            status: httpStatus.INTERNAL_SERVER_ERROR, 
            msg: "Authorization failed." 
        });
    }
};

// ADMIN middleware (allows both ADMIN and SUPERADMIN)
module.exports.verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Authentication required." 
            });
        }

        const hasAdminAccess = req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPERADMIN');
        
        if (!hasAdminAccess) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Access denied. Admin privileges required." 
            });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error.message);
        return sendErrorResponse({ 
            res, 
            status: httpStatus.INTERNAL_SERVER_ERROR, 
            msg: "Authorization failed." 
        });
    }
};

// LECTURER middleware
module.exports.verifyLecturer = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Authentication required." 
            });
        }

        // Check if user has LECTURER role
        if (!req.user.roles.includes('LECTURER')) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Access denied. Lecturer privileges required." 
            });
        }

        // Check if lecturer is approved and active
        const lecturer = await getLecturer(req.user._id);
        
        if (!lecturer) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Your lecturer account is not approved or is inactive." 
            });
        }

        if (lecturer.requestStatus !== 'approved' || !lecturer.isActive) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Your lecturer account is pending approval or is inactive." 
            });
        }

        req.lecturer = lecturer;
        next();
    } catch (error) {
        console.error('Lecturer verification error:', error.message);
        return sendErrorResponse({ 
            res, 
            status: httpStatus.INTERNAL_SERVER_ERROR, 
            msg: "Authorization failed." 
        });
    }
};

// LEARNER middleware
module.exports.verifyLearner = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.UNAUTHORIZED, 
                msg: "Authentication required." 
            });
        }

        // Check if user has LEARNER role (all users are learners by default)
        if (!req.user.roles.includes('LEARNER')) {
            return sendErrorResponse({ 
                res, 
                status: httpStatus.FORBIDDEN, 
                msg: "Access denied. Learner privileges required." 
            });
        }

        next();
    } catch (error) {
        console.error('Learner verification error:', error.message);
        return sendErrorResponse({ 
            res, 
            status: httpStatus.INTERNAL_SERVER_ERROR, 
            msg: "Authorization failed." 
        });
    }
};

// Optional authentication middleware
module.exports.checkAuth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            // No token - proceed as guest
            req.user = null;
            return next();
        }

        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            req.user = null;
            return next();
        }

        // Try to authenticate but don't fail if token is invalid
        let decodedResult = decodeToken(req.headers.authorization);
        
        if (decodedResult) {
            let userData = await getUser(decodedResult.userId);
            if (userData && !userData.isSuspended) {
                req.user = userData;
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error.message);
        // Don't fail the request for optional auth
        req.user = null;
        next();
    }
};

// Role-based access control middleware (flexible)
module.exports.verifyRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendErrorResponse({ 
                    res, 
                    status: httpStatus.UNAUTHORIZED, 
                    msg: "Authentication required." 
                });
            }

            // SUPERADMIN has access to everything
            if (req.user.roles.includes('SUPERADMIN')) {
                return next();
            }

            // Check if user has any of the allowed roles
            const hasAccess = req.user.roles.some(role => allowedRoles.includes(role));
            
            if (!hasAccess) {
                return sendErrorResponse({ 
                    res, 
                    status: httpStatus.FORBIDDEN, 
                    msg: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
                });
            }

            // Additional checks for specific roles
            if (allowedRoles.includes('LECTURER')) {
                const lecturer = await getLecturer(req.user._id);
                if (!lecturer || lecturer.requestStatus !== 'approved' || !lecturer.isActive) {
                    return sendErrorResponse({ 
                        res, 
                        status: httpStatus.FORBIDDEN, 
                        msg: "Your lecturer account is not approved or is inactive." 
                    });
                }
                req.lecturer = lecturer;
            }

            next();
        } catch (error) {
            console.error('Role verification error:', error.message);
            return sendErrorResponse({ 
                res, 
                status: httpStatus.INTERNAL_SERVER_ERROR, 
                msg: "Authorization failed." 
            });
        }
    };
};