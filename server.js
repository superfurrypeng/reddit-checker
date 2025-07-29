import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/check/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedditCheckerBot/1.0"
      }
    });

    if (response.status === 404) {
      return res.json({ exists: false });
    }

    if (!response.ok) {
      return res.json({ exists: false });
    }

    const data = await response.json();

    if (data && data.data && data.data.name) {
      res.json({ exists: true, name: data.data.name });
    } else {
      res.json({ exists: false });
    }

  } catch (err) {
    console.error("❌ Error checking username:", err);
    res.status(500).json({ error: "Error checking account" });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
