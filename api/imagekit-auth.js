const crypto = require("crypto");

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing IMAGEKIT_PRIVATE_KEY in Vercel env");

    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 2400;

    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return res.status(200).json({ token, expire, signature });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
