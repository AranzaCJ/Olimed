// API utility functions

// Base URL for the API
const API_BASE_URL = "http://127.0.0.1:8000" // Local development API URL

/**
 * Fetch patient data from the API
 * @param {number} patientId - The ID of the patient to fetch
 * @returns {Promise<Object>} - The patient data
 */
export const fetchPatientData = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/paciente/${patientId}`)

    if (!response.ok) {
      throw new Error(`Error fetching patient data: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching patient data:", error)
    throw error
  }
}

/**
 * Update patient data in the API
 * @param {number} patientId - The ID of the patient to update
 * @param {Object} patientData - The updated patient data
 * @returns {Promise<Object>} - The updated patient data
 */
export const updatePatientData = async (patientId, patientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/paciente/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    })

    if (!response.ok) {
      throw new Error(`Error updating patient data: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating patient data:", error)
    throw error
  }
}

/**
 * Get all patients from the API
 * @returns {Promise<Array>} - Array of patient data
 */
export const getAllPatients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes`)

    if (!response.ok) {
      throw new Error(`Error fetching patients: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching patients:", error)
    throw error
  }
}
