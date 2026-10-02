import { queryAll, queryOne, runStatement } from '../db.js';
import { ApiError } from '../utils/apiError.js';

function serializeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    location: room.location,
    isActive: Boolean(room.is_active),
    createdAt: room.created_at
  };
}

export async function listRooms() {
  const rows = await queryAll('SELECT * FROM rooms WHERE is_active = TRUE ORDER BY name ASC');
  return rows.map(serializeRoom);
}

export async function createRoom({ name, capacity, location }) {
  const trimmedName = name.trim();
  const existingRoom = await queryOne('SELECT id FROM rooms WHERE name = $1 AND is_active = TRUE', [trimmedName]);

  if (existingRoom) {
    throw new ApiError(409, 'Sala já cadastrada.', 'ROOM_ALREADY_EXISTS');
  }

  await runStatement(
    'INSERT INTO rooms (name, capacity, location) VALUES ($1, $2, $3)',
    [trimmedName, Number(capacity), location.trim()]
  );

  const room = await queryOne('SELECT * FROM rooms WHERE name = $1', [trimmedName]);
  return serializeRoom(room);
}

export async function updateRoom(id, payload) {
  const room = await queryOne('SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE', [Number(id)]);

  if (!room) {
    throw new ApiError(404, 'Sala não encontrada.', 'ROOM_NOT_FOUND');
  }

  const nextName = payload.name ? payload.name.trim() : room.name;
  const nextLocation = payload.location ? payload.location.trim() : room.location;
  const nextCapacity = payload.capacity ? Number(payload.capacity) : room.capacity;

  if (nextName !== room.name) {
    const duplicate = await queryOne('SELECT id FROM rooms WHERE name = $1 AND id != $2 AND is_active = TRUE', [nextName, room.id]);
    if (duplicate) {
      throw new ApiError(409, 'Já existe outra sala com este nome.', 'ROOM_DUPLICATE');
    }
  }

  await runStatement(
    'UPDATE rooms SET name = $1, capacity = $2, location = $3 WHERE id = $4',
    [nextName, nextCapacity, nextLocation, room.id]
  );

  return serializeRoom(await queryOne('SELECT * FROM rooms WHERE id = $1', [room.id]));
}

export async function deleteRoom(id) {
  const room = await queryOne('SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE', [Number(id)]);

  if (!room) {
    throw new ApiError(404, 'Sala não encontrada.', 'ROOM_NOT_FOUND');
  }

  const activeReservations = await queryOne(
    'SELECT id FROM reservations WHERE room_id = $1 AND is_active = TRUE LIMIT 1',
    [room.id]
  );

  if (activeReservations) {
    throw new ApiError(409, 'A sala possui reservas ativas e não pode ser removida.', 'ROOM_HAS_ACTIVE_RESERVATIONS');
  }

  await runStatement('UPDATE rooms SET is_active = FALSE WHERE id = $1', [room.id]);
  return { success: true, message: 'Sala removida com sucesso.' };
}
