import express from 'express';
import { createRoom, deleteRoom, listRooms, updateRoom } from '../services/roomService.js';
import { requireAuth } from '../middleware/auth.js';
import { roomSchema, validate } from '../validations.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rooms = await listRooms();
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, validate(roomSchema), async (req, res, next) => {
  try {
    const room = await createRoom(req.body);
    return res.status(201).json({
      success: true,
      message: 'Sala criada com sucesso.',
      data: room
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', requireAuth, validate(roomSchema.partial()), async (req, res, next) => {
  try {
    const room = await updateRoom(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Sala atualizada com sucesso.',
      data: room
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const response = await deleteRoom(req.params.id);
    return res.status(200).json({ success: true, ...response });
  } catch (error) {
    return next(error);
  }
});

export default router;
