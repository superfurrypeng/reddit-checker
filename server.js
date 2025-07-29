import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import { HttpsProxyAgent } from "https-proxy-agent";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load codes from codes.json
function loadCodes() {
  return JSON.parse(fs.readFileSync("codes.json", "utf8"));
}

// Save codes back to file
function saveCodes(codes) {
  fs.writeFileSync("codes.json", JSON.stringify(codes, null, 2));
}

// Proxy list
const proxies = [
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

// Pick random proxy
function getRandomProxy() {
  return new HttpsProxyAgent(proxies[Math.floor(Math.random() * proxies.length)]);
}

// ✅ Single or Bulk Check Endpoint
app.post("/bulk-check", async (req, res) => {
  const { usernames, code } = req.body;

  if (!usernames || !code) {
    return res.status(400).json({ error: "Usernames and code are required" });
  }

  const codes = loadCodes();

  if (!codes[code] || codes[code] <= 0) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  // Split usernames by comma or space
  const usernameList = usernames.split(/[\s,]+/).filter(u => u.trim() !== "");

  if (usernameList.length === 0) {
    return res.status(400).json({ error: "No valid usernames provided" });
  }

  let results = [];

  for (let user of usernameList) {
    try {
      const response = await fetch(
        `https://www.reddit.com/user/${user}/about.json`,
        { agent: getRandomProxy() }
      );

      if (!response.ok) {
        results.push({ username: user, exists: false });
      } else {
        const data = await response.json();
        results.push({ username: user, exists: data && data.data ? true : false });
      }
    } catch (err) {
      results.push({ username: user, exists: false });
    }
  }

  // Deduct uses
  codes[code] -= usernameList.length;
  if (codes[code] < 0) codes[code] = 0;
  saveCodes(codes);

  res.json({
    remaining: codes[code],
    results
  });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
