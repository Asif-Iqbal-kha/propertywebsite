import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { SESSION_COOKIE, cookieOptions, requireAuth, signSession } from '../middleware/auth.js';
import { HttpError, str } from '../utils/helpers.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
});

// Used to keep response time similar whether or not the email exists.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('not-a-real-password', 12));

router.post('/login', loginLimiter, async (req, res) => {
  const email = str(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 200) : '';
  if (!email || !password) throw new HttpError(400, 'Please enter your email and password.');

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user ? await user.checkPassword(password) : await bcrypt.compare(password, await getDummyHash());
  if (!user || !ok) throw new HttpError(401, 'Incorrect email or password.');

  res.cookie(SESSION_COOKIE, signSession(user), cookieOptions(req));
  res.json({ user: { id: String(user._id), email: user.email, name: user.name } });
});

router.post('/logout', (req, res) => {
  const { maxAge, ...opts } = cookieOptions(req); // eslint-disable-line no-unused-vars
  res.clearCookie(SESSION_COOKIE, opts);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ user: req.user });
});

router.post('/password', requireAuth, async (req, res) => {
  const current = typeof req.body?.current === 'string' ? req.body.current : '';
  const next = typeof req.body?.next === 'string' ? req.body.next : '';
  if (next.length < 8) throw new HttpError(400, 'The new password must be at least 8 characters.');
  if (next.length > 200) throw new HttpError(400, 'The new password is too long.');

  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user || !(await user.checkPassword(current))) throw new HttpError(400, 'Your current password is incorrect.');

  await user.setPassword(next);
  user.tokenVersion += 1;
  await user.save();

  res.cookie(SESSION_COOKIE, signSession(user), cookieOptions(req));
  res.json({ ok: true });
});

export default router;
