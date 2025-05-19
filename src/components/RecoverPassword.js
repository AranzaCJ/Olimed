"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Auth.css"

function RecoverPassword() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/auth/recover-password/paciente', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: name,
          correo: email,
          new_password: newPassword
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al recuperar contraseña');
      }

      alert('Contraseña actualizada correctamente');
      // Opcional: redirigir al login
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(`No se pudo cambiar la contraseña: ${err.message}`);
    }
  };


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

  // Back arrow icon
  const BackArrowIcon = () => (
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
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="form-section">
          <div className="form-container">
            <div className="recover-header">
              <button onClick={() => navigate("/login")} className="back-button" aria-label="Volver">
                <BackArrowIcon />
              </button>
              <h2 className="form-title">Recuperar contraseña</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                {/* Nombre */}
                <div className="form-field">
                  <label htmlFor="name" className="field-label">Nombre</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="field-input"
                    required
                  />
                </div>

                {/* Email o teléfono */}
                <div className="form-field">
                  <label htmlFor="recover-email" className="field-label">
                    Correo electrónico o teléfono
                  </label>
                  <input
                    id="recover-email"
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="field-input"
                    placeholder="ejemplo@ejemplo.com"
                    required
                  />
                </div>

                {/* Nueva contraseña */}
                <div className="form-field">
                  <label htmlFor="new-password" className="field-label">
                    Contraseña nueva
                  </label>
                  <div className="password-field">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="field-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(v => !v)}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="form-field">
                  <label htmlFor="confirm-password" className="field-label">
                    Confirmar contraseña
                  </label>
                  <div className="password-field">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="field-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(v => !v)}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Botón de envío */}
                <button type="submit" className="submit-button">
                  Cambiar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecoverPassword

