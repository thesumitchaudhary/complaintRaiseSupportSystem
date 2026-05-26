export const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toLowerCase();
        const allowedRoles = roles.map((role) => String(role).toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
        next();
    };
};