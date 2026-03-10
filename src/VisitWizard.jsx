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

  return (
    <div className="card">

      <h2>Visita técnica — {visit.direccion}</h2>

      <div style={{ marginBottom: 20 }}>
        Paso {step} de 6
      </div>

      {step === 1 && (
        <StepGeneral visit={visit} onNext={nextStep} />
      )}

      {step === 2 && (
        <StepDatosVivienda visit={visit} onNext={nextStep} onBack={prevStep} />
      )}

      {step === 3 && (
        <StepEnvelope visit={visit} onNext={nextStep} onBack={prevStep} />
      )}

      {step === 4 && (
        <StepWindows visit={visit} onNext={nextStep} onBack={prevStep} />
      )}

      {step === 5 && (
        <StepInstallations visit={visit} onNext={nextStep} onBack={prevStep} />
      )}

      {step === 6 && (
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

  // Estados para la lista de plantas
  const [plantas, setPlantas] = useState([]);
  const [alturaInput, setAlturaInput] = useState("");

  // Función para añadir una planta a la lista
  const añadirPlanta = () => {
    if (!alturaInput) {
      alert("Por favor, introduce la altura de la planta.");
      return;
    }
    // Añadimos la nueva planta numerándola automáticamente
    setPlantas([...plantas, { numero: plantas.length + 1, altura: alturaInput }]);
    setAlturaInput(""); // Limpiamos el input
  };

  // Función para quitar una planta por si se equivocan
  const eliminarPlanta = (index) => {
    // Filtramos la que queremos borrar y renumeramos las demás
    const nuevasPlantas = plantas
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, numero: i + 1 }));
    setPlantas(nuevasPlantas);
  };

  // Guardar en la base de datos y pasar al Step 3
  const guardarYContinuar = async () => {
    // Convertimos el array de plantas en un texto para tu backend (ej: "Planta 1: 2.5m | Planta 2: 3m")
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
          alturas_plantas: alturasTexto
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

      {/* BLOQUE 1: Dormitorios y Motivo */}
      <div style={{ display: 'grid', gap: '15px', padding: '15px', background: '#f0f4f8', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número de dormitorios:</label>
          <input 
            type="number" 
            min="0"
            value={dormitorios} 
            onChange={(e) => setDormitorios(e.target.value)} 
            placeholder="Ej: 3"
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
      </div>

      {/* BLOQUE 2: Altura de Plantas (Añadir a lista) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <h4 style={{ margin: 0 }}>Añadir Plantas</h4>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            step="0.01"
            placeholder="Altura de la planta (ej: 2.5)" 
            value={alturaInput} 
            onChange={(e) => setAlturaInput(e.target.value)} 
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={añadirPlanta} style={{ background: '#4CAF50', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Añadir Planta
          </button>
        </div>

        {/* Lista de plantas añadidas */}
        {/* Lista de plantas añadidas con diseño corregido */}
          {plantas.length > 0 && (
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plantas.map((planta, index) => (
              <div 
            key={index} 
            style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '10px 15px', 
            background: '#fff', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <span style={{ fontSize: '14px', color: '#333' }}>
          <strong>Planta {planta.numero}:</strong> {planta.altura} m
         </span>
        
        <button 
          onClick={() => eliminarPlanta(index)} 
          style={{ 
            background: '#ff4d4d', 
            color: 'white', 
            border: 'none', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Quitar
        </button>
      </div>
    ))}
  </div>
)}
      </div>

      {/* BOTONERA */}
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
      setElementos([...elementos, guardado]);
      setNuevo({ tipo: '', orientacion: '', largo: '', alto: '', observaciones: '' });
    } else {
      alert("Error guardando elemento");
    }
  };

  return (
    <div>
      <h3>Step 3: Envolvente térmica</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Seleccionar Tipo</option>
          <option value="Muro exterior">Muro exterior</option>
          <option value="Cubierta">Cubierta</option>
          <option value="Suelo">Suelo</option>
          <option value="Medianera">Medianera</option>
        </select>

        <select name="orientacion" value={nuevo.orientacion} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Seleccionar Orientación</option>
          <option>Norte</option><option>Sur</option><option>Este</option><option>Oeste</option>
        </select>

        <input type="number" name="largo" placeholder="Largo (m)" value={nuevo.largo} onChange={handleChange} style={{ padding: '8px' }} />
        <input type="number" name="alto" placeholder="Alto (m)" value={nuevo.alto} onChange={handleChange} style={{ padding: '8px' }} />
        <input name="observaciones" placeholder="Observaciones (ej: Doble tabique)" value={nuevo.observaciones} onChange={handleChange} style={{ padding: '8px' }} />

        <button onClick={añadirElemento} style={{ background: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Añadir a la lista
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Elementos en esta visita:</h4>
        {elementos.length === 0 ? <p>No hay elementos aún.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#ddd' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tipo</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Orient.</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>m²</th>
              </tr>
            </thead>
            <tbody>
              {elementos.map((el, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{el.tipo}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{el.orientacion}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{el.superficie} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Siguiente (Paso 4) →
        </button>
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
    tipo: '',
    marco: '',
    vidrio: '',
    ancho: '',
    alto: ''
  });
  
  // NUEVO: Estado para las fotos de la ventana
  const [fotos, setFotos] = useState([]);
  // Referencia para limpiar el input de fotos después de añadir
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    setFotos(e.target.files);
  };

  const añadirVentana = async () => {
    if (!nuevo.tipo || !nuevo.ancho || !nuevo.alto) {
      alert("Completa tipo, ancho y alto");
      return;
    }

    const superficieCalculada = Number(nuevo.ancho) * Number(nuevo.alto);

    // NUEVO: Usamos FormData porque ahora enviamos archivos
    const formData = new FormData();
    formData.append('nombre', nuevo.tipo);
    formData.append('marco', nuevo.marco);
    formData.append('vidrio', nuevo.vidrio);
    formData.append('superficie', superficieCalculada);

    // Añadimos las fotos al FormData
    for (let i = 0; i < fotos.length; i++) {
      formData.append('fotos', fotos[i]);
    }

    try {
      const response = await fetch(`${API_URL}/api/visits/${visit.id}/windows`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // OJO: Con FormData NO ponemos 'Content-Type'
        },
        body: formData
      });

      if (response.ok) {
        const guardada = await response.json();
        setWindows([...windows, guardada]);
        
        // Limpiamos el formulario para la siguiente ventana
        setNuevo({ tipo: '', marco: '', vidrio: '', ancho: '', alto: '' });
        setFotos([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Error guardando ventana");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión al guardar la ventana");
    }
  };

  return (
    <div>
      <h3>Step 4: Huecos (Ventanas)</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Seleccionar Tipo</option>
          <option>Ventana</option>
          <option>Puerta acristalada</option>
          <option>Ventanal</option>
        </select>

        <select name="marco" value={nuevo.marco} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Seleccionar Marco</option>
          <option>Aluminio</option>
          <option>PVC</option>
          <option>Madera</option>
          <option>Aluminio RPT</option>
        </select>

        <select name="vidrio" value={nuevo.vidrio} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Seleccionar Vidrio</option>
          <option>Simple</option>
          <option>Doble</option>
          <option>Triple</option>
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" name="ancho" placeholder="Ancho (m)" value={nuevo.ancho} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />
          <input type="number" name="alto" placeholder="Alto (m)" value={nuevo.alto} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />
        </div>

        {/* NUEVO: Input para subir fotos de la ventana */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
            Fotos de este hueco/ventana (opcional):
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

        <button onClick={añadirVentana} style={{ background: '#2196F3', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
          + Añadir Ventana
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Ventanas registradas:</h4>
        {windows.length === 0 ? <p>No hay ventanas añadidas.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
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
        <button onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>← Volver</button>
        <button onClick={onNext} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Siguiente (Paso 5) →
        </button>
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
          <option>Biomasa</option>
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

