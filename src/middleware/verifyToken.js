import jwt from 'jsonwebtoken';

 const verifyToken = (req, res, next) => {
  try {
    // Expecting token in Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token', error: err.message });
  }
};
export default verifyToken;
