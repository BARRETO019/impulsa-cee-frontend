import { useState } from 'react';
import logo from './assets/logo.png';

export default function Login({ onLogin }) {

  // Estados para guardar el correo y contraseña que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔥 IMPORTANTE:
  // Leemos la URL del backend desde la variable de entorno de Vite
  // Esta variable la tienes que poner en Render: VITE_API_URL="https://..."
  const API_URL = import.meta.env.VITE_API_URL;

  // Función que se ejecuta cuando el usuario envía el formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita recargar la página

    try {

      // Llamada al backend: enviamos email y contraseña al endpoint de login
      // Usamos `${API_URL}` para que funcione tanto en local como en Render
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Indicamos tipo de datos
        body: JSON.stringify({ email, password })        // Enviamos los datos
      });

      const data = await response.json(); // Leemos la respuesta del backend

      // Si la API responde con error (status != 200)
      if (!response.ok) {
        alert(data.error || 'Error en login');
        return; // Salimos de la función
      }

      // ⚡ Guardamos el rol y el token en localStorage para mantener sesión
      localStorage.setItem("role", data.role);
      localStorage.setItem("token", data.token);

      // Avisamos al componente padre (App) que la sesión está iniciada
      if (onLogin) onLogin();

    } catch (error) {

      // Si hubo un error de red (servidor caído, URL mala, CORS, etc.)
      console.error(error);
      alert("Error conectando con servidor");
    }
  };

  // Interfaz del formulario de login
  return (
    <div className="page-center">
      <div className="login-container">

        {/* Logo superior */}
        <img src={logo} alt="Impulsa Energía" className="login-logo" />

        <div className="company-name">
          Impulsa Energía
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleLogin}>

          {/* Input del email */}
          <input
            type="email"
            placeholder="Correo técnico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Input de la contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Botón de iniciar sesión */}
          <button type="submit">
            Iniciar sesión
          </button>

        </form>

      </div>
    </div>
  );
}