import { queryAll, queryOne, runStatement } from '../db.js';
import { ApiError } from '../utils/apiError.js';

function serializeReservation(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    reservationDate: row.reservation_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    roomName: row.room_name || null,
    userName: row.user_name || null
  };
}

function formatTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function listReservations(filters = {}) {
  let sql = `
    SELECT r.*, ro.name AS room_name, u.full_name AS user_name
    FROM reservations r
    JOIN rooms ro ON ro.id = r.room_id
    JOIN users u ON u.id = r.user_id
    WHERE r.is_active = TRUE
  `;

  const params = [];
  let index = 1;

  if (filters.roomId) {
    sql += ` AND r.room_id = $${index++}`;
    params.push(Number(filters.roomId));
  }

  if (filters.date) {
    sql += ` AND r.reservation_date = $${index++}`;
    params.push(filters.date);
  }

  if (filters.status) {
    sql += ` AND r.status = $${index++}`;
    params.push(filters.status);
  }

  sql += ' ORDER BY r.reservation_date ASC, r.start_time ASC';

  const rows = await queryAll(sql, params);
  return rows.map(serializeReservation);
}

export async function createReservation(userId, payload) {
  const room = await queryOne('SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE', [Number(payload.roomId)]);

  if (!room) {
    throw new ApiError(404, 'Sala não encontrada.', 'ROOM_NOT_FOUND');
  }

  if (payload.reservationDate < formatTodayDate()) {
    throw new ApiError(400, 'Não é permitido reservar para datas passadas.', 'PAST_DATE');
  }

  if (payload.startTime >= payload.endTime) {
    throw new ApiError(400, 'O horário de início deve ser menor que o de término.', 'INVALID_TIME_RANGE');
  }

  const conflicts = await queryOne(`
    SELECT id
    FROM reservations
    WHERE room_id = $1
      AND is_active = TRUE
      AND reservation_date = $2
      AND start_time < $3
      AND end_time > $4
  `, [Number(payload.roomId), payload.reservationDate, payload.endTime, payload.startTime]);

  if (conflicts) {
    throw new ApiError(409, 'Já existe uma reserva sobreposta para esta sala no mesmo intervalo.', 'RESERVATION_CONFLICT');
  }

  await runStatement(`
    INSERT INTO reservations (room_id, user_id, reservation_date, start_time, end_time, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [Number(payload.roomId), userId, payload.reservationDate, payload.startTime, payload.endTime, payload.notes || null]);

  const row = await queryOne(`
    SELECT r.*, ro.name AS room_name, u.full_name AS user_name
    FROM reservations r
    JOIN rooms ro ON ro.id = r.room_id
    JOIN users u ON u.id = r.user_id
    WHERE r.user_id = $1 AND r.room_id = $2 AND r.reservation_date = $3 AND r.start_time = $4 AND r.end_time = $5
    ORDER BY r.id DESC
    LIMIT 1
  `, [userId, Number(payload.roomId), payload.reservationDate, payload.startTime, payload.endTime]);

  return serializeReservation(row);
}

export async function updateReservation(id, userId, payload) {
  const currentReservation = await queryOne('SELECT * FROM reservations WHERE id = $1 AND is_active = TRUE', [Number(id)]);

  if (!currentReservation) {
    throw new ApiError(404, 'Reserva não encontrada.', 'RESERVATION_NOT_FOUND');
  }

  if (currentReservation.user_id !== userId) {
    throw new ApiError(403, 'Você não pode alterar esta reserva.', 'FORBIDDEN_RESERVATION');
  }

  const nextRoomId = payload.roomId ? Number(payload.roomId) : currentReservation.room_id;
  const nextReservationDate = payload.reservationDate || currentReservation.reservation_date;
  const nextStartTime = payload.startTime || currentReservation.start_time;
  const nextEndTime = payload.endTime || currentReservation.end_time;
  const nextNotes = payload.notes ?? currentReservation.notes;

  if (nextStartTime >= nextEndTime) {
    throw new ApiError(400, 'O intervalo informado é inválido.', 'INVALID_TIME_RANGE');
  }

  const room = await queryOne('SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE', [nextRoomId]);

  if (!room) {
    throw new ApiError(404, 'Sala não encontrada.', 'ROOM_NOT_FOUND');
  }

  if (nextReservationDate < formatTodayDate()) {
    throw new ApiError(400, 'Não é permitido reservar em data passada.', 'PAST_DATE');
  }

  const conflicts = await queryOne(`
    SELECT id
    FROM reservations
    WHERE room_id = $1
      AND is_active = TRUE
      AND id != $2
      AND reservation_date = $3
      AND start_time < $4
      AND end_time > $5
  `, [nextRoomId, currentReservation.id, nextReservationDate, nextEndTime, nextStartTime]);

  if (conflicts) {
    throw new ApiError(409, 'A alteração cria uma sobreposição de reservas.', 'RESERVATION_CONFLICT');
  }

  await runStatement(`
    UPDATE reservations
    SET room_id = $1, reservation_date = $2, start_time = $3, end_time = $4, notes = $5, updated_at = NOW()
    WHERE id = $6
  `, [nextRoomId, nextReservationDate, nextStartTime, nextEndTime, nextNotes, currentReservation.id]);

  const row = await queryOne(`
    SELECT r.*, ro.name AS room_name, u.full_name AS user_name
    FROM reservations r
    JOIN rooms ro ON ro.id = r.room_id
    JOIN users u ON u.id = r.user_id
    WHERE r.id = $1
  `, [currentReservation.id]);

  return serializeReservation(row);
}

export async function deleteReservation(id, userId) {
  const currentReservation = await queryOne('SELECT * FROM reservations WHERE id = $1 AND is_active = TRUE', [Number(id)]);

  if (!currentReservation) {
    throw new ApiError(404, 'Reserva não encontrada.', 'RESERVATION_NOT_FOUND');
  }

  if (currentReservation.user_id !== userId) {
    throw new ApiError(403, 'Você não pode remover esta reserva.', 'FORBIDDEN_RESERVATION');
  }

  await runStatement('UPDATE reservations SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [currentReservation.id]);

  return {
    success: true,
    message: 'Reserva removida com sucesso.'
  };
}
