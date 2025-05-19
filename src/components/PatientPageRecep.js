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
            appointments: [],
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

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
      const response = await fetch(`http://127.0.0.1:8000/paciente/${patientId}`)
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
            phone1: data.telefonos && data.telefonos.length > 0 ? data.telefonos[0] : "",
            phone2: data.telefonos && data.telefonos.length > 1 ? data.telefonos[1] : "",
          },
          address: {
            ...prevPatient.address,
            full: data.direccion || "",
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

  // Show patient history
  const showHistory = () => {
    setShowPatientDetails(false)
    setShowPatientHistory(true)
  }

  // Show patient details
  const showDetails = () => {
    setShowPatientDetails(true)
    setShowPatientHistory(false)
  }

  // Navigate to calendar with new appointment
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

  // Toggle dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false)
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

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

                              <div className="patient-actions">
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
