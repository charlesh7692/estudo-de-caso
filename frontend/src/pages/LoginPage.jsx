import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/salas" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { fullName: form.fullName, email: form.email, password: form.password };

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: payload
      });

      login(response.user, response.token);
      navigate('/salas');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="card-header">
        <h1>{mode === 'login' ? 'Acessar painel' : 'Criar conta'}</h1>
        <p>Gestão de salas e reservas.</p>
      </div>

      <div className="segmented-control">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          Cadastro
        </button>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Nome completo
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Seu nome" minLength={2} maxLength={120} required />
          </label>
        )}

        <label>
          E-mail
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" maxLength={150} required />
        </label>

        <label>
          Senha
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mínimo de 6 caracteres" minLength={6} maxLength={100} required />
        </label>

        {error && <div className="alert error">{error}</div>}

        <button className="button button-primary" disabled={loading}>
          {loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}
