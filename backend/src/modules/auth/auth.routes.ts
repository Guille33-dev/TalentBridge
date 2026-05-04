import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { login, registerStudent } from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const result = await registerStudent(req.body);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.json(result);
  }),
);
