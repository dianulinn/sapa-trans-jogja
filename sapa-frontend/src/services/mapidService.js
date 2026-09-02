const API_BASE_URL = "http://localhost:3000/api";

/**
 * Mengambil data Activities MAPID melalui backend SAPA Trans Jogja.
 *
 * @param {Object} feature - GeoJSON Polygon
 * @returns {Array} daftar activities
 */
export async function fetchSurveyActivities(feature) {
  try {
    if (!feature) {
      throw new Error("GeoJSON Polygon belum diberikan.");
    }

    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature,
      }),
    });

    const result = await response.json();

    console.log("Response Activities:", result);

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Gagal mengambil data Activities."
      );
    }

    return result.data?.activities || [];
  } catch (error) {
    console.error("Error fetching MAPID Activities:", error);
    return [];
  }
}