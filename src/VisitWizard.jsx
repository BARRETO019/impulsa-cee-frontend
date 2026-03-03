import { useState } from 'react';

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
        Paso {step} de 4
      </div>

      {/* Renderiza cada paso */}
      {step === 1 && <StepGeneral visit={visit} onNext={nextStep} />}
      {step === 2 && <StepEnvelope visit={visit} onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <StepInstallations visit={visit} onNext={nextStep} onBack={prevStep} />}
      {step === 4 && <StepPhotos visit={visit} onBack={prevStep} />}

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
    provincia: "",
    dormitorios: 1,
    tipo_aislamiento: "",
    motivo_certificado: "",
    plantas: [
      { numero: 1, altura: "" }
    ]
  });

  const [nuevaAltura, setNuevaAltura] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Añadir planta desde UI
  const addPlantaDesdeUI = () => {
    if (!nuevaAltura) {
      alert("Introduce la altura");
      return;
    }

    setForm(prev => ({
      ...prev,
      plantas: [
        ...prev.plantas,
        {
          numero: prev.plantas.length + 1,
          altura: nuevaAltura
        }
      ]
    }));

    setNuevaAltura("");
  };

  // Borrar planta
  const removePlanta = (index) => {
    const nuevas = form.plantas.filter((_, i) => i !== index);
    nuevas.forEach((p, i) => p.numero = i + 1);
    setForm({ ...form, plantas: nuevas });
  };

  const guardarDatos = async () => {
    const alturasTexto = form.plantas
      .map((p) => `Planta ${p.numero}: ${p.altura}m`)
      .join(" | ");

    const response = await fetch(
      `${API_URL}/api/visits/${visit.id}/building`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provincia: form.provincia,
          dormitorios: form.dormitorios,
          num_plantas: form.plantas.length,
          alturas_plantas: alturasTexto,
          tipo_aislamiento: form.tipo_aislamiento,
          motivo_certificado: form.motivo_certificado
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      onNext();
    } else {
      console.log(data);
      alert(data.error || "Error guardando datos");
    }
  };

  return (
    <div>
      <h3>Datos generales (Prueba)</h3>

      <input value={visit.direccion} disabled />
      <input value={visit.municipio} disabled />

      <input
        placeholder="Provincia"
        name="provincia"
        onChange={handleChange}
      />

      {/* ============================
          PLANTAS (nuevo diseño)
      ============================ */}
      <h4 style={{ marginTop: 25 }}>Plantas</h4>

      {/* Formulario añadir nueva planta */}
      <div style={{
        marginTop: 15,
        padding: 15,
        border: "1px solid #ccc",
        borderRadius: 8,
        background: "#f8f9fa"
      }}>
        <label style={{ fontWeight: 600 }}>Altura de la planta (m)</label>
        <input
          type="number"
          placeholder="Ej: 2.5"
          value={nuevaAltura}
          onChange={(e) => setNuevaAltura(e.target.value)}
          style={{ width: "100%", marginTop: 5 }}
        />

        <button
          onClick={addPlantaDesdeUI}
          style={{
            marginTop: 15,
            width: "100%",
            background: "#0f5132",
            color: "white",
            padding: "10px 0",
            borderRadius: 6,
            fontSize: 16
          }}
        >
          + Añadir planta
        </button>
      </div>

      {/* Listado de plantas añadidas */}
      {form.plantas.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Plantas añadidas</h4>

          {form.plantas.map((p, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                background: "white"
              }}
            >
              <div>
                <strong>Planta {p.numero}</strong> — {p.altura} m
              </div>

              <button
                type="button"
                onClick={() => removePlanta(i)}
                style={{
                  background: "#842029",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: 4
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tipo aislamiento */}
      <div style={{ marginTop: 30 }}>
        <h4 style={{ marginBottom: 8 }}>Tipo de aislamiento</h4>
        <select
          name="tipo_aislamiento"
          value={form.tipo_aislamiento}
          onChange={handleChange}
        >
          <option value="">Seleccionar tipo</option>
          <option value="Lana mineral">Lana mineral</option>
          <option value="Poliestireno">Poliestireno</option>
          <option value="Sin aislamiento">Sin aislamiento</option>
          <option value="Desconocido">Desconocido</option>
        </select>
      </div>

      {/* Motivo del certificado */}
      <div style={{ marginTop: 25 }}>
        <h4 style={{ marginBottom: 8 }}>Motivo del certificado</h4>
        <select
          name="motivo_certificado"
          value={form.motivo_certificado}
          onChange={handleChange}
        >
          <option value="">Seleccionar motivo</option>
          <option value="Venta">Venta</option>
          <option value="Alquiler">Alquiler</option>
          <option value="Renovación">Renovación</option>
        </select>
      </div>

      <button onClick={guardarDatos} style={{ marginTop: 20 }}>
        Guardar y continuar →
      </button>
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

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirElemento = async () => {

    if (!nuevo.tipo || !nuevo.largo || !nuevo.alto) {
      alert("Completa tipo, largo y alto");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/visits/${visit.id}/envelope`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevo)
      }
    );

    if (response.ok) {
      setElementos([...elementos, nuevo]);
      setNuevo({
        tipo: '',
        orientacion: '',
        largo: '',
        alto: '',
        observaciones: ''
      });
    } else {
      alert("Error guardando elemento");
    }
  };

  return (
    <div>

      <h3>Envolvente térmica</h3>

      {/* FORMULARIO */}
      <div style={{ marginTop: 15 }}>
        <label>Tipo de elemento</label>
        <select
          name="tipo"
          value={nuevo.tipo}
          onChange={handleChange}
        >
          <option value="">Seleccionar</option>
          <option value="Muro exterior">Muro exterior</option>
          <option value="Cubierta">Cubierta</option>
          <option value="Suelo">Suelo</option>
          <option value="Medianera">Medianera</option>
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Orientación</label>
          <select
            name="orientacion"
            value={nuevo.orientacion}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>
            <option>Norte</option>
            <option>Sur</option>
            <option>Este</option>
            <option>Oeste</option>
          </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Largo (m)</label>
        <input
          type="number"
          name="largo"
          value={nuevo.largo}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Alto (m)</label>
        <input
          type="number"
          name="alto"
          value={nuevo.alto}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Observaciones</label>
        <input
          name="observaciones"
          value={nuevo.observaciones}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={añadirElemento}
        style={{ marginTop: 15 }}
      >
        + Añadir elemento
      </button>

      {/* LISTADO */}
      {elementos.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Elementos añadidos</h4>
          {elementos.map((el, i) => (
            <div key={i}>
              {el.tipo} — {el.orientacion} — {el.largo}m x {el.alto}m
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={onBack}>← Volver</button>
        <button onClick={onNext} style={{ marginLeft: 10 }}>
          Guardar y continuar →
        </button>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////////////////
// STEP 3 — INSTALACIONES TÉRMICAS
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

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const añadirInstalacion = async () => {

    if (!nuevo.tipo || !nuevo.energia) {
      alert("Completa tipo y energía");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/visits/${visit.id}/installations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevo)
      }
    );

    if (response.ok) {
      setInstalaciones([...instalaciones, nuevo]);
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

      <h3>Instalaciones térmicas</h3>

      {/* Tipo de equipo */}
      <div style={{ marginTop: 15 }}>
        <label>Tipo de equipo</label>
        <select
          name="tipo"
          value={nuevo.tipo}
          onChange={handleChange}
        >
          <option value="">Seleccionar</option>
          <option value="Caldera">Caldera</option>
          <option value="Bomba de calor">Bomba de calor</option>
          <option value="Split aire acondicionado">Split aire acondicionado</option>
          <option value="Radiadores eléctricos">Radiadores eléctricos</option>
          <option value="Termo eléctrico">Termo eléctrico</option>
          <option value="Chimenea">Chimenea</option>
        </select>
      </div>

      {/* Energía */}
      <div style={{ marginTop: 10 }}>
        <label>Combustible / Energía</label>
        <select
          name="energia"
          value={nuevo.energia}
          onChange={handleChange}
        >
          <option value="">Seleccionar</option>
          <option>Gas natural</option>
          <option>Gasóleo</option>
          <option>Electricidad</option>
          <option>Biomasa</option>
          <option>Propano</option>
        </select>
      </div>

      {/* Marca modelo */}
      <div style={{ marginTop: 10 }}>
        <label>Marca / Modelo</label>
        <input
          name="marca_modelo"
          value={nuevo.marca_modelo}
          onChange={handleChange}
        />
      </div>

      {/* Potencia */}
      <div style={{ marginTop: 10 }}>
        <label>Potencia (kW)</label>
        <input
          type="number"
          name="potencia"
          value={nuevo.potencia}
          onChange={handleChange}
        />
      </div>

      {/* Año */}
      <div style={{ marginTop: 10 }}>
        <label>Año aproximado</label>
        <input
          type="number"
          name="ano_aprox"
          value={nuevo.ano_aprox}
          onChange={handleChange}
        />
      </div>

      {/* Observaciones */}
      <div style={{ marginTop: 10 }}>
        <label>Observaciones</label>
        <input
          name="observaciones"
          value={nuevo.observaciones}
          onChange={handleChange}
        />
      </div>

      <button onClick={añadirInstalacion} style={{ marginTop: 15 }}>
        + Añadir equipo
      </button>

      {instalaciones.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Equipos añadidos</h4>
          {instalaciones.map((eq, i) => (
            <div key={i}>
              {eq.tipo} — {eq.energia}
              {eq.potencia && ` — ${eq.potencia} kW`}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={onBack}>← Volver</button>
        <button onClick={onNext} style={{ marginLeft: 10 }}>
          Guardar y continuar →
        </button>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////////////////
// STEP 4 — FOTOS
//////////////////////////////////////////////////////////////////

function StepPhotos({ visit, onBack }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [photos, setPhotos] = useState([]);
  const [preview, setPreview] = useState([]);

  // Cuando seleccionas archivos
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    // Generar previsualización
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  // Subir fotos antes de finalizar
  const uploadPhotos = async () => {
    if (photos.length === 0) return true;

    const formData = new FormData();
    photos.forEach((file) => formData.append("photo", file));

    const response = await fetch(
      `${API_URL}/api/visits/${visit.id}/photos`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    return response.ok;
  };

  const finalizarVisita = async () => {
    const ok = await uploadPhotos();
    if (!ok) {
      alert("Error subiendo fotos");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/visits/${visit.id}/finalize`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      alert("Visita enviada correctamente 🚀");
      window.location.reload();
    } else {
      const data = await response.json();
      alert(data.error || "Error finalizando visita");
    }
  };

  return (
    <div>
      <h3>Fotos</h3>

      {/* INPUT MULTIPLE */}
      <input type="file" multiple onChange={handlePhotoChange} />

      {/* PREVISUALIZACIÓN */}
      {preview.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {preview.map((url, i) => (
            <img
              key={i}
              src={url}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "2px solid #ddd",
              }}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={onBack}>← Volver</button>

        <button
          onClick={finalizarVisita}
          style={{ marginLeft: 10, background: "#0f5132", color: "white" }}
        >
          Finalizar visita
        </button>
      </div>
    </div>
  );
}