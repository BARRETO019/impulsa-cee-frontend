import { useEffect, useState } from 'react';
import VisitWizard from './VisitWizard';

export default function Dashboard({ onLogout }) {

  const [visits, setVisits] = useState([]);
  const [clientesPlaneados, setClientesPlaneados] = useState([]);
  const [visitActiva, setVisitActiva] = useState(null);

  // 🔥 Sacamos el role desde el token correctamente
  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    userRole = decoded.role;
  }

  // ==============================
  // CARGA INICIAL
  // ==============================

  useEffect(() => {

    const fetchVisits = async () => {
      try {
        const response = await fetch('https://impulsa-cee-backend.onrender.com/api/visits', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) setVisits(data);

      } catch (error) {
        console.error(error);
      }
    };

    const fetchPlaneados = async () => {
      try {
        const response = await fetch(
          'https://impulsa-cee-backend.onrender.com/api/visits/airtable/planeados'
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

  // ==============================
  // INICIAR VISITA
  // ==============================

  const iniciarVisita = async (cliente) => {

    try {

      const response = await fetch('https://impulsa-cee-backend.onrender.com/api/visits', {
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
        setVisitActiva(data);
      } else {
        alert(data.error || 'Error iniciando visita');
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ==============================
  // FINALIZAR VISITA
  // ==============================

  const finalizeVisit = async (id) => {

    const response = await fetch(
      `https://impulsa-cee-backend.onrender.com/api/visits/${id}/finalize`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.ok) {
      setVisits(prev =>
        prev.map(v =>
          v.id === id ? { ...v, estado: 'finalizada' } : v
        )
      );
    } else {
      alert("Error finalizando");
    }
  };

  // ==============================
  // BORRAR VISITA (solo CEO)
  // ==============================

  const borrarVisita = async (id) => {

    const confirmacion = window.confirm(
      "¿Seguro que quieres eliminar esta visita?"
    );

    if (!confirmacion) return;

    const response = await fetch(
      `https://impulsa-cee-backend.onrender.com/api/visits/${id}`,
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

  // ==============================
  // MOSTRAR WIZARD
  // ==============================

  if (visitActiva) {
    return (
      <VisitWizard
        visit={visitActiva}
        onBack={() => setVisitActiva(null)}
      />
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div>

      <div className="card">
        <h2>Clientes Planeados</h2>

        {clientesPlaneados.length === 0 ? (
          <p>No hay clientes pendientes.</p>
        ) : (
          clientesPlaneados.map(cliente => (
            <div key={cliente.airtable_id} className="card">
              <strong>{cliente.cliente}</strong>
              <br />
              {cliente.municipio}
              <br />
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

      <div className="card">
        <h2>Mis Visitas</h2>

        {visits.length === 0 ? (
          <p>No hay visitas aún.</p>
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="card">

              <strong>{visit.direccion}</strong>
              <br />
              {visit.municipio} — {visit.estado}

              {visit.estado !== 'finalizada' && (
                <button
                  onClick={() => finalizeVisit(visit.id)}
                  style={{ marginTop: 10 }}
                >
                  Finalizar
                </button>
              )}

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