import { useState } from "react";

function StepPhotos({ visit, onBack }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [inputs, setInputs] = useState([{ file: null }]);

  const addInput = () => {
    setInputs([...inputs, { file: null }]);
  };

  const handleChange = (index, e) => {
    const newInputs = [...inputs];
    newInputs[index].file = e.target.files[0];
    setInputs(newInputs);
  };

  // MODIFICADO: Ahora envía todas las fotos juntas
  const uploadPhotos = async () => {
    const fd = new FormData();
    let count = 0;

    for (const item of inputs) {
      if (item.file) {
        fd.append("photo", item.file); // El nombre 'photo' coincide con el backend
        count++;
      }
    }

    if (count === 0) return true; // Si no hay fotos, permitimos finalizar

    try {
      const r = await fetch(`${API_URL}/api/visits/${visit.id}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      return r.ok;
    } catch (error) {
      console.error("Error en la subida:", error);
      return false;
    }
  };

  const finalizarVisita = async () => {
    const ok = await uploadPhotos();
    if (!ok) {
      alert("Error subiendo fotos. Revisa el tamaño de los archivos.");
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
    }
  };

  return (
    <div>
      <h3>Fotos de la Visita</h3>
      {inputs.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
          <input type="file" onChange={(e) => handleChange(idx, e)} />
        </div>
      ))}

      <button
        style={{ background: "#6c757d", color: "white", marginBottom: 20, padding: '5px 10px' }}
        onClick={addInput}
      >
        + Añadir otra foto
      </button>

      <div style={{ marginTop: 30 }}>
        <button onClick={onBack}>← Volver</button>
        <button
          onClick={finalizarVisita}
          style={{ marginLeft: 10, background: "#0f5132", color: "white", fontWeight: 'bold' }}
        >
          Finalizar y Generar Informe
        </button>
      </div>
    </div>
  );
}

export default StepPhotos;