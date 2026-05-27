import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { createContactMessage } from './contact.service';

export const contactRouter = Router();

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiados mensajes enviados. Prueba de nuevo en unos minutos.',
    },
  },
});

contactRouter.post(
  '/messages',
  contactRateLimit,
  asyncHandler(async (req, res) => {
    const message = await createContactMessage(req.body);
    res.status(201).json({ data: message });
  }),
);
