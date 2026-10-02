import express from 'express';
import { loginUser, registerUser } from '../services/authService.js';
import { loginSchema, registerSchema, validate } from '../validations.js';

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso.',
      data: result
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso.',
      data: result
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
