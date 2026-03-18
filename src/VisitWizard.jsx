import React, { useState, useEffect, useRef } from 'react';
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

  const pestañas = [
    { id: 1, nombre: "Fachadas" },
    { id: 2, nombre: "Vivienda" },
    { id: 3, nombre: "Envolvente" },
    { id: 4, nombre: "Ventanas" },
    { id: 5, nombre: "Equipos" },
    { id: 6, nombre: "Fotos" }
  ];

  return (
    <div className="card" style={{ padding: '15px' }}>
      
      <h2 style={{
        fontSize: '1.2rem',
        marginBottom: '15px',
        color: '#166534',
        borderLeft: '4px solid #166534',
        paddingLeft: '10px'
      }}>
        Visita: <span style={{ fontWeight: 'normal', color: '#444' }}>
          {visit.direccion}
        </span>
      </h2>

      {/* MENÚ */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
      }}>
        {pestañas.map((p) => (
          <button
            key={p.id}
            onClick={() => setStep(p.id)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: step === p.id ? '#166534' : '#e5e7eb',
              background: step === p.id ? '#166534' : '#fff',
              color: step === p.id ? '#fff' : '#666',
              cursor: 'pointer'
            }}
          >
            {p.id}. {p.nombre}
          </button>
        ))}
      </div>

      {/* STEPS */}

      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <StepGeneral visit={visit} onNext={nextStep} />
      </div>

      <div style={{ display: step === 2 ? 'block' : 'none' }}>
        <StepDatosVivienda visit={visit} onNext={nextStep} onBack={prevStep} />
      </div>

      <div style={{ display: step === 3 ? 'block' : 'none' }}>
        <StepEnvelope visit={visit} onNext={nextStep} onBack={prevStep} />
      </div>

      <div style={{ display: step === 4 ? 'block' : 'none' }}>
        <StepWindows visit={visit} onNext={nextStep} onBack={prevStep} />
      </div>

      <div style={{ display: step === 5 ? 'block' : 'none' }}>
        <StepInstallations visit={visit} onNext={nextStep} onBack={prevStep} />
      </div>

      <div style={{ display: step === 6 ? 'block' : 'none' }}>
        <StepPhotos visit={visit} onBack={prevStep} />
      </div>

      {/* SALIR */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <button onClick={onBack}>
          ✕ Guardar y salir
        </button>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////////////////
// STEP 1 — DATOS GENERALES
//////////////////////////////////////////////////////////////////
function StepGeneral({ visit, onNext }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // 1. Estado para la lista definitiva de fachadas añadidas
  const [fachadas, setFachadas] = useState([]);

  // 2. Estado temporal para los inputs que se están rellenando
  const [orientacionActual, setOrientacionActual] = useState("");
  const [fotosActuales, setFotosActuales] = useState([]);

  // Referencia para poder vaciar el input de archivos visualmente tras añadir
  const fileInputRef = useRef(null);

  // Función para añadir lo que hay en los inputs a la lista
  const añadirElemento = () => {
    if (!orientacionActual) {
      alert("Por favor, selecciona una orientación antes de añadir a la lista.");
      return;
    }

    // Añadimos el nuevo elemento al array
    setFachadas([...fachadas, { 
      orientacion: orientacionActual, 
      // Convertimos el FileList del input a un Array normal para manejarlo mejor
      fotos: Array.from(fotosActuales) 
    }]);

    // Limpiamos los inputs temporales para que pueda añadir otra
    setOrientacionActual("");
    setFotosActuales([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Función extra: por si el técnico se equivoca y quiere quitar una de la lista
  const eliminarElemento = (index) => {
    const nuevaLista = fachadas.filter((_, i) => i !== index);
    setFachadas(nuevaLista);
  };

  const guardarDatos = async () => {
    if (fachadas.length === 0) {
      alert("Añade al menos una fachada a la lista antes de continuar.");
      return;
    }

    const formData = new FormData();
    
    // Mandamos el array de orientaciones como un texto JSON (ej: ["Norte", "Sur"])
    const datosOrientaciones = fachadas.map(f => f.orientacion);
    formData.append("orientaciones", JSON.stringify(datosOrientaciones));

    // Añadimos las fotos al FormData. 
    // Usamos un índice en el nombre (ej: fotos_fachada_0, fotos_fachada_1) 
    // para que el backend sepa a qué fachada pertenece cada bloque de fotos.
    fachadas.forEach((fachada, index) => {
      fachada.fotos.forEach(foto => {
        formData.append(`fotos_fachada_${index}`, foto);
      });
    });

    try {
      const response = await fetch(`${API_URL}/api/visits/${visit.id}/building`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        onNext();
      } else {
        alert("Error guardando datos de las fachadas");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión al guardar");
    }
  };

  return (
    <div>
      <h3>Datos de las Fachadas</h3>
      
      {/* SECCIÓN 1: Inputs temporales para añadir */}
      <div style={{ display: 'grid', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <label htmlFor="orientacionFachada" style={{ display: 'block', marginBottom: '5px' }}>
            Orientación de la fachada:
          </label>
          <select 
            id="orientacionFachada"
            value={orientacionActual}
            onChange={(e) => setOrientacionActual(e.target.value)} 
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Selecciona una orientación...</option>
            <option value="Norte">Norte</option>
            <option value="Noreste">Noreste</option>
            <option value="Este">Este</option>
            <option value="Sureste">Sureste</option>
            <option value="Sur">Sur</option>
            <option value="Suroeste">Suroeste</option>
            <option value="Oeste">Oeste</option>
            <option value="Noroeste">Noroeste</option>
          </select>
        </div>

        <div>
          <label htmlFor="fotosFachada" style={{ display: 'block', marginBottom: '5px' }}>
            Fotos de esta fachada:
          </label>
          <input 
            type="file" 
            id="fotosFachada"
            multiple 
            accept="image/*" 
            ref={fileInputRef}
            onChange={(e) => setFotosActuales(e.target.files)} 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          onClick={añadirElemento} 
          style={{ background: '#4CAF50', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          + Añadir a la lista
        </button>
      </div>

      {/* SECCIÓN 2: Lista de fachadas añadidas */}
      {fachadas.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Fachadas añadidas:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {fachadas.map((fachada, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <span>
                  <strong>{fachada.orientacion}:</strong> {fachada.fotos.length} foto(s)
                </span>
                <button 
                  onClick={() => eliminarElemento(index)}
                  style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SECCIÓN 3: Guardar y enviar al backend */}
      <button onClick={guardarDatos} style={{ marginTop: 10, padding: '10px 20px', width: '100%' }}>
        Guardar y continuar →
      </button>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 2 — DATOS VIVIENDA
//////////////////////////////////////////////////////////////////
function StepDatosVivienda({ visit, onNext, onBack }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para los datos generales
  const [dormitorios, setDormitorios] = useState("");
  const [motivo, setMotivo] = useState("");
  const [potenciaInstalada, setPotenciaInstalada] = useState(""); // nuevo exigido 13/03

  // Estados para la lista de plantas
  const [plantas, setPlantas] = useState([]);
  const [alturaInput, setAlturaInput] = useState("");

  const añadirPlanta = () => {
    if (!alturaInput) {
      alert("Por favor, introduce la altura de la planta.");
      return;
    }
    setPlantas([...plantas, { numero: plantas.length + 1, altura: alturaInput }]);
    setAlturaInput("");
  };

  const eliminarPlanta = (index) => {
    const nuevasPlantas = plantas
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, numero: i + 1 }));
    setPlantas(nuevasPlantas);
  };

  const guardarYContinuar = async () => {
    const alturasTexto = plantas.map(p => `Planta ${p.numero}: ${p.altura}m`).join(" | ");

    try {
      const response = await fetch(`${API_URL}/api/visits/${visit.id}/building`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          dormitorios: dormitorios,
          motivo_certificado: motivo,
          num_plantas: plantas.length,
          alturas_plantas: alturasTexto,
          potencia_instalada: potenciaInstalada // nuevo exigido 13/03
        }),
      });

      if (response.ok) {
        onNext();
      } else {
        alert("Error al guardar los datos de la vivienda.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión.");
    }
  };

  return (
    <div>
      <h3>Step 2: Datos de la Vivienda</h3>

      <div style={{ display: 'grid', gap: '15px', padding: '15px', background: '#f0f4f8', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número de dormitorios:</label>
          <input 
            type="number" 
            value={dormitorios} 
            onChange={(e) => setDormitorios(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Motivo del certificado:</label>
          <select 
            value={motivo} 
            onChange={(e) => setMotivo(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Selecciona un motivo...</option>
            <option value="1º Solar">1º Solar</option>
            <option value="2º Solar">2º Solar</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
            <option value="1º PREE">1º PREE</option>
            <option value="2º PREE">2º PREE</option>
            <option value="1º Aerotermia">1º Aerotermia</option>
            <option value="2º Aerotermia">2º Aerotermia</option>
            <option value="Hipoteca">Hipoteca</option>
            <option value="Obra Nueva / Licencia 1ª Ocupación">Obra Nueva / Licencia 1ª Ocupación</option>
          </select>
        </div>

        {/* CAMPO CONDICIONAL */}
        {(motivo === '1º Solar' || motivo === '2º Solar') && (
          <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeeba' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#856404' }}>
              Potencia Instalada (kW):
            </label>
            <input 
              type="number" 
              step="0.01"
              value={potenciaInstalada} 
              onChange={(e) => setPotenciaInstalada(e.target.value)} 
              placeholder="Ej: 5.25"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <h4 style={{ margin: 0 }}>Añadir Plantas</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            step="0.01"
            placeholder="Altura de la planta" 
            value={alturaInput} 
            onChange={(e) => setAlturaInput(e.target.value)} 
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={añadirPlanta} style={{ background: '#4CAF50', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Añadir Planta
          </button>
        </div>

        {plantas.length > 0 && (
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plantas.map((planta, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                <span><strong>Planta {planta.numero}:</strong> {planta.altura} m</span>
                <button onClick={() => eliminarPlanta(index)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>← Volver</button>
        <button onClick={guardarYContinuar} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Siguiente (Paso 3) →
        </button>
      </div>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 3 — ENVOLVENTE 
//////////////////////////////////////////////////////////////////
function StepEnvelope({ visit, onNext, onBack }) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const [elementos, setElementos] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: '',
    orientacion: '',
    largo: '',
    ancho: '', // Se usa como espesor en muros o ancho en suelos
    alto: '',
    observaciones: ''
  });

  // 1. Cargar datos al iniciar
  useEffect(() => {
    fetch(`${API_URL}/api/visits/${visit.id}/envelope`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setElementos(data);
    })
    .catch(err => console.error("Error cargando envolvente:", err));
  }, [visit.id, API_URL, token]);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirElemento = async () => {
    if (!nuevo.tipo) return alert("Selecciona un tipo de elemento");

    const l = parseFloat(nuevo.largo) || 0;
    const an = parseFloat(nuevo.ancho) || 0;
    const al = parseFloat(nuevo.alto) || 0;

    // Cálculo automático de superficie
    let superficieCalculada = 0;
    if (l > 0 && al > 0) superficieCalculada = l * al;
    else if (l > 0 && an > 0) superficieCalculada = l * an;
    else if (an > 0 && al > 0) superficieCalculada = an * al;

    if (superficieCalculada === 0) {
      return alert("Introduce al menos dos medidas (Largo, Ancho o Alto)");
    }

    try {
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
          largo: l,
          ancho: an,
          alto: al,
          observaciones: nuevo.observaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        setElementos([...elementos, data]);
        // Limpiar formulario
        setNuevo({ tipo: '', orientacion: '', largo: '', ancho: '', alto: '', observaciones: '' });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar elemento?")) return;
    const res = await fetch(`${API_URL}/api/visits/${visit.id}/envelope/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setElementos(elementos.filter(e => e.id !== id));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <h3 style={{ color: '#166534', fontSize: '1.1rem', marginBottom: '15px' }}>Paso 3: Envolvente</h3>

      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* SELECTOR DE TIPO */}
        <select name="tipo" value={nuevo.tipo} onChange={handleChange} style={{ padding: '10px', borderRadius: '8px' }}>
          <option value="">Seleccionar tipo...</option>
          <option value="Muro exterior">Muro exterior (Fachada)</option>
          <option value="Medianera">Medianera</option>
          <option value="Cubierta">Cubierta / Tejado</option>
          <option value="Suelo">Suelo / Forjado inferior</option>
          <option value="Partición vertical">Partición vertical (Tabique)</option>
          <option value="Partición horizontal">Partición horizontal (Techo)</option>
        </select>

        {/* SELECTOR DE ORIENTACIÓN */}
        <select name="orientacion" value={nuevo.orientacion} onChange={handleChange} style={{ padding: '10px', borderRadius: '8px' }}>
          <option value="">Seleccionar orientación / ubicación...</option>
          <option value="N">Norte</option>
          <option value="S">Sur</option>
          <option value="E">Este</option>
          <option value="O">Oeste</option>
          <option value="NE">Noreste</option>
          <option value="NO">Noroeste</option>
          <option value="SE">Sureste</option>
          <option value="SO">Suroeste</option>
          <option value="Horizontal">Horizontal (Suelos/Techados)</option>
        </select>

        {/* MEDIDAS EN METROS (SIEMPRE VISIBLES PARA EVITAR ERRORES) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#64748b' }}>Largo (m)</label>
            <input type="number" name="largo" value={nuevo.largo} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '10px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#64748b' }}>Ancho (m)</label>
            <input type="number" name="ancho" value={nuevo.ancho} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '10px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#64748b' }}>Alto (m)</label>
            <input type="number" name="alto" value={nuevo.alto} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '10px' }} />
          </div>
        </div>

        <input name="observaciones" value={nuevo.observaciones} onChange={handleChange} placeholder="Observaciones (ej. Aislamiento 4cm)" style={{ padding: '10px', borderRadius: '8px' }} />

        <button onClick={añadirElemento} style={{ background: '#166534', color: 'white', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          + Guardar Elemento
        </button>
      </div>

      {/* TABLA RESUMEN */}
      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        {elementos.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Tipo</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>m²</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {elementos.map(el => (
                <tr key={el.id}>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    <strong>{el.tipo}</strong> ({el.orientacion})
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    {el.superficie} m²
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <button onClick={() => eliminar(el.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>Atrás</button>
        <button onClick={onNext} style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#007bff', color: 'white', border: 'none', fontWeight: 'bold' }}>Siguiente</button>
      </div>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 4 — VENTANAS
//////////////////////////////////////////////////////////////////
function StepWindows({ visit, onNext, onBack }) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const [windows, setWindows] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: '', marco: '', vidrio: '', ancho: '', alto: '', orientacion: '', 
    proteccion_solar: '', retranqueo: '', voladizo: '' 
  });
  
  const [fotos, setFotos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setWindows(data); });
  }, [visit.id]);

  const handleChange = (e) => setNuevo({ ...nuevo, [e.target.name]: e.target.value });

  const añadirVentana = async () => {
    if (!nuevo.tipo || !nuevo.proteccion_solar) return alert("Completa tipo y protección");
    
    const formData = new FormData();
    Object.keys(nuevo).forEach(key => formData.append(key, nuevo[key]));
    formData.append('superficie', Number(nuevo.ancho) * Number(nuevo.alto));
    formData.append('largo', nuevo.ancho);
    Array.from(fotos).forEach(f => formData.append('fotos', f));

    const res = await fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
    });
    
    if (res.ok) {
      const data = await res.json();
      setWindows([...windows, data]);
      setNuevo({ tipo: '', marco: '', vidrio: '', ancho: '', alto: '', orientacion: '', proteccion_solar: '', retranqueo: '', voladizo: '' });
      setFotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const duplicarVentana = async (v) => {
    const res = await fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...v, id: undefined })
    });
    if (res.ok) {
      const data = await res.json();
      setWindows([...windows, data]);
    }
  };

  const eliminarVentana = async (id) => {
    if (!window.confirm("¿Borrar ventana?")) return;
    const res = await fetch(`${API_URL}/api/visits/${visit.id}/windows/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setWindows(windows.filter(w => w.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select name="tipo" value={nuevo.tipo} onChange={handleChange} style={{ flex: 1, padding: '10px' }}>
            <option value="">Tipo...</option>
            <option>Ventana</option><option>Puerta acristalada</option>
          </select>
          <select name="orientacion" value={nuevo.orientacion} onChange={handleChange} style={{ flex: 1, padding: '10px' }}>
            <option value="">Orientación...</option>
            <option>N</option><option>S</option><option>E</option><option>O</option>
          </select>
        </div>

        <select name="proteccion_solar" value={nuevo.proteccion_solar} onChange={handleChange} style={{ padding: '10px', border: '2px solid #c0392b', borderRadius: '8px' }}>
          <option value="">Protección Solar (CE3X)...</option>
          <option value="Sin protección">Sin protección</option>
          <option value="Retranqueo">Retranqueo</option>
          <option value="Voladizo">Voladizo</option>
          <option value="Persiana">Persiana</option>
        </select>

        {(nuevo.proteccion_solar.includes('Retranqueo') || nuevo.proteccion_solar.includes('Voladizo')) && (
          <div style={{ display: 'flex', gap: '10px', background: '#fffbe6', padding: '10px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
            {nuevo.proteccion_solar.includes('Retranqueo') && <input type="number" name="retranqueo" placeholder="m Retranqueo" value={nuevo.retranqueo} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />}
            {nuevo.proteccion_solar.includes('Voladizo') && <input type="number" name="voladizo" placeholder="m Voladizo" value={nuevo.voladizo} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="ancho" placeholder="Ancho (m)" value={nuevo.ancho} onChange={handleChange} style={{ flex: 1, padding: '10px' }} />
          <input type="number" name="alto" placeholder="Alto (m)" value={nuevo.alto} onChange={handleChange} style={{ flex: 1, padding: '10px' }} />
        </div>

        <button onClick={añadirVentana} style={{ background: '#166534', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>+ Guardar Ventana</button>
      </div>

      {/* LISTADO CON BOTÓN DUPLICAR (+) */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {windows.map((w) => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{w.nombre} - {w.orientacion}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{w.largo}x{w.alto}m | {w.proteccion_solar}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={() => duplicarVentana(w)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #166534', background: '#ecfdf5', color: '#166534', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>+</button>
              <button onClick={() => eliminarVentana(w.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '22px', padding: 0, cursor: 'pointer' }}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#eee', border: 'none' }}>Atrás</button>
        <button onClick={onNext} style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#007bff', color: 'white', border: 'none' }}>Siguiente</button>
      </div>
    </div>
  );
}
//////////////////////////////////////////////////////////////////
// STEP 5 — INSTALACIONES TÉRMICAS
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

  // NUEVO: Estado para las fotos del equipo
  const [fotos, setFotos] = useState([]);
  // Referencia para limpiar el input de fotos después de añadir
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    setFotos(e.target.files);
  };

  const añadirInstalacion = async () => {
    if (!nuevo.tipo || !nuevo.energia) {
      alert("Completa tipo y energía");
      return;
    }

    // NUEVO: Usamos FormData para enviar texto + imágenes
    const formData = new FormData();
    formData.append('tipo', nuevo.tipo);
    formData.append('energia', nuevo.energia);
    formData.append('marca_modelo', nuevo.marca_modelo);
    formData.append('potencia', nuevo.potencia);
    formData.append('ano_aprox', nuevo.ano_aprox);
    formData.append('observaciones', nuevo.observaciones);

    // Añadimos las fotos seleccionadas al FormData
    for (let i = 0; i < fotos.length; i++) {
      formData.append('fotos', fotos[i]);
    }

    try {
      const response = await fetch(`${API_URL}/api/visits/${visit.id}/installations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Recuerda: Sin 'Content-Type' cuando se usa FormData
        },
        body: formData
      });

      if (response.ok) {
        const guardado = await response.json();
        setInstalaciones([...instalaciones, guardado]);
        
        // Limpiamos los inputs
        setNuevo({
          tipo: '',
          energia: '',
          marca_modelo: '',
          potencia: '',
          ano_aprox: '',
          observaciones: ''
        });
        setFotos([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Error guardando instalación");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión al guardar la instalación");
    }
  };

  return (
    <div>
      <h3>Step 5: Instalaciones Térmicas</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffcc80' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Tipo de equipo</option>
          <option value="Caldera">Caldera</option>
          <option value="Bomba de calor">Bomba de calor</option>
          <option value="Split aire acondicionado">Split aire acondicionado</option>
          <option value="Radiadores eléctricos">Radiadores eléctricos</option>
          <option value="Termo eléctrico">Termo eléctrico</option>
          <option value="Chimenea">Chimenea</option>
        </select>

        <select name="energia" value={nuevo.energia} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Combustible / Energía</option>
          <option>Gas natural</option>
          <option>Gasóleo</option>
          <option>Electricidad</option>
          <option>Biomasa densificada pelets</option>
          <option>Biomasa no densificada leña </option>
          <option>Propano</option>
        </select>

        <input name="marca_modelo" placeholder="Marca / Modelo" value={nuevo.marca_modelo} onChange={handleChange} style={{ padding: '8px' }} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="potencia" placeholder="Potencia (kW)" value={nuevo.potencia} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />
          <input type="number" name="ano_aprox" placeholder="Año aprox." value={nuevo.ano_aprox} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />
        </div>

        <input name="observaciones" placeholder="Observaciones" value={nuevo.observaciones} onChange={handleChange} style={{ padding: '8px' }} />

        {/* NUEVO: Input para las fotos de la instalación */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
            Fotos del equipo (ej. etiqueta técnica):
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button onClick={añadirInstalacion} style={{ background: '#ff9800', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
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
        <button onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Siguiente (Paso 6: Fotos Generales) →
        </button>
      </div>
    </div>
  );
}

