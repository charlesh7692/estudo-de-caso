import express from 'express';
import { createReservation, deleteReservation, listReservations, updateReservation } from '../services/reservationService.js';
import { requireAuth } from '../middleware/auth.js';
import { patchReservationSchema, reservationSchema, validate } from '../validations.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const reservations = await listReservations({
      roomId: req.query.roomId,
      date: req.query.date,
      status: req.query.status
    });
    return res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, validate(reservationSchema), async (req, res, next) => {
  try {
    const reservation = await createReservation(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso.',
      data: reservation
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', requireAuth, validate(patchReservationSchema), async (req, res, next) => {
  try {
    const reservation = await updateReservation(req.params.id, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Reserva atualizada com sucesso.',
      data: reservation
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const response = await deleteReservation(req.params.id, req.user.id);
    return res.status(200).json({ success: true, ...response });
  } catch (error) {
    return next(error);
  }
});

export default router;
