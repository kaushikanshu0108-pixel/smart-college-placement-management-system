/**
 * Authentication and Role-Based Access Control (RBAC) Middleware
 * Smart College Placement Management System
 */

function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in to continue.'
        });
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s).`
            });
        }
        next();
    };
}

module.exports = {
    requireAuth,
    requireRole
};
