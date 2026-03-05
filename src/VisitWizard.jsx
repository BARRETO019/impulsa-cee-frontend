import { useState } from 'react';
import StepPhotos from "./StepPhotos";

/**
 * ==========================================================
 * VISIT WIZARD — COMPLETAMENTE CORREGIDO Y COMENTADO
 * ==========================================================
 */
export default function VisitWizard({ visit, onBack }) {

  const [step, setStep] = useState(1);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

 return (
  <div className="card">

    <h2>Visita técnica — {visit.direccion}</h2>

    <div style={{ marginBottom: 20 }}>
      Paso {step} de 5
    </div>

    {step === 1 && (
      <StepGeneral visit={visit} onNext={nextStep} />
    )}

    {step === 2 && (
      <StepEnvelope visit={visit} onNext={nextStep} onBack={prevStep} />
    )}

    {step === 3 && (
      <StepWindows visit={visit} onNext={nextStep} onBack={prevStep} />
    )}

    {step === 4 && (
      <StepInstallations visit={visit} onNext={nextStep} onBack={prevStep} />
    )}

    {step === 5 && (
      <StepPhotos visit={visit} onBack={prevStep} />
    )}

    <button onClick={onBack} style={{ marginTop: 30 }}>
      Volver al Dashboard
    </button>

  </div>
);
}
//////////////////////////////////////////////////////////////////
// STEP 1 — DATOS GENERALES
//////////////////////////////////////////////////////////////////

