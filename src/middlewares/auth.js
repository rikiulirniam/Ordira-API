import jwt from 'jsonwebtoken';
import { ApiError } from '../core/apiError.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) {
    return next(new ApiError(401, 'Unauthenticated'));
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (e) {
    return next(new ApiError(401, 'Invalid token'));
  }
};

export const authorize = (roles = ["ADMIN"], detail = "Hanya bisa diakses admin") => (req, res, next) => {
  // Jika req.user tidak ada, berarti authenticate belum dipanggil atau gagal
  if (!req.user) {
    return next(new ApiError(401, 'Unauthenticated'));
  }
  
  // Cek role
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden', detail));
  }
  
  return next();
};