# ⚡ Impulsa CEE Frontend

Progressive Web Application designed to streamline **energy certification workflows** for field technicians.

This app allows technicians to collect, manage and synchronize technical data directly from mobile devices, eliminating manual processes and reducing data loss during on-site visits.

---

## 🚀 Current Status

**Version 0.2 (MVP)**

Focused on building a **robust and fault-tolerant data collection system**, ensuring that technicians can reliably capture all required information during field operations.

---

## 🌟 Key Features

- **Multi-step Wizard Navigation**
  - 6-step form with tab-based navigation
  - State persistence using React (no data loss when navigating back)

- **Automatic Calculations**
  - Real-time calculation of surface areas ($m^2$)
  - Supports both vertical and horizontal partitions

- **Instant Data Management**
  - Fast delete actions (🗑️) directly from UI
  - Immediate sync with backend database

- **Google Drive Integration**
  - OAuth2 authentication (persistent refresh token)
  - Automatic folder creation per visit
  - Image upload for certification records

- **Relational Data Structure**
  - Organized PostgreSQL schema:
    - `visit_envelope`
    - `visit_windows`
    - `visit_installations`

- **Airtable Integration**
  - Fetches scheduled clients directly from company database

---

## 🛠 Tech Stack

- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **Storage:** Google Drive API v3
- **Deployment:** Render
- **Architecture:** Frontend + REST API backend

---

## 🔗 Related Repository

Backend API:  
👉 https://github.com/BARRETO019/impulsa-cee-backend

---

## 🗺️ Roadmap

### ✅ Completed (v0.2)
- PDF generator (Node.js + pdfkit)
- Dynamic technical fields

### 🔄 In Progress / Next

- [ ] Full image upload system (facades & equipment)
- [ ] Offline mode (PWA + Service Workers)
- [ ] Admin dashboard for internal management
- [ ] Bulk PDF export

---

## 📱 Product Vision

This project focuses on:

- improving field data collection
- eliminating duplicated manual processes
- increasing operational efficiency
- building real-world business tools

---

## 👨‍💻 Author

**Emilio Barreto**  
Full Stack Developer
