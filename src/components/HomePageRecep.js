"use client"
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode"; 
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./HomePage.css"

function HomePage() {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([]);
useEffect(() => {
  const token = localStorage.getItem("token") 
  if (token) {
    try {
      const decoded = jwtDecode(token)
      console.log("Contenido del token:", decoded)
    } catch (error) {
      console.error("Error al decodificar el token:", error)
    }
  } else {
    console.warn("No se encontró token en localStorage")
  }
}, [])


  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Contenido del token:", decoded);

      const medicoId = decoded.sub;

      fetch(`http://127.0.0.1:8000/medicos/${medicoId}/notificaciones`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error en la respuesta del servidor");
          return res.json();
        })
        .then((data) => {
          console.log("Notificaciones:", data);
          setNotifications(data);
        })
        .catch((err) => console.error("Error al obtener notificaciones:", err));
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  } else {
    console.warn("No se encontró token en localStorage");
  }
}, []);


  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }

  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, you would show a confirmation dialog and then delete the account
    alert("Esta función eliminaría tu cuenta después de confirmación.")
  }

  // Sample notification data
  
  // Icons for the sidebar and notifications
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

  // Function to render the appropriate icon based on notification type
  const renderNotificationIcon = (type) => {
    switch (type) {
      case "user":
        return <UserIcon />
      case "calendar":
        return <CalendarIcon />
      case "payment":
        return <PaymentIcon />
      default:
        return <UserIcon />
    }
  }

  const PaymentIcon = () => (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <circle cx="12" cy="14" r="2" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
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
              <div className="dropdown-divider"></div>
            </div>
          )}
        </div>
      </header>

      <div className="divider-line"></div>

      <div className="content-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-item active">
            <BellIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/calendar")}>
            <CalendarIcon />
          </div>
          <div className="sidebar-item" onClick={() => navigate("/patients")}>
            <FolderIcon />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {notifications.map((notification) => (
            <div className="notification-item" key={notification.idNotificacion}>
            <div className="notification-icon">{renderNotificationIcon(notification.tipo)}</div>
            <div className="notification-content">
            <h4>{notification.titulo}</h4>
            <p>{notification.mensaje}</p>
            <small>{new Date(notification.fecha_creacion).toLocaleString()}</small>
    </div>
  </div>
          ))}
        </main>
      </div>
    </div>
  )
}

export default HomePage