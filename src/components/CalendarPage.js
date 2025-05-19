"use client"
import { useEffect } from "react"
import { useState } from "react"
//import { useState, useEffect } from "react"
import "./CalendarPage.css"
import { useNavigate, useLocation } from "react-router-dom"
import { format, addMonths, subMonths, isSameDay, parseISO, addDays } from "date-fns"

//const [patientList, setPatientList] = useState([]);

function CalendarPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [patientList, setPatientList] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showBlockDays, setShowBlockDays] = useState(false)
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
  ])

  //carga de dias bloqueados desde el backend
  useEffect(() => {
    const cargarDiasBloqueados = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/diasBloqueados");

        if (!response.ok) {
          const errorData = await response.json()
          alert("Ocurrio un error: " + errorData.detail)
        } else {
          const data = await response.json()
          const count = 0
          const diasBloqueados = data.map((d, i) => ({
            id: i + 1,
            startDate: d,
            endDate: d,
          }))
          setBlockedDates(diasBloqueados)
        }
      } catch (error) {
        alert("Ocurrio un error al cargar los dias bloqueados" + error)
      }
    }
    cargarDiasBloqueados()
  }, [showBlockDays])

  // Check if we should open new appointment modal from navigation
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/pacientes")
        if (!response.ok) throw new Error("Error al cargar pacientes")

        const data = await response.json()

        // Mapeamos al formato { id, name }
        const list = data.map((p) => ({
          id: p.idPaciente,
          name: p.nombre,
        }))

        setPatientList(list)
      } catch (err) {
        console.error(err)
        setPatientList([]) // o algún valor por defecto
      }
    }
    fetchPacientes()

    if (location.state?.openNewAppointment) {
      setShowNewAppointment(true)
      // Si se pasó una fecha seleccionada, usarla
      if (location.state.selectedDate) {
        const selectedDateObj = parseISO(location.state.selectedDate)
        setSelectedDate(selectedDateObj)
        setNewAppointment({
          ...newAppointment,
          date: location.state.selectedDate,
        })
      }

      // Si un paciente ID fue pasado, pre-seleccionar ese paciente
      if (location.state.patientId) {
        const patientName = getPatientNameById(location.state.patientId)
        setPatientSearchText(patientName)
        setNewAppointment({
          ...newAppointment,
          patient: patientName,
        })
      }

      // Si un nombre de paciente fue pasado directamente, usarlo
      if (location.state.patientName) {
        setPatientSearchText(location.state.patientName)
        setNewAppointment({
          ...newAppointment,
          patient: location.state.patientName,
        })
      }
    }
  }, [location.state])

  // Function to get patient name by ID
  const getPatientNameById = (id) => {
    const patient = patientList.find((p) => p.id === id)
    return patient ? patient.name : ""
  }

  // Dropdown states
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showReasonDropdown, setShowReasonDropdown] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedReason, setSelectedReason] = useState("Vacaciones")
  const [showUnblockModal, setShowUnblockModal] = useState(false)
  const [blockToUnblock, setBlockToUnblock] = useState(null)

  // Add this after the other state declarations
  const [showAppointmentHours, setShowAppointmentHours] = useState(false)
  const [appointmentHours, setAppointmentHours] = useState({
    date: format(selectedDate, "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "18:00",
    duration: 30,
  })

  // Patient search dropdown
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [patientSearchText, setPatientSearchText] = useState("")

  // Date picker mini calendar
  const [showMiniCalendar, setShowMiniCalendar] = useState(false)
  const [showMiniCalendarEnd, setShowMiniCalendarEnd] = useState(false)
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [miniCalendarEndDate, setMiniCalendarEndDate] = useState(new Date())

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    time: "10:00",
  })

  // Block days form state
  const [blockDays, setBlockDays] = useState({
    startDate: format(selectedDate, "yyyy-MM-dd"),
    endDate: format(selectedDate, "yyyy-MM-dd"),
    reason: "Vacaciones",
    startTime: "09:00",
    endTime: "18:00",
  })

  // Filtered patients based on search
  const filteredPatients = patientList
    .filter((patient) => patient.name.toLowerCase().includes(patientSearchText.toLowerCase()))
    .map((patient) => patient.name)

  // Time options
  const [timeOptions, setTimeOptions] = useState([])
  useEffect(() => {
    const cargarHoras = async () => {
      try {
        const res = await fetch(`http://localhost:8000/fechasDisponibles?fecha=${newAppointment.date}`)
        const data = await res.json()
        setTimeOptions(data)

        const disponible = data.find(h => h.disponible === 1 && h.bloqueado === 0)
        if (disponible) {
          console.log("Imprimiendo hora disponible")
          console.log(disponible) 
          setSelectedTime(disponible)
        }else{
          setSelectedTime(null)
        }
      } catch (err) {
        console.error("Error al cargar horarios:", err)
      }
    }

    if (newAppointment.date) {
      cargarHoras()
    }
  }, [newAppointment.date, showNewAppointment]) // Se ejecuta cada vez que cambia la fecha seleccionada

  // Reason options
  const reasonOptions = ["Vacaciones", "Día festivo", "Capacitación", "Mantenimiento", "Otro"]

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Mini calendar navigation
  const prevMiniMonth = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setMiniCalendarDate(subMonths(miniCalendarDate, 1))
  }

  const nextMiniMonth = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setMiniCalendarDate(addMonths(miniCalendarDate, 1))
  }

  const prevMiniMonthEnd = (e) => {
    e.stopPropagation()
    setMiniCalendarEndDate(subMonths(miniCalendarEndDate, 1))
  }

  const nextMiniMonthEnd = (e) => {
    e.stopPropagation()
    setMiniCalendarEndDate(addMonths(miniCalendarEndDate, 1))
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

  // Modificar la función para verificar si una hora ya está ocupada
  const normalizeTime = (timeStr) => {
    // Convertir formatos como "1:00 pm" a "1:00 pm" para comparación consistente
    if (!timeStr) return ""

    // Si el tiempo ya tiene am/pm, normalizarlo a minúsculas
    if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
      return timeStr.toLowerCase()
    }

    // Si el tiempo está en formato 24h (como "13:00"), convertirlo a formato 12h
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours, 10)

    if (hour > 12) {
      return `${hour - 12}:${minutes} pm`
    } else if (hour === 12) {
      return `12:${minutes} pm`
    } else if (hour === 0) {
      return `12:${minutes} am`
    } else {
      return `${hour}:${minutes} am`
    }
  }

  // Get block for selected date
  const getBlockForDate = (date) => {
    return blockedDates.find((block) => {
      try {
        const start = parseISO(block.startDate)
        const end = parseISO(block.endDate)
        return date >= start && date <= end
      } catch (error) {
        return false
      }
    })
  }

  // Añadir esta función para depuración
  /*const logAppointmentsAndTimes = (date) => {
    console.log("Fecha seleccionada:", format(date, "yyyy-MM-dd"))
    const appts = getAppointmentsForDate(date)
    console.log("Citas para esta fecha:", appts)

    timeOptions.forEach((time) => {
      const isBooked = isTimeSlotBooked(date, time)
      console.log(`Hora ${time}: ${isBooked ? "OCUPADA" : "disponible"}`)
    })
  }*/

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date)

    // Depurar las citas y horarios
    //logAppointmentsAndTimes(date)

    // Check if date is blocked
    const block = getBlockForDate(date)
    if (block) {
      setBlockToUnblock(block)
      setShowUnblockModal(true)
    }
  }

  // Handle mini calendar date selection
  const handleMiniCalendarDateClick = (date) => {
    setNewAppointment({
      ...newAppointment,
      date: format(date, "yyyy-MM-dd"),
    })
    setShowMiniCalendar(false)
  }

  // Handle mini calendar end date selection
  const handleMiniCalendarEndDateClick = (date) => {
    setBlockDays({
      ...blockDays,
      endDate: format(date, "yyyy-MM-dd"),
    })
    setShowMiniCalendarEnd(false)
  }

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setNewAppointment({
      ...newAppointment,
      patient,
    })
    setPatientSearchText(patient)
    setShowPatientDropdown(false)
  }

  // Handle new appointment form submission
  const handleNewAppointmentSubmit = (e) => {
    e.preventDefault()
    const newAppointmentObj = {
      id: appointments.length + 1,
      ...newAppointment,
      time: selectedTime,
    }
    setAppointments([...appointments, newAppointmentObj])
    setShowNewAppointment(false)
    // Reset form
    setNewAppointment({
      patient: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      time: "10:00",
    })
    setPatientSearchText("")
  }

  // Handle block days form submission
  const handleBlockDaysSubmit = async (e) => {
    e.preventDefault()
    console.log("Se ejecuto el codigo de bloquear dias")
    const bloquearDias = async () => {
      try {
      let haveAppointments = false
      appointments.forEach((cita) => {
        // Convertimos las fechas a objetos Date
        const citaDate = new Date(cita.date);
        const startDate = new Date(blockDays.startDate);
        const endDate = new Date(blockDays.endDate);

        // Comparamos
        if (citaDate >= startDate && citaDate <= endDate) {
          haveAppointments = true;
        }
      });
      if (haveAppointments) {
        const confirmar = window.confirm("Los días a bloquear contienen citas ya definidas. Si bloqueas los días, las citas se cancelarán. ¿Deseas continuar?");
        if (!confirmar) return; // Si el usuario cancela, detenemos aquí
      }

      let inicio = `${blockDays.startDate}T${blockDays.startTime}`
      let fin = `${blockDays.endDate}T${blockDays.endTime}`
      let bloqueado = 1
      let url = `http://127.0.0.1:8000/fechasDisponibles?inicio=${inicio}&fin=${fin}&bloqueado=1`
      const response = await fetch(url, {
        method: "PATCH"
      })
      if (!response.ok) {
        const errorData = await response.json()
        alert("Error: " + errorData.detail)
      } else {
        const data = await response.json()
        alert(data.message)
      }
    } catch (error) {
      alert("Ocurrio un error al hacer la peticion" + error)
    }
    }
    
    await bloquearDias()

    setShowBlockDays(false)
    // Reset form
    setBlockDays({
      startDate: format(selectedDate, "yyyy-MM-dd"),
      endDate: format(selectedDate, "yyyy-MM-dd"),
      reason: "Vacaciones",
      startTime: "09:00",
      endTime: "18:00",
    })
  }

  //Modificado para crear los horarios disponibles
  // Add this after the other handler functions esto sirve para generar citas
  const handleAppointmentHoursSubmit = async (e) => {
    e.preventDefault()
    // Here you would typically save the appointment hours to your backend
    console.log("Appointment hours set:", appointmentHours)
    const horarios = []
    let [h, m] = appointmentHours.startTime.split(":").map(Number)
    const [endH, endM] = appointmentHours.endTime.split(":").map(Number)
    const duracionCita = Number.parseInt(appointmentHours.duration)
    const fecha = appointmentHours.date

    while (h < endH || (h === endH && m < endM)) {
      const horaActual = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      horarios.push(horaActual)
      m += duracionCita
      if (m >= 60) {
        h += Math.floor(m / 60)
        m = m % 60
      }
    }

    for (const hora of horarios) {
      console.log(hora)
    }

    for (const hora of horarios) {
      try {
        const url = "http://127.0.0.1:8000/fechasDisponibles"
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: `${fecha}T${hora}:00`,
            disponible: 1,
            seleccionado: 0,
            bloqueado: 0,
          }),
        })
      } catch (error) {
        console.log("Error al enviar" + hora, error)
      }
    }

    alert("Horario creados correctamente")

    setShowAppointmentHours(false)
    // Reset form
    setAppointmentHours({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "18:00",
    })
  }

  // Handle unblock confirmation AQUI SE PROGRAMA EL DESBLOQUEO
  const handleUnblock = async () => {
    if (blockToUnblock) {
      const updatedBlocks = blockedDates.filter((block) => block.id !== blockToUnblock.id)
      setBlockedDates(updatedBlocks)
      const inicio = `${blockToUnblock.startDate}T00:00:00`
      const fin = `${blockToUnblock.endDate}T23:59:59`
      try{
      let url = `http://127.0.0.1:8000/fechasDisponibles?inicio=${inicio}&fin=${fin}&bloqueado=0`
      const response = await fetch(url, {
        method: "PATCH"
      })
      if (!response.ok) {
        const errorData = await response.json()
        alert("Error: " + errorData.detail)
      } else {
        const data = await response.json()
        alert(data.message)
      }
    } catch (error) {
      alert("Ocurrio un error al hacer la peticion" + error)
    }

      //esto se programa despues
      setShowUnblockModal(false)
      setBlockToUnblock(null)
    }
  }

  // Delete appointment
  const deleteAppointment = (id) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.id !== id)
    setAppointments(updatedAppointments)
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
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
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Create calendar days array
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null) // Empty cells for days before the 1st of the month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // Days of the week
  const daysOfWeek = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]

  // Month names in Spanish
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Update the calendar header to match the new design
  const renderCalendarHeader = () => {
    return (
      <div className="calendar-header">
        <div className="year-display">{year}</div>
        <div className="month-navigation">
          <button className="nav-button" onClick={prevMonth}>
            <ChevronLeftIcon />
          </button>
          <div className="month-display">{monthNames[month]}</div>
          <button className="nav-button" onClick={nextMonth}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    )
  }

  // Update the appointments header to match the new design
  const renderAppointmentsHeader = () => {
    return (
      <div className="appointments-header">
        {format(selectedDate, "d / MMMM / yyyy").replace(/^\w/, (c) => c.toUpperCase())}
      </div>
    )
  }

  // Update the calendar actions to match the new design
  const renderCalendarActions = () => {
    return (
      <div className="calendar-actions">
        <button className="action-button block-button" onClick={() => setShowBlockDays(true)}>
          Bloquear días
        </button>
        <button className="action-button block-button" onClick={() => setShowAppointmentHours(true)}>
          Horas de cita
        </button>
        <button className="action-button new-button" onClick={() => setShowNewAppointment(true)}>
          Nueva cita <PlusIcon />
        </button>
      </div>
    )
  }

  // Toggle dropdown functions
  const toggleMiniCalendar = (e) => {
    e.stopPropagation()
    setShowMiniCalendar(!showMiniCalendar)
  }

  const toggleTimeDropdown = (e) => {
    e.stopPropagation()
    setShowTimeDropdown(!showTimeDropdown)
  }

  const togglePatientDropdown = (e) => {
    e.stopPropagation()
    setShowPatientDropdown(!showPatientDropdown)
  }

  const toggleReasonDropdown = (e) => {
    e.stopPropagation()
    setShowReasonDropdown(!showReasonDropdown)
  }

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
          <div className="sidebar-item active">
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
          <div className="calendar-container">
            {renderCalendarHeader()}

            <div className="calendar-grid">
              {/* Days of the week */}
              {daysOfWeek.map((day) => (
                <div key={day} className="day-name">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="empty-day"></div>
                }

                const isToday = isSameDay(day, new Date())
                const isSelected = isSameDay(day, selectedDate)
                const hasAppt = hasAppointment(day)
                const isDayBlocked = isBlocked(day)
                const dayNumber = day.getDate()

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

            {renderCalendarActions()}
          </div>

          <div className="appointments-panel">
            {renderAppointmentsHeader()}
            <div className="appointments-content">
              {getAppointmentsForDate(selectedDate).length > 0 ? (
                getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <span className="appointment-time">{appointment.time}</span>
                      <button className="delete-button" onClick={() => deleteAppointment(appointment.id)}>
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="appointment-patient">{appointment.patient}</div>
                    <button
                      className="generate-recipe"
                      onClick={() => {
                        // Find the patient by name
                        const patient = patientList.find((p) => p.name === appointment.patient) || {
                          id: 0,
                          name: appointment.patient,
                          age: "",
                        }

                        // Navigate to prescription page with patient data
                        navigate("/prescription", {
                          state: {
                            patient: patient,
                            appointmentDate: appointment.date,
                            appointmentTime: appointment.time,
                            returnTo: "calendar",
                          },
                        })
                      }}
                    >
                      Generar receta
                    </button>
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
            <h2 className="modal-title">Generar Cita</h2>
            <form onSubmit={handleNewAppointmentSubmit}>
              <div className="form-group">
                <label>Paciente</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={patientSearchText}
                    onChange={(e) => {
                      setPatientSearchText(e.target.value)
                      setShowPatientDropdown(true)
                    }}
                    placeholder="Buscar paciente"
                    onClick={togglePatientDropdown}
                  />
                  <div className="input-icons">
                    <SearchIcon />
                    <div onClick={togglePatientDropdown} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showPatientDropdown && (
                    <div className="dropdown-menu">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient, index) => (
                          <div key={index} className="dropdown-item" onClick={() => handlePatientSelect(patient)}>
                            {patient}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item">No se encontraron pacientes</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={format(parseISO(newAppointment.date), "dd/MM/yyyy")}
                    readOnly
                    onClick={toggleMiniCalendar}
                  />
                  <div className="input-icons">
                    <div onClick={toggleMiniCalendar} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showMiniCalendar && (
                    <div className="mini-calendar" onClick={(e) => e.stopPropagation()}>
                      <div className="mini-calendar-header">
                        <button type="button" className="nav-button" onClick={(e) => prevMiniMonth(e)}>
                          <ChevronLeftIcon />
                        </button>
                        <span className="mini-calendar-month">
                          {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                        </span>
                        <button type="button" className="nav-button" onClick={(e) => nextMiniMonth(e)}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="mini-calendar-grid">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="mini-day-name">
                            {day.substring(0, 1)}
                          </div>
                        ))}
                        {Array.from({
                          length: getFirstDayOfMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => (
                          <div key={`empty-${i}`} className="mini-empty-day"></div>
                        ))}
                        {Array.from({
                          length: getDaysInMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => {
                          const day = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), i + 1)
                          const isSelected = isSameDay(day, parseISO(newAppointment.date))
                          return (
                            <div
                              key={`day-${i}`}
                              className={`mini-calendar-day ${isSelected ? "selected" : ""}`}
                              onClick={() => handleMiniCalendarDateClick(day)}
                            >
                              {i + 1}
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
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={
                      selectedTime && selectedTime.fecha
                        ? new Date(selectedTime.fecha).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""
                    }
                    readOnly
                    onClick={toggleTimeDropdown}
                  />
                  <div className="input-icons">
                    <div onClick={toggleTimeDropdown} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showTimeDropdown && (
                    <div className="dropdown-menu">
                      {timeOptions.map((time) => {
                        // Verificar si la hora está ocupada
                        const isBooked = time.disponible === 0 ? true : false
                        const isBlocked = time.bloqueado === 1 ? true : false
                        let mensaje = ""
                        if (isBooked) mensaje = "Ocupado"
                        if (isBlocked) mensaje = "Bloqueado"
                        const hora = new Date(time.fecha).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        console.log(`Renderizando hora ${time.fecha}: ${isBooked ? "OCUPADA" : "disponible"}`)

                        return (
                          <div
                            key={time.idFecha}
                            className={`dropdown-item ${isBooked || isBlocked ? "disabled" : ""}`}
                            onClick={() => {
                              if (!isBooked && !isBlocked) {
                                setSelectedTime(time)
                                setShowTimeDropdown(false)
                              }
                            }}
                            style={{
                              opacity: isBooked || isBlocked ? 0.5 : 1,
                              cursor: isBooked || isBlocked ? "not-allowed" : "pointer",
                              textDecoration: isBooked || isBlocked ? "line-through" : "none",
                              color: isBooked || isBlocked ? "#999" : "inherit",
                            }}
                          >
                            {hora} {mensaje && `(${mensaje})`}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowNewAppointment(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar
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
            <h2 className="modal-title">Bloquear Días</h2>
            <form onSubmit={handleBlockDaysSubmit}>
              <div className="form-group">
                <label>Fecha Inicial</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={format(parseISO(blockDays.startDate), "dd/MM/yyyy")}
                    readOnly
                    onClick={toggleMiniCalendar}
                  />
                  <div className="input-icons">
                    <div onClick={toggleMiniCalendar} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showMiniCalendar && (
                    <div className="mini-calendar">
                      <div className="mini-calendar-header">
                        <button className="nav-button" onClick={(e) => prevMiniMonth(e)}>
                          <ChevronLeftIcon />
                        </button>
                        <span className="mini-calendar-month">
                          {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                        </span>
                        <button className="nav-button" onClick={(e) => nextMiniMonth(e)}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="mini-calendar-grid">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="mini-day-name">
                            {day.substring(0, 1)}
                          </div>
                        ))}
                        {Array.from({
                          length: getFirstDayOfMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => (
                          <div key={`empty-${i}`} className="mini-empty-day"></div>
                        ))}
                        {Array.from({
                          length: getDaysInMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => {
                          const day = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), i + 1)
                          const isSelected = isSameDay(day, parseISO(blockDays.startDate))
                          return (
                            <div
                              key={`day-${i}`}
                              className={`mini-calendar-day ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setBlockDays({
                                  ...blockDays,
                                  startDate: format(day, "yyyy-MM-dd"),
                                })
                                setShowMiniCalendar(false)
                              }}
                            >
                              {i + 1}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Fecha Final</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={format(parseISO(blockDays.endDate), "dd/MM/yyyy")}
                    readOnly
                    onClick={() => setShowMiniCalendarEnd(!showMiniCalendarEnd)}
                  />
                  <div className="input-icons">
                    <div onClick={() => setShowMiniCalendarEnd(!showMiniCalendarEnd)} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showMiniCalendarEnd && (
                    <div className="mini-calendar">
                      <div className="mini-calendar-header">
                        <button className="nav-button" onClick={(e) => prevMiniMonthEnd(e)}>
                          <ChevronLeftIcon />
                        </button>
                        <span className="mini-calendar-month">
                          {monthNames[miniCalendarEndDate.getMonth()]} {miniCalendarEndDate.getFullYear()}
                        </span>
                        <button className="nav-button" onClick={(e) => nextMiniMonthEnd(e)}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="mini-calendar-grid">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="mini-day-name">
                            {day.substring(0, 1)}
                          </div>
                        ))}
                        {Array.from({
                          length: getFirstDayOfMonth(miniCalendarEndDate.getFullYear(), miniCalendarEndDate.getMonth()),
                        }).map((_, i) => (
                          <div key={`empty-${i}`} className="mini-empty-day"></div>
                        ))}
                        {Array.from({
                          length: getDaysInMonth(miniCalendarEndDate.getFullYear(), miniCalendarEndDate.getMonth()),
                        }).map((_, i) => {
                          const day = new Date(miniCalendarEndDate.getFullYear(), miniCalendarEndDate.getMonth(), i + 1)
                          const isSelected = isSameDay(day, parseISO(blockDays.endDate))
                          return (
                            <div
                              key={`day-${i}`}
                              className={`mini-calendar-day ${isSelected ? "selected" : ""}`}
                              onClick={() => handleMiniCalendarEndDateClick(day)}
                            >
                              {i + 1}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <div className="input-with-icon">
                  <input type="text" value={selectedReason} readOnly onClick={toggleReasonDropdown} />
                  <div className="input-icons">
                    <div onClick={toggleReasonDropdown} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showReasonDropdown && (
                    <div className="dropdown-menu">
                      {reasonOptions.map((reason, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedReason(reason)
                            setShowReasonDropdown(false)
                          }}
                        >
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Hora Inicial</label>
                <input
                  type="time"
                  value={blockDays.startTime}
                  onChange={(e) => setBlockDays({ ...blockDays, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hora Final</label>
                <input
                  type="time"
                  value={blockDays.endTime}
                  onChange={(e) => setBlockDays({ ...blockDays, endTime: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowBlockDays(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unblock Modal */}
      {showUnblockModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Desbloquear Día</h2>
            <p>¿Estás seguro que deseas desbloquear este día?</p>
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={() => setShowUnblockModal(false)}>
                Cancelar
              </button>
              <button type="button" className="submit-button" onClick={handleUnblock}>
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Hours Modal */}
      {showAppointmentHours && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Horas de Cita</h2>
            <form onSubmit={handleAppointmentHoursSubmit}>
              <div className="form-group">
                <label>Fecha</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={format(parseISO(appointmentHours.date), "dd/MM/yyyy")}
                    readOnly
                    onClick={toggleMiniCalendar}
                  />
                  <div className="input-icons">
                    <div onClick={toggleMiniCalendar} style={{ cursor: "pointer" }}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  {showMiniCalendar && (
                    <div className="mini-calendar" onClick={(e) => e.stopPropagation()}>
                      <div className="mini-calendar-header">
                        <button type="button" className="nav-button" onClick={(e) => prevMiniMonth(e)}>
                          <ChevronLeftIcon />
                        </button>
                        <span className="mini-calendar-month">
                          {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                        </span>
                        <button type="button" className="nav-button" onClick={(e) => nextMiniMonth(e)}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="mini-calendar-grid">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="mini-day-name">
                            {day.substring(0, 1)}
                          </div>
                        ))}
                        {Array.from({
                          length: getFirstDayOfMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => (
                          <div key={`empty-${i}`} className="mini-empty-day"></div>
                        ))}
                        {Array.from({
                          length: getDaysInMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth()),
                        }).map((_, i) => {
                          const day = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), i + 1)
                          const isSelected = isSameDay(day, parseISO(appointmentHours.date))
                          return (
                            <div
                              key={`day-${i}`}
                              className={`mini-calendar-day ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setAppointmentHours({
                                  ...appointmentHours,
                                  date: format(day, "yyyy-MM-dd"),
                                })
                                setShowMiniCalendar(false)
                              }}
                            >
                              {i + 1}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Hora Inicial</label>
                <input
                  type="time"
                  value={appointmentHours.startTime}
                  onChange={(e) => setAppointmentHours({ ...appointmentHours, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hora Final</label>
                <input
                  type="time"
                  value={appointmentHours.endTime}
                  onChange={(e) => setAppointmentHours({ ...appointmentHours, endTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Duracion de cada cita</label>
                <input
                  type="number"
                  value={appointmentHours.duration}
                  onChange={(e) => setAppointmentHours({ ...appointmentHours, duration: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAppointmentHours(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage
