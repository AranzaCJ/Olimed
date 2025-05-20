"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./PrescriptionPage.css"

function PrescriptionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [prescription, setPrescription] = useState({
    patientId: null,
    patientName: "",
    patientAge: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    date: new Date().toISOString().split("T")[0],
    // New fields
    fc: "",
    fr: "",
    temp: "",
    satOxg: "",
    ta: "",
    pes: "",
    fecha: new Date().toISOString().split("T")[0],
    talla: "",
    alergias: "",
  })

  // Load patient data from location state
  useEffect(() => {
    if (location.state?.patient && location.state?.citaId) {
      setPrescription((prev) => ({
        ...prev,
        patientId: location.state.patient.id,
        patientName: location.state.patient.name,
        patientAge: location.state.patient.age,
        idCita: location.state.citaId
      }))
    }
  }, [location.state])

  useEffect(() => {
    const fetchAlergias = async () => {
      if (prescription.patientId) {
        try {
          const response = await fetch(`http://localhost:8000/paciente/${prescription.patientId}/alergias`);
          if (response.ok) {
            const data = await response.json();
            const alergiasTexto = data.map(a => a.nombre).join("\n");
            setPrescription(prev => ({ ...prev, alergias: alergiasTexto }));
          } else {
            console.error("No se pudieron cargar las alergias");
          }
        } catch (error) {
          console.error("Error al cargar las alergias:", error);
        }
      }
    };

    fetchAlergias();
  }, [prescription.patientId]);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("prescription: ", prescription);

      // 1. Enviar la receta
      const response = await fetch("http://localhost:8000/receta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tratamiento: prescription.treatment,
          talla: prescription.talla ? parseInt(prescription.talla) : null,
          peso: prescription.pes ? parseFloat(prescription.pes) : null,
          fc: prescription.fc ? parseInt(prescription.fc) : null,
          fr: prescription.fr ? parseInt(prescription.fr) : null,
          saturacion_oxigeno: prescription.satOxg || null,
          presion_arterial: prescription.ta || null,
          temperatura: prescription.temp ? parseFloat(prescription.temp) : null,
          idCita: prescription.idCita,
          fecha_creacion: prescription.fecha
            ? new Date(prescription.fecha).toISOString()
            : new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al guardar la receta: ${errorData.detail || "Error desconocido"}`);
        return;
      }

      const receta = await response.json();
      console.log("Receta guardada:", receta);

      // 2. Enviar los síntomas a la tabla Cita_Sintoma
      if (prescription.symptoms && prescription.idCita) {
        const sintomas = prescription.symptoms
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const sintoma of sintomas) {
          try {
            const sintomaResponse = await fetch(`http://localhost:8000/citas/${prescription.idCita}/sintomas`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sintoma }),
            });

            if (!sintomaResponse.ok) {
              const errorData = await sintomaResponse.json();
              alert(`Error al guardar el síntoma "${sintoma}": ${errorData.detail || "Error desconocido"}`);
            } else {
              console.log(`Síntoma "${sintoma}" guardado exitosamente`);
            }
          } catch (err) {
            console.error(`Error al enviar síntoma "${sintoma}":`, err);
            alert(`Hubo un error al enviar el síntoma "${sintoma}".`);
          }
        }
      }

      alert("Receta guardada exitosamente");

      // 3. Redirección
      if (location.state?.returnTo === "patients") {
        navigate("/patients");
      } else {
        navigate("/calendar");
      }
    } catch (err) {
      console.error("Error al enviar receta:", err);
      alert("Hubo un error al enviar la receta.");
    }
  };


  // Icons
  const BellIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )

  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )

  const FolderIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )

  const SettingsIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
  console.log("prescription", prescription)

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="logo-container">
          <div className="logo-circle">
          <img src="/logo.jpg" alt="Logo"/>
          </div>
        </div>
        <div className="banner">
          <span className="banner-text">Para tu salud</span>
        </div>
        <div className="profile-container">
          <div className="profile-circle" onClick={toggleDropdown}>
            <UserIcon />
          </div>
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                Cerrar sesión
              </button>
              <div className="dropdown-divider"></div>
            </div>
          )}
        </div>
      </header>

      <div className="divider-line"></div>

      <div className="content-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item" onClick={() => navigate("/home")}>
            <BellIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/calendar")}>
            <CalendarIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/patients")}>
            <FolderIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="prescription-container">
            <h1 className="prescription-title">Datos de la receta</h1>

            <div className="patient-info-card">
              <h2>{prescription.patientName}</h2>
              <p>Edad: {prescription.patientAge}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Vital signs and measurements section */}
              <div className="prescription-section">
                <h3 className="section-title">Signos vitales y medidas</h3>

                <div className="prescription-grid">
                  <div className="prescription-form-group small">
                    <label>FC:</label>
                    <input
                      type="text"
                      value={prescription.fc}
                      onChange={(e) => setPrescription({ ...prescription, fc: e.target.value })}
                      placeholder="Frecuencia Cardíaca"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>FR:</label>
                    <input
                      type="text"
                      value={prescription.fr}
                      onChange={(e) => setPrescription({ ...prescription, fr: e.target.value })}
                      placeholder="Frecuencia Respiratoria"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>TEMP:</label>
                    <input
                      type="text"
                      value={prescription.temp}
                      onChange={(e) => setPrescription({ ...prescription, temp: e.target.value })}
                      placeholder="Temperatura"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>SAT/OXG:</label>
                    <input
                      type="text"
                      value={prescription.satOxg}
                      onChange={(e) => setPrescription({ ...prescription, satOxg: e.target.value })}
                      placeholder="Saturación de Oxígeno"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>T/A:</label>
                    <input
                      type="text"
                      value={prescription.ta}
                      onChange={(e) => setPrescription({ ...prescription, ta: e.target.value })}
                      placeholder="Tensión Arterial"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>PES:</label>
                    <input
                      type="text"
                      value={prescription.pes}
                      onChange={(e) => setPrescription({ ...prescription, pes: e.target.value })}
                      placeholder="Peso"
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>FECHA:</label>
                    <input
                      type="date"
                      value={prescription.fecha}
                      onChange={(e) => setPrescription({ ...prescription, fecha: e.target.value })}
                    />
                  </div>

                  <div className="prescription-form-group small">
                    <label>TALLA:</label>
                    <input
                      type="text"
                      value={prescription.talla}
                      onChange={(e) => setPrescription({ ...prescription, talla: e.target.value })}
                      placeholder="Altura"
                    />
                  </div>
                </div>
              </div>

              <div className="prescription-section">
                <h3 className="section-title">Información médica</h3>

                <div className="prescription-form-group">
                  <label>Tratamiento:</label>
                  <textarea
                    value={prescription.treatment}
                    onChange={(e) => setPrescription({ ...prescription, treatment: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="prescription-form-group">
                  <label>Síntomas:</label>
                  <textarea
                    value={prescription.symptoms}
                    onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
                    placeholder="Un síntoma por línea"
                    required
                  ></textarea>
                </div>

                <div className="prescription-form-group">
                  <label>Alergias:</label>
                  <textarea
                    value={prescription.alergias}
                    readOnly
                    style={{ userSelect: "none" }}
                    placeholder="Sin Alergias"
                  ></textarea>
                </div>
              </div>

              <div className="prescription-actions">
                <button type="submit" className="generate-prescription-btn">
                  Generar receta
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PrescriptionPage
