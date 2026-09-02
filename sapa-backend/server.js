const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// ===============================
// TEST BACKEND
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "SAPA Trans Jogja Backend aktif",
  });
});


// ===============================
// MAPID ACTIVITIES
// ===============================
app.post("/api/activities", async (req, res) => {
  try {
    const { feature, start_date, end_date, hashtag, author } = req.body;

    // Feature wajib ada
    if (!feature) {
      return res.status(400).json({
        success: false,
        message: "feature wajib dikirim",
      });
    }

    // Pastikan feature berupa Polygon
    if (feature.type !== "Polygon") {
      return res.status(400).json({
        success: false,
        message: "feature harus berupa GeoJSON Polygon",
      });
    }

    const response = await fetch(
      "https://server.mapid.io/web/competition/activities",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.MAPID_MISSION_KEY,
        },
        body: JSON.stringify({
          feature,
          ...(start_date && { start_date }),
          ...(end_date && { end_date }),
          ...(hashtag && { hashtag }),
          ...(author && { author }),
        }),
      }
    );

    const result = await response.json();

    res.status(response.status).json(result);

  } catch (error) {
    console.error("MAPID Activities Error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menghubungi MAPID Activities API",
    });
  }
});


app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});