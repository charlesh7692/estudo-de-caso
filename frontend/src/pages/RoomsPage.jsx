import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RoomsPage() {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: '', capacity: '', location: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loadRooms = async () => {
    try {
      const response = await apiRequest('/rooms', { token });
      setRooms(response);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiRequest('/rooms', {
        method: 'POST',
        token,
        body: {
          name: form.name,
          capacity: Number(form.capacity),
          location: form.location
        }
      });

      setSuccess('Sala cadastrada com sucesso.');
      setForm({ name: '', capacity: '', location: '' });
      loadRooms();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="card-header">
          <h2>Cadastro de salas</h2>
          <p>Cadastre e mantenha o conjunto de salas disponíveis.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nome
            <input name="name" value={form.name} onChange={handleChange} placeholder="Sala de reunião" minLength={2} maxLength={80} required />
          </label>

          <label>
            Capacidade
            <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="8" min="1" step="1" required />
          </label>

          <label>
            Localização
            <input name="location" value={form.location} onChange={handleChange} placeholder="Andar 2" minLength={2} maxLength={120} required />
          </label>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button className="button button-primary" type="submit">Cadastrar sala</button>
        </form>
      </section>

      <section className="panel">
        <div className="card-header">
          <h2>Salas disponíveis</h2>
        </div>

        <div className="list-stack">
          {rooms.length === 0 ? (
            <p className="empty-state">Nenhuma sala cadastrada.</p>
          ) : (
            rooms.map((room) => (
              <article key={room.id} className="list-item">
                <div>
                  <strong>{room.name}</strong>
                  <small>{room.location}</small>
                </div>
                <span>{room.capacity} pessoas</span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
