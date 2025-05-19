"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addDays,
} from "date-fns"
import { es } from "date-fns/locale"
import "./CalendarPage.css"

function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showBlockDays, setShowBlockDays] = useState(false)
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [showDropdowns, setShowDropdowns] = useState({
    patient: false,
    day: false,
    time: false,
    startDay: false,
    endDay: false,
    startTime: false,
    endTime: false,
  })

  // Sample data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "María López",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00",
    },
    {
      id: 2,
      patient: "Andrei Martinez Bahena",
      date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      time: "1:00 pm",
    },
  ])

  const [blockedDates, setBlockedDates] = useState([
    {
      id: 1,
      startDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 4), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "18:00",
    },
  ])

  // Sample patient options
  const patientOptions = ["Andrei Martinez Bahena", "María López", "Juan Pérez", "Ana García", "Carlos Rodríguez"]

  // Sample time options
  const timeOptions = [
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:00 pm",
    "5:00 pm",
  ]

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    time: "1:00 pm",
  })

  // Block days form state
  const [blockDays, setBlockDays] = useState({
    startDate: format(selectedDate, "yyyy-MM-dd"),
    endDate: format(selectedDate, "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "18:00",
  })

  // Refs for dropdown menus
  const dropdownRefs = {
    patient: useRef(null),
    day: useRef(null),
    time: useRef(null),
    startDay: useRef(null),
    endDay: useRef(null),
    startTime: useRef(null),
    endTime: useRef(null),
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      Object.keys(dropdownRefs).forEach((key) => {
        if (dropdownRefs[key].current && !dropdownRefs[key].current.contains(event.target)) {
          setShowDropdowns((prev) => ({ ...prev, [key]: false }))
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    setShowDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Check if a date has an appointment
  const hasAppointment = (date) => {
    return appointments.some((appointment) => {
      try {
        return isSameDay(parseISO(appointment.date), date)
      } catch (error) {
        return false
      }
    })
  }

  // Check if a date is blocked
  const isBlocked = (date) => {
    return blockedDates.some((block) => {
      try {
        const start = parseISO(block.startDate)
        const end = parseISO(block.endDate)
        return date >= start && date <= end
      } catch (error) {
        return false
      }
    })
  }

  // Get block ID for a date
  const getBlockIdForDate = (date) => {
    const block = blockedDates.find((block) => {
      try {
        const start = parseISO(block.startDate)
        const end = parseISO(block.endDate)
        return date >= start && date <= end
      } catch (error) {
        return false
      }
    })
    return block ? block.id : null
  }

  // Get appointments for selected date
  const getAppointmentsForDate = (date) => {
    return appointments.filter((appointment) => {
      try {
        return isSameDay(parseISO(appointment.date), date)
      } catch (error) {
        return false
      }
    })
  }

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date)

    // If the date is blocked, show unblock confirmation
    if (isBlocked(date)) {
      const blockId = getBlockIdForDate(date)
      setSelectedBlockId(blockId)
      setShowUnblockConfirm(true)
    }
  }

  // Handle new appointment form submission
  const handleNewAppointmentSubmit = (e) => {
    e.preventDefault()
    const newAppointmentObj = {
      id: appointments.length + 1,
      ...newAppointment,
    }
    setAppointments([...appointments, newAppointmentObj])
    setShowNewAppointment(false)
    // Reset form
    setNewAppointment({
      patient: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      time: "1:00 pm",
    })
  }

  // Handle block days form submission
  const handleBlockDaysSubmit = (e) => {
    e.preventDefault()
    const newBlockObj = {
      id: blockedDates.length + 1,
      ...blockDays,
    }
    setBlockedDates([...blockedDates, newBlockObj])
    setShowBlockDays(false)
    // Reset form
    setBlockDays({
      startDate: format(selectedDate, "yyyy-MM-dd"),
      endDate: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "18:00",
    })
  }

  // Handle unblock confirmation
  const handleUnblockConfirm = () => {
    setBlockedDates(blockedDates.filter((block) => block.id !== selectedBlockId))
    setShowUnblockConfirm(false)
    setSelectedBlockId(null)
  }

  // Handle delete appointment
  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter((appointment) => appointment.id !== id))
  }

  // Toggle dropdown visibility
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
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

  const ChevronLeftIcon = () => (
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )

  const ChevronRightIcon = () => (
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
      <path d="M9 18l6-6-6-6" />
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

  const SearchIcon = () => (
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )

  const TrashIcon = () => (
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Days of the week
  const daysOfWeek = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]

  // Generate mini calendar days for date pickers
  const generateMiniCalendarDays = (date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return eachDayOfInterval({ start, end })
  }

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
          <div className="profile-circle" onClick={toggleProfileDropdown}>
            <UserIcon />
          </div>
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                Cerrar sesión
              </button>
              <div className="dropdown-divider"></div>
            </div>
          )}
        </div>
      </header>

      <div className="content-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item" onClick={() => navigate("/home")}>
            <BellIcon />
          </div>
          <div className="sidebar-item active">
            <CalendarIcon />
          </div>
          <div className="sidebar-item">
            <UserIcon />
          </div>
          <div className="sidebar-item">
            <SettingsIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content calendar-content">
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-year">{format(currentDate, "yyyy")}</div>
              <div className="calendar-nav">
                <button className="calendar-nav-btn" onClick={prevMonth}>
                  <ChevronLeftIcon />
                </button>
                <div className="calendar-month">
                  {format(currentDate, "MMMM", { locale: es }).charAt(0).toUpperCase() +
                    format(currentDate, "MMMM", { locale: es }).slice(1)}
                </div>
                <button className="calendar-nav-btn" onClick={nextMonth}>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {/* Days of the week */}
              {daysOfWeek.map((day) => (
                <div key={day} className="calendar-day-name">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {monthDays.map((day) => {
                const dayNumber = day.getDate()
                const isToday = isSameDay(day, new Date())
                const isSelected = isSameDay(day, selectedDate)
                const hasAppt = hasAppointment(day)
                const isDayBlocked = isBlocked(day)

                return (
                  <div
                    key={day.toString()}
                    className={`calendar-day ${isToday ? "today" : ""} ${
                      isSelected ? "selected" : ""
                    } ${hasAppt ? "has-appointment" : ""} ${isDayBlocked ? "blocked" : ""}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {dayNumber}
                  </div>
                )
              })}
            </div>

            <div className="calendar-actions">
              <button
                className="calendar-action-btn block-btn"
                onClick={() => {
                  setShowBlockDays(true)
                  setShowNewAppointment(false)
                }}
              >
                Bloquear días
              </button>
              <button
                className="calendar-action-btn new-btn"
                onClick={() => {
                  setShowNewAppointment(true)
                  setShowBlockDays(false)
                }}
              >
                Nueva cita <PlusIcon />
              </button>
            </div>
          </div>

          <div className="appointments-panel">
            <div className="appointments-header">
              {format(selectedDate, "dd / MMMM / yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
            </div>
            <div className="appointments-list">
              {getAppointmentsForDate(selectedDate).length > 0 ? (
                getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-card-header">
                      <div className="appointment-date">
                        {format(parseISO(appointment.date), "dd / MMMM / yyyy", { locale: es }).replace(/^\w/, (c) =>
                          c.toUpperCase(),
                        )}
                      </div>
                      <button
                        className="appointment-delete-btn"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        aria-label="Eliminar cita"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="appointment-card-body">
                      <div className="appointment-patient">{appointment.patient}</div>
                      <div className="appointment-time">Hora: {appointment.time}</div>
                    </div>
                    <div className="appointment-card-footer">
                      <button className="generate-recipe-btn">Generar receta</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-appointments">No hay citas Programadas</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">NUEVA CITA</h2>
            <form onSubmit={handleNewAppointmentSubmit}>
              <div className="form-group">
                <label>Paciente</label>
                <div className="input-with-icon" ref={dropdownRefs.patient}>
                  <input
                    type="text"
                    value={newAppointment.patient}
                    onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                    placeholder="Andrei Martinez Bahena"
                    required
                    onClick={() => toggleDropdown("patient")}
                  />
                  <div className="input-icons">
                    <SearchIcon />
                    <div className="dropdown-icon" onClick={() => toggleDropdown("patient")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.patient && (
                    <div className="dropdown-menu">
                      {patientOptions.map((patient, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            setNewAppointment({ ...newAppointment, patient })
                            toggleDropdown("patient")
                          }}
                        >
                          {patient}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Día</label>
                <div className="input-with-icon" ref={dropdownRefs.day}>
                  <input
                    type="text"
                    value={format(parseISO(newAppointment.date), "dd / MM / yyyy")}
                    readOnly
                    placeholder="DD / MM / AAAA"
                    onClick={() => toggleDropdown("day")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("day")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.day && (
                    <div className="dropdown-menu calendar-picker">
                      <div className="calendar-picker-header">
                        <button className="calendar-picker-nav-btn" onClick={prevMonth}>
                          <ChevronLeftIcon />
                        </button>
                        <div className="calendar-picker-month">
                          {format(currentDate, "MMMM yyyy", { locale: es }).charAt(0).toUpperCase() +
                            format(currentDate, "MMMM yyyy", { locale: es }).slice(1)}
                        </div>
                        <button className="calendar-picker-nav-btn" onClick={nextMonth}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="calendar-picker-grid">
                        {/* Days of the week */}
                        {daysOfWeek.map((day) => (
                          <div key={day} className="calendar-picker-day-name">
                            {day}
                          </div>
                        ))}

                        {/* Calendar days */}
                        {monthDays.map((day) => {
                          const dayNumber = day.getDate()
                          const isToday = isSameDay(day, new Date())
                          const isSelected = isSameDay(day, parseISO(newAppointment.date))

                          return (
                            <div
                              key={day.toString()}
                              className={`calendar-picker-day ${isToday ? "today" : ""} ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => {
                                setNewAppointment({
                                  ...newAppointment,
                                  date: format(day, "yyyy-MM-dd"),
                                })
                                toggleDropdown("day")
                              }}
                            >
                              {dayNumber}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Hora</label>
                <div className="input-with-icon" ref={dropdownRefs.time}>
                  <input
                    type="text"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    placeholder="1:00 pm"
                    required
                    onClick={() => toggleDropdown("time")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("time")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.time && (
                    <div className="dropdown-menu">
                      {timeOptions.map((time, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            setNewAppointment({ ...newAppointment, time })
                            toggleDropdown("time")
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowNewAppointment(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Generar cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Days Modal */}
      {showBlockDays && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Bloquear días</h2>
            <form onSubmit={handleBlockDaysSubmit}>
              <div className="form-group">
                <label>Día inicial</label>
                <div className="input-with-icon" ref={dropdownRefs.startDay}>
                  <input
                    type="text"
                    value={format(parseISO(blockDays.startDate), "dd / MM / yyyy")}
                    readOnly
                    placeholder="DD / MM / AAAA"
                    onClick={() => toggleDropdown("startDay")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("startDay")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.startDay && (
                    <div className="dropdown-menu calendar-picker">
                      <div className="calendar-picker-header">
                        <button className="calendar-picker-nav-btn" onClick={prevMonth}>
                          <ChevronLeftIcon />
                        </button>
                        <div className="calendar-picker-month">
                          {format(currentDate, "MMMM yyyy", { locale: es }).charAt(0).toUpperCase() +
                            format(currentDate, "MMMM yyyy", { locale: es }).slice(1)}
                        </div>
                        <button className="calendar-picker-nav-btn" onClick={nextMonth}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="calendar-picker-grid">
                        {/* Days of the week */}
                        {daysOfWeek.map((day) => (
                          <div key={day} className="calendar-picker-day-name">
                            {day}
                          </div>
                        ))}

                        {/* Calendar days */}
                        {monthDays.map((day) => {
                          const dayNumber = day.getDate()
                          const isToday = isSameDay(day, new Date())
                          const isSelected = isSameDay(day, parseISO(blockDays.startDate))

                          return (
                            <div
                              key={day.toString()}
                              className={`calendar-picker-day ${isToday ? "today" : ""} ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => {
                                setBlockDays({
                                  ...blockDays,
                                  startDate: format(day, "yyyy-MM-dd"),
                                })
                                toggleDropdown("startDay")
                              }}
                            >
                              {dayNumber}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Día final</label>
                <div className="input-with-icon" ref={dropdownRefs.endDay}>
                  <input
                    type="text"
                    value={format(parseISO(blockDays.endDate), "dd / MM / yyyy")}
                    readOnly
                    placeholder="DD / MM / AAAA"
                    onClick={() => toggleDropdown("endDay")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("endDay")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.endDay && (
                    <div className="dropdown-menu calendar-picker">
                      <div className="calendar-picker-header">
                        <button className="calendar-picker-nav-btn" onClick={prevMonth}>
                          <ChevronLeftIcon />
                        </button>
                        <div className="calendar-picker-month">
                          {format(currentDate, "MMMM yyyy", { locale: es }).charAt(0).toUpperCase() +
                            format(currentDate, "MMMM yyyy", { locale: es }).slice(1)}
                        </div>
                        <button className="calendar-picker-nav-btn" onClick={nextMonth}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="calendar-picker-grid">
                        {/* Days of the week */}
                        {daysOfWeek.map((day) => (
                          <div key={day} className="calendar-picker-day-name">
                            {day}
                          </div>
                        ))}

                        {/* Calendar days */}
                        {monthDays.map((day) => {
                          const dayNumber = day.getDate()
                          const isToday = isSameDay(day, new Date())
                          const isSelected = isSameDay(day, parseISO(blockDays.endDate))

                          return (
                            <div
                              key={day.toString()}
                              className={`calendar-picker-day ${isToday ? "today" : ""} ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => {
                                setBlockDays({
                                  ...blockDays,
                                  endDate: format(day, "yyyy-MM-dd"),
                                })
                                toggleDropdown("endDay")
                              }}
                            >
                              {dayNumber}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Hora inicial</label>
                <div className="input-with-icon" ref={dropdownRefs.startTime}>
                  <input
                    type="text"
                    value={blockDays.startTime}
                    onChange={(e) => setBlockDays({ ...blockDays, startTime: e.target.value })}
                    placeholder="1:00 pm"
                    required
                    onClick={() => toggleDropdown("startTime")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("startTime")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.startTime && (
                    <div className="dropdown-menu">
                      {timeOptions.map((time, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            setBlockDays({ ...blockDays, startTime: time })
                            toggleDropdown("startTime")
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Hora final</label>
                <div className="input-with-icon" ref={dropdownRefs.endTime}>
                  <input
                    type="text"
                    value={blockDays.endTime}
                    onChange={(e) => setBlockDays({ ...blockDays, endTime: e.target.value })}
                    placeholder="1:00 pm"
                    required
                    onClick={() => toggleDropdown("endTime")}
                  />
                  <div className="input-icons">
                    <div className="dropdown-icon" onClick={() => toggleDropdown("endTime")}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showDropdowns.endTime && (
                    <div className="dropdown-menu">
                      {timeOptions.map((time, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            setBlockDays({ ...blockDays, endTime: time })
                            toggleDropdown("endTime")
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowBlockDays(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Bloquear días
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      {showUnblockConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">¿Desbloquear día?</h2>
            <p>¿Está seguro de que desea desbloquear este día?</p>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowUnblockConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className="submit-btn" onClick={handleUnblockConfirm}>
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage
