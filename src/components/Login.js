"use client"

import { useState } from "react"
import {jwtDecode} from "jwt-decode"
import { Link, useNavigate } from "react-router-dom"
import "./Auth.css"

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [clave, setClave] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    let isPaciente = true
    let role = ""
    
    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clave)) {
      isPaciente = false
    }

    // Validación de la contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número."
      );
      return;
    }

    console.log("Login attempt with:", { clave, password })

    try {
      let url = ""
      if (isPaciente) {
        role = "paciente"
        url = "http://127.0.0.1:8000/auth/login/pacientes"
      }
      else if (clave[2] === '1') {
        role = "medico"
        url = "http://127.0.0.1:8000/auth/login/medicos"
      }
      else if (clave[2] === '2') {
        role = "recepcionista"
        url = "http://127.0.0.1:8000/auth/login/recepcionistas"
      }
      else {
        alert("La clave no esta en el formato correcto")
        return;
      }
      
       // Creación de formulario
    const formData = new URLSearchParams()
    formData.append("username", clave)
    formData.append("password", password)

      const response = await fetch(url, {

        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Guarda el JWT en localStorage
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("userRole", role)
        navigate("/home")
        const token = localStorage.getItem("token")
        console.log(jwtDecode(token).role)
      }else{
        alert("Credenciales de inicio de sesión incorrectas")
      }

      
    } catch (error){
      console.error("Error en la solicitud:", error)
      alert("Ocurrió un error al iniciar sesion")
    }
  }

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="logo-section login-logo">
          <div className="logo-circle">
            <img src="/logo.jpg" alt="Logo" />
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            <h2 className="form-title">INICIO DE SESIÓN</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="form-field">
                  <label htmlFor="clave" className="field-label">
                    Correo electronico/Clave de acceso
                  </label>
                  <input
                    id="clave"
                    type="text"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className="field-input"
                    placeholder="Ej. claveMedico123"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="password" className="field-label">
                    Contraseña
                  </label>
                  <div className="password-field">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field-input"
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="forgot-password">
                  <Link to="/recover-password" className="link">
                    Recuperar contraseña
                  </Link>
                </div>

                <button type="submit" className="submit-button">
                  Iniciar sesión
                </button>

                <div className="auth-footer">
                  <p className="footer-text">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/register" className="link">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
