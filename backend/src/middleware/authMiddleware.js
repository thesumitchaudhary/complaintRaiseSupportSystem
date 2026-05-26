import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT secret not configured" });
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (decoded?.role) {
            decoded.role = String(decoded.role).toLowerCase();
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
}

export default authMiddleware;