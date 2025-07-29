import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors()); // ✅ Allows frontend (Netlify) to access backend

const limits = {};
const MAX_CHECKS = 50;
const TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

app.get("/check/:username", async (req, res) => {
  const ip = req.ip;
  const now = Date.now();

  if (!limits[ip]) limits[ip] = [];
  limits[ip] = limits[ip].filter((time) => now - time < TIME_WINDOW);

  if (limits[ip].length >= MAX_CHECKS) {
    return res.status(429).json({ error: "limit_reached" });
  }

  limits[ip].push(now);

  try {
    const response = await fetch(
      `https://www.reddit.com/user/${req.params.username}/about.json`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    if (response.status === 404) {
      return res.json({ exists: false });
    }

    const data = await response.json();
    res.json({ exists: true, name: data.data.name });
  } catch (err) {
    console.error("Error fetching Reddit API:", err);
    res.status(500).json({ error: "Error checking account" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
