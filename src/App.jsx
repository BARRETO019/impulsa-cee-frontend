import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import logo from './assets/logo.png';
import './styles.css';

function App() {

  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLogged(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);
  };

  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  return (
    <div className="app-layout">

      <header className="app-header">
        <div className="header-left">
          <img src={logo} alt="Impulsa" className="header-logo" />
          <div className="header-title">
            Impulsa Energía · Panel Técnico
          </div>
        </div>

        <button className="logout-button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main className="app-content">
        <Dashboard />
      </main>

    </div>
  );
}

export default App;