function StepGeneral({ visit, onNext }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    provincia: visit.provincia || "",
    ano_construccion: "",
    zona_climatica: "",
    superficie_habitable: "",
    dormitorios: 1,
    tipo_aislamiento: "",
    motivo_certificado: "",
    plantas: [{ numero: 1, altura: "" }]
  });

  const [nuevaAltura, setNuevaAltura] = useState("");
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardarDatos = async () => {
    const alturasTexto = form.plantas.map(p => `Planta ${p.numero}: ${p.altura}m`).join(" | ");
    const response = await fetch(`${API_URL}/api/visits/${visit.id}/building`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        num_plantas: form.plantas.length,
        alturas_plantas: alturasTexto
      }),
    });

    if (response.ok) onNext();
    else alert("Error guardando datos");
  };

  return (
    <div>
      <h3>Datos Generales</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        <input name="provincia" placeholder="Provincia" onChange={handleChange} value={form.provincia} />
        <input name="ano_construccion" type="number" placeholder="Año Construcción" onChange={handleChange} />
        <select name="zona_climatica" onChange={handleChange}>
          <option value="">Zona Climática</option>
          <option value="A3">A3</option><option value="B3">B3</option><option value="C1">C1</option><option value="D3">D3</option>
        </select>
        <input name="superficie_habitable" type="number" placeholder="Superficie Habitable (m2)" onChange={handleChange} />
        <select name="motivo_certificado" onChange={handleChange}>
          <option value="">Motivo</option>
          <option value="Venta">Venta</option><option value="Alquiler">Alquiler</option>
        </select>
      </div>

      {/* ... Botón de plantas y Guardar que ya tenías ... */}
      <button onClick={guardarDatos} style={{ marginTop: 20 }}>Guardar y continuar →</button>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 2 — ENVOLVENTE
//////////////////////////////////////////////////////////////////

function StepEnvelope({ visit, onNext, onBack }) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const [elementos, setElementos] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: '',
    orientacion: '',
    largo: '',
    alto: '',
    observaciones: ''
  });

  // EFECTO: Carga los elementos que ya están en la DB al entrar
  useEffect(() => {
    fetch(`${API_URL}/api/visits/${visit.id}/envelope`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setElementos(data);
    })
    .catch(err => console.error("Error cargando envolvente:", err));
  }, [visit.id]);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirElemento = async () => {
    if (!nuevo.tipo || !nuevo.largo || !nuevo.alto) {
      alert("Completa tipo, largo y alto");
      return;
    }

    const superficieCalculada = Number(nuevo.largo) * Number(nuevo.alto);

    const response = await fetch(`${API_URL}/api/visits/${visit.id}/envelope`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tipo: nuevo.tipo,
        orientacion: nuevo.orientacion,
        superficie: superficieCalculada,
        nombre: nuevo.tipo,
        observaciones: nuevo.observaciones
      })
    });

    if (response.ok) {
      const guardado = await response.json();
      // Guardamos el objeto que viene de la DB para que tenga el ID y todo
      setElementos([...elementos, guardado]);
      setNuevo({ tipo: '', orientacion: '', largo: '', alto: '', observaciones: '' });
    } else {
      alert("Error guardando elemento");
    }
  };

  return (
    <div>
      <h3>Step 2: Envolvente térmica</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange}>
          <option value="">Seleccionar Tipo</option>
          <option value="Muro exterior">Muro exterior</option>
          <option value="Cubierta">Cubierta</option>
          <option value="Suelo">Suelo</option>
          <option value="Medianera">Medianera</option>
        </select>

        <select name="orientacion" value={nuevo.orientacion} onChange={handleChange}>
          <option value="">Seleccionar Orientación</option>
          <option>Norte</option><option>Sur</option><option>Este</option><option>Oeste</option>
        </select>

        <input type="number" name="largo" placeholder="Largo (m)" value={nuevo.largo} onChange={handleChange} />
        <input type="number" name="alto" placeholder="Alto (m)" value={nuevo.alto} onChange={handleChange} />
        <input name="observaciones" placeholder="Observaciones (ej: Doble tabique)" value={nuevo.observaciones} onChange={handleChange} />

        <button onClick={añadirElemento} style={{ background: '#4CAF50', color: 'white', padding: '10px' }}>
          + Añadir a la lista
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Elementos en esta visita:</h4>
        {elementos.length === 0 ? <p>No hay elementos aún.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ddd' }}>
                <th style={{ border: '1px solid #ccc', padding: '5px' }}>Tipo</th>
                <th style={{ border: '1px solid #ccc', padding: '5px' }}>Orient.</th>
                <th style={{ border: '1px solid #ccc', padding: '5px' }}>m²</th>
              </tr>
            </thead>
            <tbody>
              {elementos.map((el, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '5px' }}>{el.tipo}</td>
                  <td style={{ border: '1px solid #ccc', padding: '5px' }}>{el.orientacion}</td>
                  <td style={{ border: '1px solid #ccc', padding: '5px' }}>{el.superficie} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white' }}>
          Siguiente (Paso 3) →
        </button>
      </div>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 3 — VENTANAS
//////////////////////////////////////////////////////////////////

function StepWindows({ visit, onNext, onBack }) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const [windows, setWindows] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: '',
    marco: '',
    vidrio: '',
    ancho: '',
    alto: ''
  });

  // EFECTO: Carga las ventanas ya guardadas al entrar al paso
  useEffect(() => {
    fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setWindows(data);
    })
    .catch(err => console.error("Error cargando ventanas:", err));
  }, [visit.id]);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirVentana = async () => {
    if (!nuevo.tipo || !nuevo.ancho || !nuevo.alto) {
      alert("Completa tipo, ancho y alto");
      return;
    }

    const superficieCalculada = Number(nuevo.ancho) * Number(nuevo.alto);

    const response = await fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: nuevo.tipo, // Tu backend usa 'nombre' para el tipo de ventana
        marco: nuevo.marco,
        vidrio: nuevo.vidrio,
        superficie: superficieCalculada
      })
    });

    if (response.ok) {
      const guardada = await response.json();
      setWindows([...windows, guardada]);
      setNuevo({ tipo: '', marco: '', vidrio: '', ancho: '', alto: '' });
    } else {
      alert("Error guardando ventana");
    }
  };

  return (
    <div>
      <h3>Step 3: Huecos (Ventanas)</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange}>
          <option value="">Seleccionar Tipo</option>
          <option>Ventana</option>
          <option>Puerta acristalada</option>
          <option>Ventanal</option>
        </select>

        <select name="marco" value={nuevo.marco} onChange={handleChange}>
          <option value="">Seleccionar Marco</option>
          <option>Aluminio</option>
          <option>PVC</option>
          <option>Madera</option>
          <option>Aluminio RPT</option>
        </select>

        <select name="vidrio" value={nuevo.vidrio} onChange={handleChange}>
          <option value="">Seleccionar Vidrio</option>
          <option>Simple</option>
          <option>Doble</option>
          <option>Triple</option>
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="ancho" placeholder="Ancho (m)" value={nuevo.ancho} onChange={handleChange} style={{ flex: 1 }} />
          <input type="number" name="alto" placeholder="Alto (m)" value={nuevo.alto} onChange={handleChange} style={{ flex: 1 }} />
        </div>

        <button onClick={añadirVentana} style={{ background: '#2196F3', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Añadir Ventana
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Ventanas registradas:</h4>
        {windows.length === 0 ? <p>No hay ventanas añadidas.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tipo</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Marco/Vidrio</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>m²</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((w, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{w.nombre || w.tipo}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{w.marco} / {w.vidrio}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{w.superficie} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Siguiente (Paso 4) →
        </button>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////
// STEP 4 — INSTALACIONES TÉRMICAS
//////////////////////////////////////////////////////////////////

function StepInstallations({ visit, onNext, onBack }) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const [instalaciones, setInstalaciones] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: '',
    energia: '',
    marca_modelo: '',
    potencia: '',
    ano_aprox: '',
    observaciones: ''
  });

  // EFECTO: Carga instalaciones guardadas al entrar
  useEffect(() => {
    fetch(`${API_URL}/api/visits/${visit.id}/installations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setInstalaciones(data);
    })
    .catch(err => console.error("Error cargando instalaciones:", err));
  }, [visit.id]);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirInstalacion = async () => {
    if (!nuevo.tipo || !nuevo.energia) {
      alert("Completa tipo y energía");
      return;
    }

    const response = await fetch(`${API_URL}/api/visits/${visit.id}/installations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      // Enviamos el objeto 'nuevo' tal cual lo tienes
      body: JSON.stringify(nuevo)
    });

    if (response.ok) {
      const guardado = await response.json();
      setInstalaciones([...instalaciones, guardado]);
      setNuevo({
        tipo: '',
        energia: '',
        marca_modelo: '',
        potencia: '',
        ano_aprox: '',
        observaciones: ''
      });
    } else {
      alert("Error guardando instalación");
    }
  };

  return (
    <div>
      <h3>Step 4: Instalaciones Térmicas</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffcc80' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange}>
          <option value="">Tipo de equipo</option>
          <option value="Caldera">Caldera</option>
          <option value="Bomba de calor">Bomba de calor</option>
          <option value="Split aire acondicionado">Split aire acondicionado</option>
          <option value="Radiadores eléctricos">Radiadores eléctricos</option>
          <option value="Termo eléctrico">Termo eléctrico</option>
          <option value="Chimenea">Chimenea</option>
        </select>

        <select name="energia" value={nuevo.energia} onChange={handleChange}>
          <option value="">Combustible / Energía</option>
          <option>Gas natural</option>
          <option>Gasóleo</option>
          <option>Electricidad</option>
          <option>Biomasa</option>
          <option>Propano</option>
        </select>

        <input name="marca_modelo" placeholder="Marca / Modelo" value={nuevo.marca_modelo} onChange={handleChange} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="potencia" placeholder="Potencia (kW)" value={nuevo.potencia} onChange={handleChange} style={{ flex: 1 }} />
          <input type="number" name="ano_aprox" placeholder="Año aprox." value={nuevo.ano_aprox} onChange={handleChange} style={{ flex: 1 }} />
        </div>

        <input name="observaciones" placeholder="Observaciones" value={nuevo.observaciones} onChange={handleChange} />

        <button onClick={añadirInstalacion} style={{ background: '#ff9800', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Añadir Equipo
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Equipos en esta visita:</h4>
        {instalaciones.length === 0 ? <p>No hay equipos registrados.</p> : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {instalaciones.map((eq, i) => (
              <div key={i} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', background: '#fff' }}>
                <strong>{eq.tipo}</strong> - {eq.energia || eq.combustible} <br/>
                <small>{eq.marca_modelo || eq.generador || 'Marca no especificada'} | {eq.potencia || eq.potencia_nominal} kW | Año: {eq.ano_aprox || eq.ano_instalacion}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Siguiente (Fotos) →
        </button>
      </div>
    </div>
  );
}