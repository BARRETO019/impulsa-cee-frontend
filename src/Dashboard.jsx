import { useEffect, useState } from 'react';
import VisitWizard from './VisitWizard';

export default function Dashboard({ onLogout }) {

  // Datos de visitas, clientes planeados y visita en curso
  const [visits, setVisits] = useState([]);
  const [clientesPlaneados, setClientesPlaneados] = useState([]);
  const [visitActiva, setVisitActiva] = useState(null);

  // ==============================================
  // 🔥 LEEMOS LA URL DEL BACKEND DESDE VITE
  // ==============================================
  const API_URL = import.meta.env.VITE_API_URL;

  // ==============================================
  // SACAR EL ROLE DESDE EL TOKEN
  // ==============================================

  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    userRole = decoded.role;
  }

  // ==============================================
  // CARGA INICIAL DE DATOS
  // ==============================================

  useEffect(() => {

    // Cargar visitas del usuario
    const fetchVisits = async () => {
      try {

        // 👇 Usamos la variable de entorno, NO la URL fija
        const response = await fetch(`${API_URL}/api/visits`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) setVisits(data);

      } catch (error) {
        console.error(error);
      }
    };

    // Cargar clientes planeados (AirTable)
    const fetchPlaneados = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/visits/airtable/planeados`
        );

        const data = await response.json();
        if (response.ok) setClientesPlaneados(data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchVisits();
    fetchPlaneados();

  }, []);

  // ==============================================
  // INICIAR VISITA
  // ==============================================

  const iniciarVisita = async (cliente) => {

    try {
      const response = await fetch(`${API_URL}/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          direccion: cliente.cliente,
          municipio: cliente.municipio,
          airtable_id: cliente.airtable_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setVisitActiva(data); // Abre el Wizard
      } else {
        alert(data.error || 'Error iniciando visita');
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ==============================================
  // FINALIZAR VISITA
  // ==============================================

  const finalizeVisit = async (id) => {
    const response = await fetch(
      `${API_URL}/api/visits/${id}/finalize`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.ok) {
      // Actualizamos la visita pero sin recargar la página
      setVisits(prev =>
        prev.map(v =>
          v.id === id ? { ...v, estado: 'finalizada' } : v
        )
      );
    } else {
      alert("Error finalizando");
    }
  };

  // ==============================================
  // BORRAR VISITA (solo CEO)
  // ==============================================

  const borrarVisita = async (id) => {

    const confirmacion = window.confirm(
      "¿Seguro que quieres eliminar esta visita?"
    );

    if (!confirmacion) return;

    const response = await fetch(
      `${API_URL}/api/visits/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.ok) {
      setVisits(prev => prev.filter(v => v.id !== id));
    } else {
      alert("Error eliminando visita");
    }
  };

  // ==============================================
  // SI HAY UNA VISITA EN CURSO, MOSTRAR EL WIZARD
  // ==============================================

  if (visitActiva) {
    return (
      <VisitWizard
        visit={visitActiva}
        onBack={() => setVisitActiva(null)}
      />
    );
  }

  // ==============================================
  // RENDER PRINCIPAL DEL DASHBOARD
  // ==============================================

  return (
    <div>

      {/* ==========================
          CLIENTES PLANEADOS
      =========================== */}
      <div className="card">
        <h2>Clientes Planeados</h2>

        {clientesPlaneados.length === 0 ? (
          <p>No hay clientes pendientes.</p>
        ) : (
          clientesPlaneados.map(cliente => (
            <div key={cliente.airtable_id} className="card">
              <strong>{cliente.cliente}</strong><br />
              {cliente.municipio}<br />

              <button
                onClick={() => iniciarVisita(cliente)}
                style={{ marginTop: 10 }}
              >
                Iniciar Visita
              </button>
            </div>
          ))
        )}
      </div>

      {/* ==========================
          MIS VISITAS
      =========================== */}
      <div className="card">
        <h2>Mis Visitas</h2>

        {visits.length === 0 ? (
          <p>No hay visitas aún.</p>
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="card">

              <strong>{visit.direccion}</strong><br />
              {visit.municipio} — {visit.estado}

              {visit.estado !== 'finalizada' && (
                <button
                  onClick={() => finalizeVisit(visit.id)}
                  style={{ marginTop: 10 }}
                >
                  Finalizar
                </button>
              )}

              {/* Solo los usuarios CEO pueden borrar */}
              {userRole === 'ceo' && (
                <button
                  onClick={() => borrarVisita(visit.id)}
                  style={{
                    marginLeft: 10,
                    background: "#8b0000",
                    color: "white"
                  }}
                >
                  Borrar
                </button>
              )}

            </div>
          ))
        )}
      </div>

      <button onClick={onLogout} style={{ marginTop: 20 }}>
        Cerrar sesión
      </button>

    </div>
  );
}