import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import RecoverPassword from "./components/RecoverPassword"
import HomePage from "./components/HomePage"
import CalendarPage from "./components/CalendarPage"
import PatientPage from "./components/PatientPage"
import SettingsPage from "./components/SettingsPage"
import PrescriptionPage from "./components/PrescriptionPage"

import HomePageRecep from "./components/HomePageRecep"
import CalendarPageRecep from "./components/CalendarPageRecep"
import PatientPageRecep from "./components/PatientPageRecep"

import HomePagePatient from "./components/HomePagePatient"
import CalendarPagePatient from "./components/CalendarPagePatient"
import PatientPagePatient from "./components/PatientPagePatient"
import SettingsPagePatient from "./components/SettingsPagePatient"

import "./App.css"

function App() {
  const userRole = localStorage.getItem("userRole")

  const getHomeComponent = () => {
    if (userRole === "recepcionista") return <HomePageRecep />;
    else if (userRole === "paciente") return <HomePagePatient />;
    else if (userRole === "medico") return <HomePage />;
  }

  const getCalendarComponent = () => {
    if (userRole === "recepcionista") return <CalendarPageRecep />
    else if (userRole === "paciente") return <CalendarPagePatient />;
    else return <CalendarPage />;
  }

  const getPatientComponent = () => {
    if (userRole === "recepcionista") return <PatientPageRecep />
    else if (userRole === "paciente") return <PatientPagePatient />;
    else if (userRole === "medico")  return <PatientPage />;
  }

  const getSettingComponent = () => {
    if (userRole === "paciente") return <SettingsPagePatient />;
    else if (userRole === "medico") return <SettingsPage />
  }
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/home" element={getHomeComponent()} />
        <Route path="/calendar" element={getCalendarComponent()} />
        <Route path="/patients" element={getPatientComponent()} />
        <Route path="/settings" element={getSettingComponent()} />
        <Route path="/prescription" element={<PrescriptionPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
