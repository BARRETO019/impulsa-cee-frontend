import { useState } from 'react';
import logo from './assets/logo.png';

export default function Login({ onLogin }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://impulsa-cee-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error en login');
        return;
      }
      localStorage.setItem("role", data.role);
      localStorage.setItem('token', data.token);//Se guarda el token

        if (onLogin) {
          onLogin();
        }
    } catch (error) {
      console.error(error);
      alert('Error conectando con servidor');
    }
  };
  

  return (
  <div className="page-center">
    <div className="login-container">

      <img src={logo} alt="Impulsa Energía" className="login-logo" />

      <div className="company-name">
        Impulsa Energía
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo técnico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Iniciar sesión
        </button>
      </form>

    </div>
  </div>
);

}
