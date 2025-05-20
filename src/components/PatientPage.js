"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./PatientPage.css"
import { format } from "date-fns"

function PatientPage() {
  const navigate = useNavigate()
  const [expandedPatient, setExpandedPatient] = useState(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [showPatientHistory, setShowPatientHistory] = useState(false)
  const [expandedAppointment, setExpandedAppointment] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [expandedPrescription, setExpandedPrescription] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [patients, setPatients] = useState([])

  // Fetch all patients from the database on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://127.0.0.1:8000/pacientes")
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()

        // Transform the data to match our expected format
        const formattedPatients = data.map((patient) => ({
          id: patient.idPaciente,
          name: patient.nombre,
          age: calculateAge(patient.fecha_nacimiento),
          address: {
            full: patient.direccion || "",
            state: "",
            municipality: "",
            street: "",
            number: "",
          },
          contact: {
            email: patient.correo || "",
            phone1: patient.telefonos && patient.telefonos.length > 0 ? patient.telefonos[0] : "",
            phone2: patient.telefonos && patient.telefonos.length > 1 ? patient.telefonos[1] : "",
          },
          medicalInfo: {
            allergies: patient.alergias ? patient.alergias.join(", ") : "",
            bloodType: patient.tipo_sangre || "",
            birthDate: patient.fecha_nacimiento || "",
          },
          appointments: [],
        }))

        setPatients(formattedPatients)
      } catch (err) {
        console.error("Error fetching patients:", err)
        setError("Error al cargar la lista de pacientes. Por favor, inténtelo de nuevo.")

        // Fallback to sample data if API fails
        setPatients([
          {
            id: 1,
            name: "Andrei Martínez Bahena",
            age: 20,
            address: {
              state: "Morelos",
              municipality: "Amacuzac",
              street: "Juan Alvarez",
              number: "S/N",
            },
            contact: {
              email: "Hungryblock117@Hotmail.com",
              phone1: "734 153 9607",
              phone2: "734 153 1000",
            },
            medicalInfo: {
              allergies: "",
              bloodType: "O+",
            },
            appointments: [],
          },
          {
            id: 2,
            name: "Aranza Castañeda Juarez",
            age: 25,
            address: {
              state: "Morelos",
              municipality: "Cuernavaca",
              street: "Reforma",
              number: "123",
            },
            contact: {
              email: "aranza.castaneda@gmail.com",
              phone1: "777 123 4567",
              phone2: "",
            },
            medicalInfo: {
              allergies: "Penicilina",
              bloodType: "A+",
            },
            appointments: [],
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    console.log("Pacientes cargados:", patients);
  }, [patients]);

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return ""
    const today = new Date()
    const birthDate = new Date(birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Load prescriptions from localStorage
  const loadPrescriptions = () => {
    const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    return storedPrescriptions
  }

  // Toggle patient expansion
  const togglePatient = (patientId) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null)
      setShowPatientDetails(false)
      setShowPatientHistory(false)
      setSelectedPatient(null)
    } else {
      setExpandedPatient(patientId)
      const patient = patients.find((p) => p.id === patientId)
      setSelectedPatient(patient)
      setShowPatientDetails(true)
      setShowPatientHistory(false)

      // Fetch patient data from API
      fetchPatientDataFromAPI(patientId)
    }
  }

  // Fetch patient data from API
  const fetchPatientDataFromAPI = async (patientId) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://127.0.0.1:8000/pacientes/${patientId}/citas`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Update the selected patient with API data
      setSelectedPatient((prevPatient) => {
        if (!prevPatient) return prevPatient

        return {
          ...prevPatient,
          name: data.nombre,
          age: calculateAge(data.fecha_nacimiento),
          contact: {
            email: data.correo || "",
            phone1: data.Telefonos && data.Telefonos.length > 0 ? data.Telefonos[0].telefono : "",
            phone2: data.Telefonos && data.Telefonos.length > 1 ? data.Telefonos[1].telefono : "",
          },
          address: {
            ...prevPatient.address,
            full: data.direccion || "",
          },
          medicalInfo: {
            allergies: data.alergias ? data.alergias.join(", ") : "",
            bloodType: data.tipo_sangre || "",
            birthDate: data.fecha_nacimiento || "",
          },
        }
      })
    } catch (err) {
      setError("Error al cargar los datos del paciente. Por favor, inténtelo de nuevo.")
      console.error("Error fetching patient data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle appointment expansion
  const toggleAppointment = (appointmentId) => {
    if (expandedAppointment === appointmentId) {
      setExpandedAppointment(null)
    } else {
      setExpandedAppointment(appointmentId)
      const appointment = selectedPatient.appointments.find((a) => a.id === appointmentId)
      setSelectedAppointment(appointment)
    }
  }

  // Toggle prescription expansion
  const togglePrescription = (prescriptionId) => {
    if (expandedPrescription === prescriptionId) {
      setExpandedPrescription(null)
    } else {
      setExpandedPrescription(prescriptionId)
    }
  }

  // Update the navigateToNewAppointment function to pass the patient name
  const navigateToNewAppointment = () => {
    // Include the current date for proper disabled time slots functionality
    const currentDate = new Date()
    navigate("/calendar", {
      state: {
        openNewAppointment: true,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name, // Add patient name to state
        selectedDate: format(currentDate, "yyyy-MM-dd"),
        fromPatientPage: true,
      },
    })
  }

  // Add a function to fetch patient appointment history
  const fetchPatientHistory = async (patientId) => {
    setIsLoading(true)
    setError(null)

    try {
      // Endpoint for fetching patient appointments
      const response = await fetch(`http://127.0.0.1:8000/paciente/${patientId}/recetas`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Update the patient's appointments with the fetched data
      setSelectedPatient((prev) => ({
        ...prev,
        appointments: data.map((item) => ({
          id: item.idCita,
          date: new Date(item.fecha_creacion).toLocaleDateString(),
          symptoms: item.tratamiento || "No registrado",
          diagnosis: "Diagnóstico basado en valores vitales:",
          treatment: `Talla: ${item.talla || "N/A"}, Peso: ${item.peso || "N/A"}, FC: ${item.fc || "N/A"}, FR: ${item.fr || "N/A"}, 
                     Saturación O2: ${item.saturacion_oxigeno || "N/A"}, Presión arterial: ${item.presion_arterial || "N/A"}, 
                     Temperatura: ${item.temperatura || "N/A"}`,
        })),
      }))

      //showHistory() // Show the history view after fetching
    } catch (err) {
      console.error("Error fetching patient history:", err)
      setError("Error al cargar el historial del paciente. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to delete patient
  const handleDeletePatient = async () => {
    if (!selectedPatient) return

    // Confirm deletion
    if (!window.confirm(`¿Está seguro que desea eliminar al paciente ${selectedPatient.name}?`)) {
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/paciente/${selectedPatient.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Remove patient from list
      const updatedPatients = patients.filter((p) => p.id !== selectedPatient.id)
      setPatients(updatedPatients)
      setExpandedPatient(null)
      setSelectedPatient(null)

      alert("Paciente eliminado correctamente")
    } catch (err) {
      console.error("Error deleting patient:", err)
      alert("Error al eliminar el paciente. Por favor, inténtelo de nuevo.")
    }
  }

  // Update the history button click handler to fetch data
  // Replace the existing showHistory function with this:
  const showHistory = () => {
    if (selectedPatient) {

      // Only fetch if we haven't already
      if (!isLoading && selectedPatient.appointments.length === 0) {
        fetchPatientHistory(selectedPatient.id)
      }
      setShowPatientDetails(false)
      setShowPatientHistory(true)
    }
  }

  // Show patient details
  const showDetails = () => {
    setShowPatientDetails(true)
    setShowPatientHistory(false)
  }

  // Toggle dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false)
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
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
            <img src="/logo.jpg" alt="Logo" />
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
          <div className="sidebar-item active">
            <FolderIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {isLoading && !selectedPatient ? (
            <div className="loading-container">
              <div className="loading-indicator">Cargando pacientes...</div>
            </div>
          ) : error && patients.length === 0 ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
            </div>
          ) : (
            <div className="patients-container">
              {/* Patient List */}
              {patients.map((patient) => (
                <div key={patient.id} className="patient-section">
                  <div className="patient-header" onClick={() => togglePatient(patient.id)}>
                    <span className="patient-name">{patient.name}</span>
                    <button className="toggle-button">
                      {expandedPatient === patient.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>

                  {/* Patient Details */}
                  {expandedPatient === patient.id && selectedPatient && (
                    <div className="patient-details">
                      {showPatientDetails && (
                        <div className="patient-info">
                          <div className="patient-info-header">
                            
                          </div>

                          {isLoading ? (
                            <div className="loading-indicator">Cargando datos del paciente...</div>
                          ) : error ? (
                            <div className="error-message">{error}</div>
                          ) : (
                            <>
                              <div className="info-field">
                                <label>Edad:</label>
                                <input type="text" value={selectedPatient.age} readOnly />
                              </div>

                              
                              <div className="info-field">
                                <label>Dirección completa:</label>
                                <input
                                  type="text"
                                  value={selectedPatient.address.full || "No registrada"}
                                  readOnly
                                  className="full-width-input"
                                />
                              </div>

                              <h3>Contacto</h3>
                              <div className="info-field">
                                <label>Correo electrónico:</label>
                                <input type="text" value={selectedPatient.contact.email || "No registrado"} readOnly />
                              </div>
                              <div className="info-row">
                                <div className="info-field">
                                  <label>Teléfono 1:</label>
                                  <input
                                    type="text"
                                    value={selectedPatient.contact.phone1 || "No registrado"}
                                    readOnly
                                  />
                                </div>
                                <div className="info-field">
                                  <label>Teléfono 2:</label>
                                  <input
                                    type="text"
                                    value={selectedPatient.contact.phone2 || "No registrado"}
                                    readOnly
                                  />
                                </div>
                              </div>

                              <h3>Información médica</h3>
                              <div className="info-field">
                                <label>Alergias:</label>
                                <textarea value={selectedPatient.medicalInfo.allergies || "Ninguna"} readOnly />
                              </div>
                              <div className="info-field">
                                <label>Tipo de sangre:</label>
                                <input
                                  type="text"
                                  value={selectedPatient.medicalInfo.bloodType || "No registrado"}
                                  readOnly
                                />
                              </div>
                              <div className="info-field">
                                <label>Fecha de nacimiento:</label>
                                <input
                                  type="text"
                                  value={
                                    selectedPatient.medicalInfo.birthDate
                                      ? new Date(selectedPatient.medicalInfo.birthDate).toLocaleDateString()
                                      : "No registrada"
                                  }
                                  readOnly
                                />
                              </div>

                              <div className="patient-actions">
                                <button className="delete-button" onClick={handleDeletePatient}>
                                  Eliminar Paciente
                                </button>
                                <button className="history-button" onClick={showHistory}>
                                  Historial
                                </button>
                                <button className="appointment-button" onClick={navigateToNewAppointment}>
                                  Nueva cita <PlusIcon />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Patient History */}
                      {showPatientHistory && (
                        <div className="patient-history">
                          <div className="history-header">
                            <h2>Historial de {selectedPatient.name}</h2>
                            <button className="back-button" onClick={showDetails}>
                              Volver
                            </button>
                          </div>

                          <div className="appointments-list">
                            {selectedPatient.appointments.length > 0 ? (
                              selectedPatient.appointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-item">
                                  <div className="appointment-header" onClick={() => toggleAppointment(appointment.id)}>
                                    <span className="appointment-date">{appointment.date}</span>
                                    <button className="toggle-button">
                                      {expandedAppointment === appointment.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    </button>
                                  </div>

                                  {expandedAppointment === appointment.id && (
                                    <div className="appointment-details">
                                      <div className="medical-section">
                                        <h3>Síntomas:</h3>
                                        <div className="medical-text">{appointment.symptoms}</div>
                                      </div>

                                      <div className="medical-section">
                                        <h3>Diagnóstico:</h3>
                                        <div className="medical-text">{appointment.diagnosis}</div>
                                      </div>

                                      <div className="medical-section">
                                        <h3>Tratamiento</h3>
                                        <div className="medical-text">{appointment.treatment}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="no-appointments">No hay citas registradas</div>
                            )}

                            {/* Display prescriptions in patient history */}
                            {loadPrescriptions()
                              .filter((prescription) => prescription.patientId === selectedPatient.id)
                              .map((prescription) => (
                                <div key={`prescription-${prescription.id}`} className="appointment-item">
                                  <div
                                    className="appointment-header"
                                    onClick={() => togglePrescription(prescription.id)}
                                  >
                                    <span className="appointment-date">{prescription.date} - Receta</span>
                                    <button className="toggle-button">
                                      {expandedPrescription === prescription.id ? (
                                        <ChevronUpIcon />
                                      ) : (
                                        <ChevronDownIcon />
                                      )}
                                    </button>
                                  </div>

                                  {expandedPrescription === prescription.id && (
                                    <div className="appointment-details">
                                      <div className="medical-section">
                                        <h3>Síntomas:</h3>
                                        <div className="medical-text">{prescription.symptoms}</div>
                                      </div>

                                      <div className="medical-section">
                                        <h3>Diagnóstico:</h3>
                                        <div className="medical-text">{prescription.diagnosis}</div>
                                      </div>

                                      <div className="medical-section">
                                        <h3>Tratamiento</h3>
                                        <div className="medical-text">{prescription.treatment}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PatientPage
