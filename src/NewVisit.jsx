import { useState } from 'react';

export default function NewVisit({ onCreated, onCancel }) {

  const [photos, setPhotos] = useState([]);

  const handlePhotosChange = (e) => {
    setPhotos(e.target.files);
  };

  const [form, setForm] = useState({
    direccion: '',
    municipio: '',
    provincia: '',
    ano_construccion: '',
    superficie: '',
    motivo_certificado: '',
    dormitorios: '',
    tipo_aislamiento: '',
    mediciones_particiones: '',
    info_equipos: '',
    medida_puerta_ventana: ''
  });

  // 🌱 PLANTAS DINÁMICAS
  const [plantas, setPlantas] = useState([
    { numero: 1, altura: "" }
  ]);
  const [nuevaAltura, setNuevaAltura] = useState("");

  const addPlanta = () => {
    if (!nuevaAltura) return alert("Introduce la altura");

    setPlantas(prev => ([
      ...prev,
      { numero: prev.length + 1, altura: nuevaAltura }
    ]));

    setNuevaAltura("");
  };

  const removePlanta = (index) => {
    const nuevas = plantas.filter((_, i) => i !== index);
    nuevas.forEach((p, i) => p.numero = i + 1);
    setPlantas(nuevas);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    // Generar string de alturas
    const alturasTexto = plantas
      .map(p => `Planta ${p.numero}: ${p.altura}m`)
      .join(" | ");

    const payload = {
      ...form,
      num_plantas: plantas.length,
      alturas_plantas: alturasTexto
    };

    try {
      // 1️⃣ Crear visita primero
      const response = await fetch('https://impulsa-cee-backend.onrender.com/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error creando visita');
        return;
      }

      const visitId = data.id;

      // 2️⃣ Subir fotos si existen
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const formData = new FormData();
          formData.append('photo', photos[i]);

          await fetch(
            `https://impulsa-cee-backend.onrender.com/api/visits/${visitId}/photos`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData
            }
          );
        }
      }

      onCreated();

    } catch (error) {
      console.error(error);
      alert('Error conectando');
    }
  };


  return (
    <div className="container">
      <h2>Nueva Visita Técnica</h2>

      <form onSubmit={handleSubmit}>

        <div className="section">
          <h3>Datos generales</h3>

          <input name="direccion" placeholder="Dirección" onChange={handleChange} required />
          <input name="municipio" placeholder="Municipio" onChange={handleChange} required />
          <input name="provincia" placeholder="Provincia" onChange={handleChange} />
          <input name="ano_construccion" type="number" placeholder="Año construcción" onChange={handleChange} />
          <input name="superficie" type="number" step="0.01" placeholder="Superficie (m²)" onChange={handleChange} />
        </div>

        <div className="section">
          <h3>Información Certificado Energético</h3>

          <textarea name="motivo_certificado" placeholder="Motivo del certificado" onChange={handleChange} />
          <input name="dormitorios" type="number" placeholder="Nº dormitorios" onChange={handleChange} />

          {/* 🌱 NUEVO BLOQUE DE PLANTAS */}
          <h4>Plantas</h4>

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
              type="button"
              onClick={addPlanta}
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

          {/* LISTA DE PLANTAS AÑADIDAS */}
          {plantas.map((p, i) => (
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
                background: "white",
                marginTop: 10
              }}
            >
              <div><strong>Planta {p.numero}</strong> — {p.altura} m</div>
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

          {/* RESTO CAMPOS */}
          <textarea name="tipo_aislamiento" placeholder="Tipo de aislamiento" onChange={handleChange} />
          <textarea name="mediciones_particiones" placeholder="Mediciones particiones" onChange={handleChange} />
          <textarea name="info_equipos" placeholder="Equipos de calefacción, refrigeración y ACS" onChange={handleChange} />
          <textarea name="medida_puerta_ventana" placeholder="Medida puerta o ventana de referencia" onChange={handleChange} />
        </div>

        <div className="section">
          <h3>Fotos de la vivienda</h3>
          <input type="file" multiple onChange={handlePhotosChange} />
        </div>

        <button type="submit" className="primary">
          Crear visita
        </button>

        <button type="button" onClick={onCancel} className="secondary">
          Cancelar
        </button>

      </form>
    </div>
  );
}