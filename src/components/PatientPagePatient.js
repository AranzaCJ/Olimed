"use client"
import { jwtDecode } from "jwt-decode"; 
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./PatientPage.css"
import { format } from "date-fns"
import { fetchPatientData, updatePatientData } from "../utils/api"

function PatientPage() {
  const navigate = useNavigate()
  const [expandedAppointment, setExpandedAppointment] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [editablePatient, setEditablePatient] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Sample appointments data
  const appointments = [
    {
      id: 1,
      date: "03/02/2025",
      symptoms:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vehicula auctor eros sed hendrerit. Orci varius natoque penatibus",
      diagnosis:
        "Proin turpis nisl, sagittis a lobortis sit amet, efficitur vel nibh. In et felis fermentum, dictum tortor ut, molestie magna. Proin volutpat augue sollicitudin magna ullamcorper, quis rutrum enim scelerisque.",
      treatment:
        "Proin turpis nisl, sagittis a lobortis sit amet, efficitur vel nibh. In et felis fermentum, dictum tortor ut, molestie magna. Proin volutpat augue sollicitudin magna ullamcorper, quis rutrum enim scelerisque.",
    },
    {
      id: 2,
      date: "15/01/2025",
      symptoms:
        "Dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      diagnosis:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      treatment:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
  ]

  // Fetch patient data on component mount
  useEffect(() => {
    fetchPatientDataFromAPI()
  }, [])

  // Fetch patient data from API
  const fetchPatientDataFromAPI = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you would get the patient ID from authentication
      const patientId = 1 // Mock patient ID
      const data = await fetchPatientData(patientId)

      // Create patient object from API data
      const patient = {
        id: data.idPaciente,
        name: data.nombre,
        age: calculateAge(data.fecha_nacimiento), // Calculate age from birth date
        address: {
          full: data.direccion,
        },
        contact: {
          email: data.correo,
          phone1: "", // Not in the API schema
          phone2: "", // Not in the API schema
        },
        medicalInfo: {
          bloodType: data.tipo_sangre,
          birthDate: data.fecha_nacimiento,
        },
      }

      setEditablePatient(patient)
    } catch (err) {
      setError("Error al cargar los datos del paciente. Por favor, inténtelo de nuevo.")
      console.error("Error fetching patient data:", err)

      // Set default data in case of error
      setEditablePatient({
        id: 1,
        name: "Your Name",
        age: 30,
        address: {
          full: "Your Address",
        },
        contact: {
          email: "your.email@example.com",
          phone1: "",
          phone2: "",
        },
        medicalInfo: {
          bloodType: "",
          birthDate: "",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0

    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Toggle appointment expansion
  const toggleAppointment = (appointmentId) => {
    if (expandedAppointment === appointmentId) {
      setExpandedAppointment(null)
      setSelectedAppointment(null)
    } else {
      const appointment = appointments.find((a) => a.id === appointmentId)
      setExpandedAppointment(appointmentId)
      setSelectedAppointment(appointment)
    }
  }

  // Navigate to calendar with new appointment
  const navigateToNewAppointment = () => {
    // Incluir la fecha actual para asegurar que la funcionalidad de horarios inhabilitados funcione correctamente
    const currentDate = new Date()
    navigate("/calendar", {
      state: {
        openNewAppointment: true,
        selectedDate: format(currentDate, "yyyy-MM-dd"),
        fromPatientPage: true, // Añadir un flag para indicar que viene de la página de pacientes
      },
    })
  }

  // Toggle dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false)
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    const patientId = jwtDecode(token).sub;
    //const navigate = useNavigate();
    const ok = window.confirm("¿Estás seguro de querer eliminar tu cuenta?");
    if (!ok) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/paciente/${patientId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar cuenta");

      // Limpia el estado de sesión y redirige al login
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la cuenta. Intenta de nuevo más tarde.");
    }
  }

  // Handle logout
  const handleLogout = () => {
    navigate("/login")
  }

  // Handle input changes for editable fields
  const handleInputChange = (e, section, field) => {
    if (!editablePatient) return

    setEditablePatient((prev) => {
      if (!prev) return prev

      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: e.target.value,
          },
        }
      } else {
        return {
          ...prev,
          [field]: e.target.value,
        }
      }
    })
  }

  // Handle address change
  const handleAddressChange = (e) => {
    if (!editablePatient) return

    setEditablePatient((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        full: e.target.value,
      },
    }))
  }

  // Save patient information
  const savePatientInfo = async () => {
    if (!editablePatient) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Prepare data for API
      const apiData = {
        idPaciente: editablePatient.id,
        nombre: editablePatient.name,
        correo: editablePatient.contact.email,
        direccion: editablePatient.address.full,
        tipo_sangre: editablePatient.medicalInfo?.bloodType || "",
        fecha_nacimiento: editablePatient.medicalInfo?.birthDate || null,
        // Note: We don't update the password here
      }

      // Send data to API
      await updatePatientData(editablePatient.id, apiData)

      setSuccessMessage("Información guardada correctamente")
      setTimeout(() => setSuccessMessage(null), 3000) // Clear success message after 3 seconds
    } catch (err) {
      setError("Error al guardar los datos. Por favor, inténtelo de nuevo.")
      console.error("Error saving patient data:", err)
    } finally {
      setIsSaving(false)
    }

    
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

  const ChevronDownIcon = () => (
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
      <path d="M6 9l6 6 6-6" />
    </svg>
  )

  const ChevronUpIcon = () => (
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
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )

  const PlusIcon = () => (
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
      <path d="M12 5v14M5 12h14" />
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
              <button className="dropdown-item" onClick={handleDeleteAccount}>Eliminar cuenta</button>
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
          <div className="sidebar-item active">
            <FolderIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-header" onClick={() => toggleAppointment(appointment.id)}>
                  <span className="appointment-date">{appointment.date}</span>
                  <button className="toggle-button">
                    {expandedAppointment === appointment.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </button>
                </div>

                {expandedAppointment === appointment.id && selectedAppointment && (
                  <div className="appointment-details">
                    <div className="medical-section">
                      <h3>Síntomas:</h3>
                      <div className="medical-text">{selectedAppointment.symptoms}</div>
                    </div>

                    <div className="medical-section">
                      <h3>Diagnóstico:</h3>
                      <div className="medical-text">{selectedAppointment.diagnosis}</div>
                    </div>

                    <div className="medical-section">
                      <h3>Tratamiento:</h3>
                      <div className="medical-text">{selectedAppointment.treatment}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Patient Information Section - Add this if it doesn't exist */}
          <div className="patient-info-section">
            <h2>Mi Información</h2>

            {isLoading ? (
              <div className="loading-indicator">Cargando datos del paciente...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              editablePatient && (
                <>
                  <div className="info-field">
                    <label>Nombre:</label>
                    <input
                      type="text"
                      value={editablePatient.name}
                      onChange={(e) => handleInputChange(e, null, "name")}
                    />
                  </div>

                  <div className="info-field">
                    <label>Edad:</label>
                    <input
                      type="number"
                      value={editablePatient.age}
                      onChange={(e) => handleInputChange(e, null, "age")}
                    />
                  </div>

                  <div className="info-field">
                    <label>Fecha de nacimiento:</label>
                    <input
                      type="date"
                      value={editablePatient.medicalInfo?.birthDate || ""}
                      onChange={(e) => {
                        setEditablePatient((prev) => ({
                          ...prev,
                          medicalInfo: {
                            ...prev.medicalInfo,
                            birthDate: e.target.value,
                          },
                          age: calculateAge(e.target.value),
                        }))
                      }}
                    />
                  </div>

                  <h3>Dirección</h3>
                  <div className="info-field">
                    <label>Dirección completa:</label>
                    <textarea
                      value={editablePatient.address.full}
                      onChange={handleAddressChange}
                      className="full-width-input"
                    />
                  </div>

                  <h3>Contacto</h3>
                  <div className="info-field">
                    <label>Correo electrónico:</label>
                    <input
                      type="email"
                      value={editablePatient.contact.email}
                      onChange={(e) => handleInputChange(e, "contact", "email")}
                    />
                  </div>

                  <div className="info-row">
                    <div className="info-field">
                      <label>Teléfono 1:</label>
                      <input
                        type="tel"
                        value={editablePatient.contact.phone1}
                        onChange={(e) => handleInputChange(e, "contact", "phone1")}
                      />
                    </div>
                    <div className="info-field">
                      <label>Teléfono 2:</label>
                      <input
                        type="tel"
                        value={editablePatient.contact.phone2}
                        onChange={(e) => handleInputChange(e, "contact", "phone2")}
                      />
                    </div>
                  </div>

                  {successMessage && <div className="success-message">{successMessage}</div>}

                  <div className="patient-actions">
                    <button className="save-button" onClick={savePatientInfo} disabled={isSaving}>
                      {isSaving ? "Guardando..." : "Guardar Información"}
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PatientPage
