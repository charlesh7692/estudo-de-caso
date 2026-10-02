import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { runStatement } from '../src/db.js';
import { registerUser } from '../src/services/authService.js';
import { createRoom } from '../src/services/roomService.js';
import { createReservation } from '../src/services/reservationService.js';

async function cleanupFixture(user, room) {
  await runStatement('DELETE FROM reservations WHERE user_id = $1 OR room_id = $2', [user?.id ?? -1, room?.id ?? -1]);
  if (room?.id) await runStatement('DELETE FROM rooms WHERE id = $1', [room.id]);
  if (user?.id) await runStatement('DELETE FROM users WHERE id = $1', [user.id]);
}

test('deve bloquear sobreposição de reservas na mesma sala', async () => {
  const suffix = randomUUID();
  let user;
  let room;

  try {
    user = (await registerUser({
      fullName: 'Maria Souza',
      email: `maria-${suffix}@email.com`,
      password: 'senha123'
    })).user;

    room = await createRoom({
      name: `Sala Azul ${suffix}`,
      capacity: 8,
      location: 'Andar 1'
    });

    await createReservation(user.id, {
      roomId: room.id,
      reservationDate: '2030-01-15',
      startTime: '09:00',
      endTime: '10:00',
      notes: 'Reunião de planejamento'
    });

    await assert.rejects(
      () => createReservation(user.id, {
        roomId: room.id,
        reservationDate: '2030-01-15',
        startTime: '09:30',
        endTime: '10:30',
        notes: 'Conflito'
      }),
      /Já existe uma reserva sobreposta/
    );
  } finally {
    await cleanupFixture(user, room);
  }
});

test('deve impedir reserva em data passada', async () => {
  const suffix = randomUUID();
  let user;
  let room;

  try {
    user = (await registerUser({
      fullName: 'João Silva',
      email: `joao-${suffix}@email.com`,
      password: 'senha123'
    })).user;

    room = await createRoom({
      name: `Sala Verde ${suffix}`,
      capacity: 10,
      location: 'Andar 2'
    });

    await assert.rejects(
      () => createReservation(user.id, {
        roomId: room.id,
        reservationDate: '2000-01-01',
        startTime: '08:00',
        endTime: '09:00'
      }),
      /datas passadas/
    );
  } finally {
    await cleanupFixture(user, room);
  }

});
