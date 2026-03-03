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

  const uploadPhotos = async () => {
    for (const item of inputs) {
      if (!item.file) continue;

      const fd = new FormData();
      fd.append("photo", item.file);

      const r = await fetch(`${API_URL}/api/visits/${visit.id}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!r.ok) return false;
    }

    return true;
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
    }
  };

  return (
    <div>
      <h3>Fotos</h3>

      {inputs.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 20 }}>
          <input
            type="file"
            onChange={(e) => handleChange(idx, e)}
          />
        </div>
      ))}

      <button
        style={{ background: "#0f5132", color: "white", marginBottom: 20 }}
        onClick={addInput}
      >
        + Añadir foto
      </button>

      <div>
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

export default StepPhotos;