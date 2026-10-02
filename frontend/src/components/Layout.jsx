import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = pathname === '/reservas' ? 'Reservas' : pathname === '/salas' ? 'Salas' : 'Bem-vindo';
  const userInitials = user?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">RS</span>
          <div>
            <strong>Reserva</strong>
            <small>workspace</small>
          </div>
        </div>

        {user ? (
          <>
            <span className="nav-caption">MENU PRINCIPAL</span>
            <nav className="nav-menu">
              <NavLink to="/salas"><span aria-hidden="true">▦</span> Salas</NavLink>
              <NavLink to="/reservas"><span aria-hidden="true">◷</span> Reservas</NavLink>
            </nav>
            <div className="sidebar-footer">
              <span className="connection-indicator"><i /> Sistema conectado</span>
              <button className="button button-secondary" onClick={logout} type="button">Sair da conta</button>
            </div>
          </>
        ) : (
          <div className="sidebar-promo">
            <span className="nav-caption">ORGANIZE SEU ESPAÇO</span>
            <p>Encontre salas e planeje seus próximos encontros em um só lugar.</p>
            <Link className="button button-primary" to="/login">Acessar conta</Link>
          </div>
        )}
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">GESTÃO DE ESPAÇOS</span>
            <h1>{pageTitle}</h1>
          </div>
          {user && (
            <div className="user-profile">
              <span className="avatar">{userInitials || 'U'}</span>
              <span><strong>{user.fullName}</strong><small>Conta ativa</small></span>
            </div>
          )}
        </header>
        <div className="content-panel"><Outlet /></div>
      </main>
    </div>
  );
}
