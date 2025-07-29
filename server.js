import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import { HttpsProxyAgent } from "https-proxy-agent";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PROXY = "http://jgjhfbkw:kc0my7jixh3s@171.22.191.175:5257";

function loadCodes() {
  return JSON.parse(fs.readFileSync("codes.json"));
}

function saveCodes(codes) {
  fs.writeFileSync("codes.json", JSON.stringify(codes, null, 2));
}

app.post("/bulk-check", async (req, res) => {
  const { usernames, code } = req.body;

  if (!usernames || !Array.isArray(usernames)) {
    return res.status(400).json({ error: "Invalid usernames array" });
  }

  const codes = loadCodes();

  if (!codes[code] || codes[code] <= 0) {
    return res.status(403).json({ error: "Invalid or expired code" });
  }

  const results = [];

  for (const username of usernames) {
    try {
      const agent = new HttpsProxyAgent(PROXY);
      const response = await fetch(
        `https://www.reddit.com/user/${username}/about.json`,
        { agent }
      );

      if (!response.ok) {
        results.push({ username, exists: false });
      } else {
        const data = await response.json();
        results.push({ username, exists: !!data.data });
      }
    } catch (err) {
      results.push({ username, exists: false });
    }
  }

  codes[code] -= usernames.length;
  if (codes[code] < 0) codes[code] = 0;
  saveCodes(codes);

  res.json({ results, remaining: codes[code] });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
