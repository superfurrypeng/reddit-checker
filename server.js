import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { HttpsProxyAgent } from "https-proxy-agent";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Your proxy list
const proxyList = [
  "http://jgjhfbkw:kc0my7jixh3s@171.22.191.175:5257",
  "http://jgjhfbkw:kc0my7jixh3s@31.56.127.84:8076",
  "http://jgjhfbkw:kc0my7jixh3s@154.3.235.248:6108",
  "http://jgjhfbkw:kc0my7jixh3s@23.27.68.212:7292",
  "http://jgjhfbkw:kc0my7jixh3s@98.159.47.87:5111",
  "http://jgjhfbkw:kc0my7jixh3s@45.56.172.186:5253",
  "http://jgjhfbkw:kc0my7jixh3s@23.27.70.85:6665",
  "http://jgjhfbkw:kc0my7jixh3s@107.172.65.95:6078",
  "http://jgjhfbkw:kc0my7jixh3s@23.229.101.64:7833",
  "http://jgjhfbkw:kc0my7jixh3s@38.154.188.191:7964"
];

// Pick a random proxy
function getRandomProxy() {
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}

app.get("/check/:username", async (req, res) => {
  const username = req.params.username;
  const url = `https://www.reddit.com/user/${username}/about.json`;
  const proxy = getRandomProxy();
  const agent = new HttpsProxyAgent(proxy);

  try {
    console.log(`🔄 Using proxy: ${proxy}`);
    const response = await fetch(url, { agent });

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      return res.json({ exists: false, debug: `HTTP ${response.status}` });
    }

    const data = await response.json();

    if (data?.data?.name) {
      return res.json({ exists: true, name: data.data.name });
    } else {
      return res.json({ exists: false, debug: "No user data" });
    }
  } catch (err) {
    console.error("❌ Proxy Fetch Error:", err);
    return res.json({ exists: false, debug: "Proxy failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
