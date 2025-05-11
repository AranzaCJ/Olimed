"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Auth.css"

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    const payload = {
      nombre: name,
      correo: email,
      fecha_nacimiento: birthDate,
      password: password
    }
  
    try {
      const response = await fetch("http://localhost:8000/auth/register/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
  
      if (response.ok) {
        const result = await response.json()
        console.log("Registro exitoso:", result)
        navigate("/login")
      } else {
        const errorData = await response.json()
        alert("Error: " + errorData.detail)
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      alert(error, " Falló la conexión con el servidor.")
    }
  }

  // Simple Eye icons
  const EyeIcon = () => (
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeOffIcon = () => (
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Form Section */}
        <div className="form-section register">
          <div className="form-container">
            <div className="register-header">
              <h2 className="form-title">REGISTRO</h2>

              {/* Logo on the right side */}
              <div className="register-logo">
                <div className="logo-circle">
                <img src="/logo.jpg" alt="Logo" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="form-field">
                  <label htmlFor="name" className="field-label">
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="birthdate" className="field-label">
                    Fecha de nacimiento
                  </label>
                  <input
                    id="birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="register-email" className="field-label">
                    Correo electronico o telefono
                  </label>
                  <input
                    id="register-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                    placeholder="ejemplo@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="register-password" className="field-label">
                    Contraseña
                  </label>
                  <div className="password-field">
                    <input
                      id="register-password"
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

                <div className="terms-checkbox">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="checkbox"
                    required
                  />
                  <label htmlFor="terms" className="checkbox-label">
                    Acepto{" "}
                    <Link to="/terms" className="link">
                      terminos y condiciones
                    </Link>
                  </label>
                </div>

                <button type="submit" className="submit-button" disabled={!acceptTerms}>
                  Registrarse
                </button>

                <div className="auth-footer">
                  <p className="footer-text">
                    Ya tienes cuenta?{" "}
                    <Link to="/login" className="link">
                      Iniciar Sesión
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

export default Register
