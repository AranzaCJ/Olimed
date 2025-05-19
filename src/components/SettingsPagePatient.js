"use client"
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState, useMemo } from "react"
import { parseISO, differenceInYears } from "date-fns"
import { useNavigate } from "react-router-dom"
import "./SettingsPage.css"

function SettingsPage() {
  const token = localStorage.getItem("token")
  let patientId = jwtDecode(token).sub
  const navigate = useNavigate()
  //const [activeOption, setActiveOption] = useState("password")
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [activeOption, setActiveOption] = useState("datosPersonales")
/*
  const [personalData, setPersonalData] = useState({
    nombre: "------------",
    edad: "..."
  })

  const [contactData, setContactData] = useState({
    direccion: "....",
    correo: "-----",
    telefono1: "222",
    telefono2: "2222"
  })

  const [medicalData, setMedicalData] = useState({
    alergias: "22222",
    tipoSangre: "2222"
  })*/

  const [patient, setPatient] = useState(null)
  

  // Efecto para traer el paciente una vez al montar o al cambiar patientId
  useEffect(() => {
    if (!patientId) return

    const fetchPaciente = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/paciente/${patientId}`)
        if (!res.ok) throw new Error("Error al cargar paciente")
        const data = await res.json()
        setPatient(data)
      } catch (err) {
        console.error("fetchPaciente:", err)
        setPatient(null)
      }
    }

    fetchPaciente()
  }, [patientId])

  // Derivados de patient
  const personalData = useMemo(() => {
    if (!patient) return { nombre: "–", edad: "" }
    const edad = patient.fecha_nacimiento
      ? differenceInYears(new Date(), parseISO(patient.fecha_nacimiento))
      : ""
    return { nombre: patient.nombre, edad }
  }, [patient])
 

  const contactData = useMemo(() => {
    if (!patient) return { direccion: "", correo: "", telefono1: "", telefono2: "" }
    const t = patient.Telefonos || []
    return {
      direccion: patient.direccion || "",
      correo: patient.correo || "",
      telefono1: t[0]?.telefono || "",
      telefono2: t[1]?.telefono || "",
    }
  }, [patient])

  const medicalData = useMemo(() => {
    if (!patient) return { alergias: "", tipoSangre: "" }
    return {
      alergias: (patient.Alergias || []).map(a => a.nombre).join(", "),
      tipoSangre: patient.tipo_sangre || "",
    }
  }, [patient])

  const handleSubmit = e => {
  e.preventDefault();

    // Construye un mensaje con los datos
    const mensaje = `
    Datos Personales:
    Nombre: ${personalData.nombre}
    Edad: ${personalData.edad}

    Información de Contacto:
      Dirección: ${contactData.direccion}
      Correo: ${contactData.correo}
      Teléfono 1: ${contactData.telefono1}
      Teléfono 2: ${contactData.telefono2}

    Información Médica:
      Alergias: ${medicalData.alergias}
      Tipo de Sangre: ${medicalData.tipoSangre}
      `;

      // Muestra la alerta
      alert(mensaje);

    // Aquí podrías seguir enviando al servidor...
  };
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }
  
  const handleGuardar = async () => {
    try {
      // 1) PUT datos generales
      const bodyPaciente = {
        nombre: personalData.nombre,
        fecha_nacimiento: patient.fecha_nacimiento,
        tipo_sangre: medicalData.tipoSangre,
        direccion: contactData.direccion,
      }
      let res = await fetch(
        `http://127.0.0.1:8000/paciente/${patientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPaciente),
        }
      )
      if (!res.ok) throw new Error("Error al actualizar paciente")

      // 2) PUT teléfono 1
      const tel1 = contactData.telefonos[0]
      if (tel1.idTelefono) {
        res = await fetch(
          `http://127.0.0.1:8000/paciente/${patientId}/telefono/${tel1.idTelefono}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telefono: tel1.telefono, tipo: tel1.tipo }),
          }
        )
        if (!res.ok) throw new Error("Error al actualizar teléfono 1")
      }

      // 3) PUT teléfono 2
      const tel2 = contactData.telefonos[1]
      if (tel2.idTelefono) {
        res = await fetch(
          `http://127.0.0.1:8000/paciente/${patientId}/telefono/${tel2.idTelefono}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telefono: tel2.telefono, tipo: tel2.tipo }),
          }
        )
        if (!res.ok) throw new Error("Error al actualizar teléfono 2")
      }

      alert("Datos guardados correctamente")
    } catch (err) {
      console.error(err)
      alert("Hubo un error al guardar: " + err.message)
    }
  }
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/change-password/paciente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      console.log("Status:", response.status);
      const payload = await response.json().catch(() => null);
      console.log("Payload:", payload);

      if (response.ok) {
        alert("Contraseña cambiada exitosamente");
      } else {
        // Si el servidor devuelve { detail: "..." }
        alert(payload?.detail || "La contraseña actual ingresada es incorrecta");
      }
    } catch (error) {
      console.error("Fetch falla:", error);
      alert("Error al procesar la solicitud. Revisa la consola.");
    } finally {
      // Limpia campos y regresa a sección de password
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveOption("password");
      navigate("/settings");
    }
  };

  // Handle logout
  const handleLogout = () => {
    navigate("/login")
  }

  
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

  const LockIcon = () => (
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )

  const ReceptionistIcon = () => (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )

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
              <button className="dropdown-item">Eliminar cuenta</button>
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
          <div className="sidebar-item active">
            <SettingsIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content settings-content">
          <div className="settings-container">
            <div className="settings-sidebar">
              <div
                className={`settings-option ${activeOption === "datosPersonales" ? "active" : ""}`}
                onClick={() => setActiveOption("datosPersonales")}
              >
                <div className="option-icon">
                  <UserIcon />
                </div>
                <span>Datos Personales</span>
              </div>
              <div
                className={`settings-option ${activeOption === "infoContacto" ? "active" : ""}`}
                onClick={() => setActiveOption("infoContacto")}
              >
                <div className="option-icon">
                  <ReceptionistIcon />
                </div>
                <span>Informacion de contacto</span>
              </div>
              <div
                className={`settings-option ${activeOption === "infoMedica" ? "active" : ""}`}
                onClick={() => setActiveOption("infoMedica")}
              >
                <div className="option-icon">
                  <ReceptionistIcon />
                </div>
                <span>Informacion medica</span>
              </div>
              <div
                className={`settings-option ${activeOption === "password" ? "active" : ""}`}
                onClick={() => setActiveOption("password")}
              >
                <div className="option-icon">
                  <LockIcon />
                </div>
                <span>Cambio de contraseña</span>
              </div>
            </div>

            <div className="settings-panel">
              {activeOption === "datosPersonales" && (
                <div className="settings-form">
                  <form onSubmit={handleSubmit}>
                    {/* ... tus campos ... */}
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        Guardar Todos
                      </button>
                    </div>
                  </form>
                  <h2>Datos personales</h2>
                  <div className="form-group">
                    <label>Nombre:</label>
                    <input type="text" value={personalData.nombre} />
                  </div>
                  <div className="form-group">
                    <label>Edad:</label>
                    <input type="text" value={personalData.edad} />
                  </div>
                </div>
              )}

              {activeOption === "infoContacto" && (
                <div className="settings-form">
                  <h2>Información de Contacto</h2>
                  <div className="form-group">
                    <label>Dirección:</label>
                    <input type="text" value={contactData.direccion}/>
                  </div>
                  <div className="info-field">
                    <label>Correo electrónico:</label>
                    <input type="text" value={contactData.correo} />
                  </div>
                  <div className="info-row">
                    <div className="info-field">
                      <label>Teléfono 1:</label>
                      <input type="text" value={contactData.telefono1} />
                    </div>
                    <div className="info-field">
                      <label>Teléfono 2:</label>
                      <input type="text" value={contactData.telefono2} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" onClick={handleGuardar}>Guardar</button>
                  </div>
                </div>
              )}

              {activeOption === "infoMedica" && (
                <div className="settings-form">
                  <h2>Información médica</h2>
                  <div className="form-group">
                    <label>Administra tus datos medicos. Estos datos son privados y no se mostraran a otros usuarios. Consulta la politica de privacidad</label>
                  </div>
                  <div className="info-field">
                    <label>Alergias:</label>
                    <textarea value={medicalData.alergias}  />
                  </div>
                  <div className="info-field">
                    <label>Tipo de sangre:</label>
                    <input type="text" value={medicalData.tipoSangre} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Guardar</button>
                  </div>
                </div>
              )}

              {activeOption === "password" && (
                <div className="settings-form">
                  <h2>Cambiar contraseña</h2>
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label>Contraseña actual:</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Nueva contraseña:</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirmar contraseña:</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Guardar</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage