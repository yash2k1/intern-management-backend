import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedToken.models.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader,"auth");
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Token missing" });

    const token = authHeader.split(" ")[1];
     const isBlacklisted = await BlacklistedToken.findOne({ token });
     if (isBlacklisted)
      return res.status(403).json({ message: "Session expired. Please sign in again." });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("test",decoded)
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token", error: err.message });
  }
};

export default verifyToken;
