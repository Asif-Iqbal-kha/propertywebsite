import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

export const SESSION_COOKIE = 'ph_session';
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function signSession(user) {
  return jwt.sign({ sub: String(user._id), v: user.tokenVersion }, config.jwtSecret, { expiresIn: '7d' });
}

export function cookieOptions(req) {
  const crossSite = config.clientOrigins.length > 0;
  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'strict',
    secure: crossSite ? true : req.secure,
    path: '/',
    maxAge: WEEK,
  };
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
  const user = await User.findById(payload.sub).lean();
  if (!user || user.tokenVersion !== payload.v) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
  req.user = { id: String(user._id), email: user.email, name: user.name };
  next();
}
