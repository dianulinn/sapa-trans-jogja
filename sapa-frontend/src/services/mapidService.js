const API_BASE_URL = "http://localhost:3000/api";

/**
 * Mengambil data Activities MAPID melalui backend SAPA Trans Jogja.
 *
 * @param {Object} feature - GeoJSON Polygon
 * @returns {Array} daftar activities
 */
export async function fetchSurveyActivities() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/activities", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("DATA DARI LARAVEL:", result);

    return result;
  } catch (error) {
    console.error("Error fetching MAPID Activities:", error);
    throw error;
  }
}