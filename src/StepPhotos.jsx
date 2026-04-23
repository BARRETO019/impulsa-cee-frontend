import { useState } from "react";

function StepPhotos({ visit, onBack }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [inputs, setInputs] = useState([{ file: null }]);
  const [loading, setLoading] = useState(false);

  const addInput = () => {
    setInputs([...inputs, { file: null }]);
  };

  const handleChange = (index, e) => {
    const newInputs = [...inputs];
    newInputs[index].file = e.target.files[0];
    setInputs(newInputs);
  };

  // ✅ NUEVO: subir fotos UNA A UNA
  const uploadPhotos = async () => {
    for (const item of inputs) {
      if (!item.file) continue;

      const fd = new FormData();
      fd.append("photo", item.file);

      try {
        const r = await fetch(`${API_URL}/api/visits/${visit.id}/photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        });

        if (!r.ok) {
          console.error("Error en subida:", await r.text());
          return false;
        }

      } catch (error) {
        console.error("Error en fetch:", error);
        return false;
      }
    }

    return true;
  };

  const finalizarVisita = async () => {
    setLoading(true);

    const ok = await uploadPhotos();

    if (!ok) {
      alert("Error subiendo fotos. Revisa el tamaño de los archivos.");
      setLoading(false);
      return;
    }

    try {
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
        alert("Error finalizando la visita");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>Fotos de la Visita</h3>

      {inputs.map((item, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: 15,
            borderBottom: "1px solid #eee",
            paddingBottom: 10,
          }}
        >
          <input type="file" onChange={(e) => handleChange(idx, e)} />
        </div>
      ))}

      <button
        style={{
          background: "#6c757d",
          color: "white",
          marginBottom: 20,
          padding: "5px 10px",
        }}
        onClick={addInput}
        disabled={loading}
      >
        + Añadir otra foto
      </button>

      <div style={{ marginTop: 30 }}>
        <button onClick={onBack} disabled={loading}>
          ← Volver
        </button>

        <button
          onClick={finalizarVisita}
          disabled={loading}
          style={{
            marginLeft: 10,
            background: "#0f5132",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {loading ? "Subiendo..." : "Finalizar y Generar Informe"}
        </button>
      </div>
    </div>
  );
}

export default StepPhotos;
