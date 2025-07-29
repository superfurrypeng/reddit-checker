import express from "express";
import fetch from "node-fetch";
import HttpsProxyAgent from "https-proxy-agent";

const app = express();
const PORT = process.env.PORT || 3000;

const proxyUrl = "http://jgjhfbkw:kc0my7jixh3s@38.154.188.191:7964";
const agent = new HttpsProxyAgent(proxyUrl);

app.get("/check/:username", async (req, res) => {
  const { username } = req.params;
  const url = `https://www.reddit.com/user/${username}/about.json`;

  try {
    console.log(`Fetching Reddit API for ${username} through proxy...`);
    const response = await fetch(url, { agent });

    if (!response.ok) {
      console.error(`❌ Reddit API Error: ${response.status}`);
      return res.json({ exists: false, debug: `HTTP ${response.status}` });
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);

      if (data.data && data.data.name) {
        return res.json({ exists: true, name: data.data.name });
      } else {
        return res.json({ exists: false, debug: "User not found" });
      }
    } catch (err) {
      console.error("❌ JSON Parse Error:", err);
      return res.json({ exists: false, debug: "Invalid JSON from Reddit" });
    }
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    return res.json({ exists: false, debug: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
