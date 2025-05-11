"use client"
import { jwtDecode } from 'jwt-decode'
import { useEffect } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./SettingsPage.css"
function SettingsPage() {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [activeOption, setActiveOption] = useState("password")
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [receptionistName, setReceptionistName] = useState("")
  //const [receptionistSurname, setReceptionistSurname] = useState("")
  const [receptionistUsername, setReceptionistUsername] = useState("")
  const [receptionistPassword, setReceptionistPassword] = useState("")
  const [receptionistConfirmPassword, setReceptionistConfirmPassword] = useState("")
  //const [activeOption, setActiveOption] = useState('receptionist'); 
  const [receptionistId, setReceptionistId] = useState(null)
  const [receptionistClave, setReceptionistClave] = useState("")
  const [medicoNombre, setMedicoNombre] = useState("")
  
  useEffect(() => {
    const fetchReceptionist = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/recepcionistas")
        const data = await response.json()

        if (response.ok && Array.isArray(data) && data.length > 0) {
          const firstReceptionist = data[0]
          setReceptionistName(firstReceptionist.nombre || "")
          setReceptionistUsername(firstReceptionist.correo || "")
          setReceptionistClave(firstReceptionist.clave || "")
          setReceptionistId(firstReceptionist.idRecepcionista)
          setReceptionistPassword("**********")
          // Puedes guardar también la contraseña si es parte de los datos (no recomendado por seguridad)
        } else {
          setReceptionistName("------")
          setReceptionistUsername("---------")
          setReceptionistId(null)
          setReceptionistPassword("---------")
          setReceptionistClave("--------")
          //console.warn("No se encontraron recepcionistas.")
        }
      } catch (error) {
        console.error("Error al cargar recepcionistas:", error)
      }

      try{
        
        //console.log(jwtDecode(token).sub)
        let idMedico = jwtDecode(token).sub
        let url = "http://127.0.0.1:8000/medico/"+idMedico
        const response = await fetch(url)
        const data = await response.json()

        if (response.ok && data != null){
          console.log(data.nombre)
          setMedicoNombre(data.nombre)
        }else{
          alert("Error al obtener los dato del medico")
        }

      }catch(error){
        alert("Ocurrio un error al cargar los datos del medico")
      }
    }

    fetchReceptionist()
  }, [])


  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login")
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    // Validación de la contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }

    try{
      const response = await fetch("http://127.0.0.1:8000/auth/change-password/medico", {

        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password : newPassword 
        })
      })
      
      if(response.ok){
        alert("Contraseña cambiada exitosamente")

      }else{
        alert("La contraseña actual ingresada es incorrecta")
      }

      
    }catch(error){
      alert("Error al tratar de procesar la solicitud")
    }
    
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setActiveOption("password")
    navigate("/settings")
  }

  const handleReceptionistRegister = async () => {
    if (
      !receptionistName ||
      //!receptionistSurname ||
      !receptionistUsername ||
      !receptionistPassword ||
      !receptionistConfirmPassword
    ) {
      alert("Por favor, completa todos los campos.")
      return
    }
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nameRegex.test(receptionistName)) {

      alert("El nombre solo puede contener letras y espacios.");
      return;
    }
    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receptionistUsername)) {
      alert("El usuario debe ser un correo electrónico válido.");
      return;
    }

    // Validación de la contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(receptionistPassword)) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número."
      );
      return;
    }

    if (receptionistPassword !== receptionistConfirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }

    // Encriptación de la contraseña antes de enviarla


    try {

      if (receptionistId == null) {
        const response = await fetch("http://127.0.0.1:8000/auth/register/recepcionistas", {

          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: receptionistName,
            //surname: receptionistSurname,
            correo: receptionistUsername,
            password: receptionistPassword
          })
        })

        const data = await response.json()

        if (response.ok) {
          alert("Recepcionista registrada con éxito.")
          setReceptionistName(data.nombre)
          //setReceptionistSurname("")
          setReceptionistUsername(data.correo)
          setReceptionistPassword("********")
          setReceptionistClave(data.clave)
          setReceptionistId(data.idRecepcionista)
          setActiveOption("receptionist")
        } else {
          alert("Error al registrar: " + (data.detail || "verifica los datos"))
        }
      } else {
        let url = "http://127.0.0.1:8000/recepcionista/"+receptionistId
        const response = await fetch(url, {

          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: receptionistName,
            //surname: receptionistSurname,
            correo: receptionistUsername,
            password: receptionistPassword
          })
        })

        const data = await response.json()

        if (response.ok) {
          alert("Recepcionista modificada con éxito.")
          setReceptionistName(data.nombre)
          //setReceptionistSurname("")
          setReceptionistUsername(data.correo)
          setReceptionistPassword("********")
          setReceptionistClave(data.clave)
          setReceptionistId(data.idRecepcionista)
          setActiveOption("receptionist")
        } else {
          alert("Error al modificar: " + (data.detail || "verifica los datos"))
        }
      }

    } catch (error) {
      console.error("Error en la solicitud:", error)
      alert("Ocurrió un error al modificar los datos de la recepcionista.")
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
                className={`settings-option ${activeOption === "password" ? "active" : ""}`}
                onClick={() => setActiveOption("password")}
              >
                <div className="option-icon">
                  <LockIcon />
                </div>
                <span>Cambio de contraseña</span>
              </div>
              <div
                className={`settings-option ${activeOption === "receptionist" ? "active" : ""}`}
                onClick={() => setActiveOption("receptionist")}
              >
                <div className="option-icon">
                  <ReceptionistIcon />
                </div>
                <span>Recepcionista</span>
              </div>
            </div>

            <div className="settings-panel">
              {activeOption === "password" && (
                <div className="settings-form">
                  <h2>Datos personales</h2>
                  <div className="form-group">
                    <label>Usuario:</label>
                    <input type="text" value={medicoNombre} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="password" value="****************" readOnly />
                  </div>
                  <button className="change-password-btn" onClick={() => setActiveOption("change-password")}>
                    Cambiar contraseña
                  </button>
                </div>
              )}

              {activeOption === "change-password" && (
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
                      <button type="button" className="cancel-btn" onClick={() => setActiveOption("password")}>
                        Cancelar
                      </button>
                      <button type="submit" className="submit-btn">
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeOption === "receptionist" && (
                <div className="settings-form">
                  <h2>Recepcionista actual:</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre(s):</label>
                      <input type="text" value={receptionistName} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Clave:</label>
                      <input type="text" value={receptionistClave} readOnly />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Correo:</label>
                    <input type="text" value={receptionistUsername} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="password" value={receptionistPassword} readOnly />
                  </div>
                  <button className="change-receptionist-btn" onClick={() => setActiveOption("change-receptionist")}>
                    Cambiar Recepcionista
                  </button>
                </div>
              )}

              {activeOption === "change-receptionist" && (

                <div className="settings-form">
                  <h2>Nuevos datos</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre(s):</label>
                      <input
                        type="text"
                        value={receptionistName}
                        onChange={(e) => setReceptionistName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Clave:</label>
                     <input
                      type="text"
                      value={receptionistClave}
                      onChange={(e) => setReceptionistClave(e.target.value)}
                    />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Correo:</label>
                    <input
                      type="text"
                      value={receptionistUsername}
                      onChange={(e) => setReceptionistUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contraseña:</label>
                    <input
                      type="password"
                      value={receptionistPassword}
                      onChange={(e) => setReceptionistPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmar contraseña:</label>
                    <input
                      type="password"
                      value={receptionistConfirmPassword}
                      onChange={(e) => setReceptionistConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-actions receptionist-actions">
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={handleReceptionistRegister}
                    >
                      Cambiar Recepcionista
                    </button>
                  </div>

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
