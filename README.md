# ⚡ Impulsa Energía - App de Certificaciones Técnicas (v0.2)

Aplicación web progresiva diseñada para facilitar la recogida de datos en campo por parte de los técnicos certificadores. Permite registrar datos de clientes, envolvente térmica, huecos e instalaciones directamente desde el móvil, sincronizando todo en la nube.

## 🚀 Estado Actual: Versión 0.2 (MVP)
Esta versión se centra en la recolección de datos robusta y a prueba de fallos, asegurando que los técnicos no pierdan información durante su visita.

### 🌟 Características Principales
* **Navegación Fluida (Wizard):** Formulario de 6 pasos con sistema de pestañas. Los datos no se pierden al retroceder gracias a la persistencia visual en React (`display: none`).
* **Cálculo Automático:** La envolvente calcula automáticamente los $m^2$ basándose en las medidas introducidas (Largo, Ancho, Alto), distinguiendo entre particiones verticales y horizontales.
* **Gestión de Errores (UI):** Inclusión de botones de borrado rápido (🗑️) en las tablas de Envolvente, Ventanas e Instalaciones, que eliminan el dato instantáneamente de la pantalla y de la base de datos.
* **Integración con Google Drive:** Conexión mediante OAuth2 (Refresh Token permanente) para utilizar una cuenta de 2TB. El backend crea automáticamente una carpeta para cada visita y sube las fotografías de las ventanas allí.
* **Base de Datos Relacional:** Almacenamiento estructurado en PostgreSQL (Neon), separando los datos por tablas (`visit_envelope`, `visit_windows`, `visit_installations`, etc.).
* **Integración con Airtable:** Lectura de clientes planeados directamente desde la base de datos de gestión de la empresa.

### 🛠️ Stack Tecnológico
* **Frontend:** React.js, TailwindCSS.
* **Backend:** Node.js, Express.
* **Base de Datos:** PostgreSQL alojada en Neon.tech.
* **Almacenamiento de Archivos:** Google Drive API v3.
* **Despliegue:** Render.

---

🗺️ Roadmap: Próximos pasos (v0.3.0)
Tras completar con éxito la v0.2.0 (Generación de PDF y campos técnicos dinámicos), los siguientes objetivos son:

[x] Generador de PDF: Implementado endpoint en Node.js que procesa datos de Neon y genera informes técnicos profesionales con pdfkit.

[ ] Subida total de imágenes: Refinar la réplica en Drive para las fotos de Fachadas y Equipos, optimizando el anexo fotográfico del PDF.

[ ] Modo Offline (PWA): Implementar LocalStorage y Service Workers para asegurar el funcionamiento en sótanos o salas de calderas sin cobertura.

[ ] Dashboard de Administración: Vista para que la empresa pueda gestionar todas las visitas realizadas y descargar los PDFs de forma masiva.
---

*Desarrollado para agilizar el trabajo de campo y eliminar la doble introducción de datos.*
