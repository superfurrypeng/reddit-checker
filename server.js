import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { HttpsProxyAgent } from "https-proxy-agent";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const proxyUrl = "http://jgjhfbkw:kc0my7jixh3s@38.154.188.191:7964";

app.get("/check/:username", async (req, res) => {
  const username = req.params.username;
  const url = `https://www.reddit.com/user/${username}/about.json`;

  try {
    console.log(`Fetching: ${url}`);

    const response = await fetch(url, {
      agent: new HttpsProxyAgent(proxyUrl)
    });

    if (!response.ok) {
      return res.json({ exists: false, debug: `HTTP ${response.status}` });
    }

    const data = await response.json();

    if (data && data.data && data.data.name) {
      return res.json({ exists: true, name: data.data.name });
    } else {
      return res.json({ exists: false, debug: "No user data" });
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    return res.json({ exists: false, debug: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
