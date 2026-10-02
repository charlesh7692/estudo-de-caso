import { z } from 'zod';
import { normalizeDate, normalizeTime } from './utils/apiError.js';

const dateSchema = z.string().refine((value) => normalizeDate(value) !== null, {
  message: 'Use o formato AAAA-MM-DD.'
});

const timeSchema = z.string().refine((value) => normalizeTime(value) !== null, {
  message: 'Use o formato HH:MM.'
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email('E-mail inválido.'),
  password: z.string().min(6).max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido.'),
  password: z.string().min(6).max(100)
});

export const roomSchema = z.object({
  name: z.string().trim().min(2).max(80),
  capacity: z.coerce.number().int().positive('Capacidade deve ser um número inteiro positivo.'),
  location: z.string().trim().min(2).max(120)
});

export const reservationSchema = z.object({
  roomId: z.coerce.number().int().positive('Sala inválida.'),
  reservationDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().max(500).optional().or(z.literal(''))
});

export const patchReservationSchema = z.object({
  roomId: z.coerce.number().int().positive('Sala inválida.').optional(),
  reservationDate: dateSchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  notes: z.string().max(500).optional().or(z.literal(''))
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos.',
        errors: result.error.flatten().fieldErrors
      });
    }

    req.body = result.data;
    next();
  };
}
