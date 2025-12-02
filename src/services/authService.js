import { prisma } from '../models/prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sanitizeUser = (u) => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt });

export const register = async ({ username, password, role = 'KASIR' }) => {
  if (!username || !password) throw new Error('username and password are required');
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    const err = new Error('Username already exists');
    err.code = 'P2002';
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hash, role } });
  return sanitizeUser(user);
};

export const login = async ({ username, password }) => {
  if (!username || !password) throw new Error('username and password are required');

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!secret) throw new Error('JWT_SECRET is not configured');
  
  const token = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn });
  return { token, user: sanitizeUser(user) };
};
