import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, runStatement } from '../db.js';
import { config } from '../config.js';
import { ApiError } from '../utils/apiError.js';

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email
  };
}

export async function registerUser({ fullName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await queryOne('SELECT id FROM users WHERE email = $1 AND is_active = TRUE', [normalizedEmail]);

  if (existingUser) {
    throw new ApiError(409, 'E-mail já cadastrado.', 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  await runStatement(
    'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)',
    [fullName.trim(), normalizedEmail, passwordHash]
  );

  const user = await queryOne('SELECT id, full_name, email FROM users WHERE email = $1', [normalizedEmail]);
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '8h' });

  return {
    user: serializeUser(user),
    token
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryOne('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [normalizedEmail]);

  if (!user) {
    throw new ApiError(401, 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '8h' });

  return {
    user: serializeUser(user),
    token
  };
}
