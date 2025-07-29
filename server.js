import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/check/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const url = `https://www.reddit.com/user/${username}/about.json`;
    console.log("🔍 Fetching:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedditCheckerBot/1.0"
      }
    });

    console.log("📡 Status Code:", response.status);

    if (!response.ok) {
      return res.json({ exists: false, debug: `Error ${response.status}` });
    }

    const text = await response.text();
    console.log("📄 Raw Response:", text);

    try {
      const data = JSON.parse(text);
      if (data?.data?.name) {
        return res.json({ exists: true, name: data.data.name });
      } else {
        return res.json({ exists: false, debug: "No data.name" });
      }
    } catch (err) {
      console.log("❌ JSON Parse Error:", err);
      return res.json({ exists: false, debug: "Invalid JSON" });
    }

  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.json({ exists: false, debug: "Server error" });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
