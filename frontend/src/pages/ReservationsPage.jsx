import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

function getTodayDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function ReservationsPage() {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ roomId: '', date: '', status: '' });
  const [form, setForm] = useState({ roomId: '', reservationDate: '', startTime: '09:00', endTime: '10:00', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loadRooms = async () => {
    const response = await apiRequest('/rooms', { token });
    setRooms(response);
    if (!form.roomId && response[0]) {
      setForm((current) => ({ ...current, roomId: String(response[0].id) }));
    }
  };

  const loadReservations = async () => {
    const params = new URLSearchParams();
    if (filters.roomId) params.set('roomId', filters.roomId);
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);

    const response = await apiRequest(`/reservations?${params.toString()}`, { token });
    setReservations(response);
  };

  useEffect(() => {
    loadRooms();
    loadReservations();
  }, [token]);

  useEffect(() => {
    if (token) {
      loadReservations();
    }
  }, [filters, token]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiRequest('/reservations', {
        method: 'POST',
        token,
        body: {
          roomId: Number(form.roomId),
          reservationDate: form.reservationDate,
          startTime: form.startTime,
          endTime: form.endTime,
          notes: form.notes
        }
      });

      setSuccess('Reserva criada com sucesso.');
      setForm((current) => ({ ...current, reservationDate: '', notes: '' }));
      loadReservations();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleDelete = async (reservationId) => {
    try {
      await apiRequest(`/reservations/${reservationId}`, {
        method: 'DELETE',
        token
      });
      loadReservations();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="card-header">
          <h2>Nova reserva</h2>
          <p>Agende horários e valide sobreposições automaticamente.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Sala
            <select name="roomId" value={form.roomId} onChange={handleFormChange} required>
              <option value="">Selecione</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input type="date" name="reservationDate" value={form.reservationDate} onChange={handleFormChange} min={getTodayDate()} required />
          </label>

          <div className="two-column">
            <label>
              Início
              <input type="time" name="startTime" value={form.startTime} onChange={handleFormChange} required />
            </label>

            <label>
              Término
              <input type="time" name="endTime" value={form.endTime} onChange={handleFormChange} required />
            </label>
          </div>

          <label>
            Observações
            <textarea name="notes" value={form.notes} onChange={handleFormChange} rows="3" placeholder="Detalhes da reunião" />
          </label>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button className="button button-primary" type="submit" disabled={rooms.length === 0}>Salvar reserva</button>
        </form>
      </section>

      <section className="panel">
        <div className="card-header">
          <h2>Lista de reservas</h2>
        </div>

        <div className="filters-grid">
          <select name="roomId" value={filters.roomId} onChange={handleFilterChange}>
            <option value="">Todas as salas</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>

          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmada</option>
            <option value="pending">Pendente</option>
          </select>
        </div>

        <div className="list-stack">
          {reservations.length === 0 ? (
            <p className="empty-state">Nenhuma reserva encontrada.</p>
          ) : (
            reservations.map((reservation) => (
              <article key={reservation.id} className="list-item reservation-item">
                <div>
                  <strong>{reservation.roomName}</strong>
                  <small>
                    {reservation.reservationDate} · {reservation.startTime} às {reservation.endTime}
                  </small>
                </div>
                <div className="reservation-actions">
                  <span className="status-badge">{reservation.status}</span>
                  <button className="button button-danger" onClick={() => handleDelete(reservation.id)}>
                    Remover
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
