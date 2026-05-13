import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { login, registerStudent } from './auth.service';

export const authRouter = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiados intentos. Prueba de nuevo en unos minutos.',
    },
  },
});

authRouter.post(
  '/register',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const result = await registerStudent(req.body);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.json(result);
  }),
);
