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
    num_plantas: '',
    alturas_plantas: '',
    tipo_aislamiento: '',
    mediciones_particiones: '',
    info_equipos: '',
    medida_puerta_ventana: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  try {
    // 1️⃣ Crear visita primero
    const response = await fetch('https://impulsa-cee-backend.onrender.com/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
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
            headers: {
              Authorization: `Bearer ${token}`
            },
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
        <input name="num_plantas" type="number" placeholder="Nº plantas" onChange={handleChange} />
        <textarea name="alturas_plantas" placeholder="Altura de cada planta" onChange={handleChange} />
        <textarea name="tipo_aislamiento" placeholder="Tipo de aislamiento (si lo conocen)" onChange={handleChange} />
        <textarea name="mediciones_particiones" placeholder="Mediciones particiones (garajes, cerramientos...)" onChange={handleChange} />
        <textarea name="info_equipos" placeholder="Equipos de calefacción, refrigeración y ACS" onChange={handleChange} />
        <textarea name="medida_puerta_ventana" placeholder="Medida puerta o ventana de referencia" onChange={handleChange} />
      </div>
      <div className="section">
          <h3>Fotos de la vivienda</h3>

            <input
              type="file"
                 multiple
              onChange={handlePhotosChange}
  />
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
