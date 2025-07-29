import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test secret key (always passes verification)
const SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

const userLimits = {};

app.post("/check/:username", async (req, res) => {
  const { token } = req.body;
  const ip = req.ip;

  // Verify CAPTCHA (will always pass with test key)
  const captchaVerify = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`,
    { method: "POST" }
  ).then(r => r.json());

  if (!captchaVerify.success) {
    return res.status(400).json({ error: "CAPTCHA failed" });
  }

  // Limit: 50 checks per IP per 24 hours
  if (!userLimits[ip]) userLimits[ip] = { count: 0, reset: Date.now() + 86400000 };

  if (Date.now() > userLimits[ip].reset) {
    userLimits[ip] = { count: 0, reset: Date.now() + 86400000 };
  }

  if (userLimits[ip].count >= 50) {
    return res.status(429).json({ error: "Daily limit reached (50 checks)" });
  }

  userLimits[ip].count++;

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
  } catch {
    res.status(500).json({ error: "Error checking account" });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
