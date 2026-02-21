const crypto = require("crypto");

module.exports = async function handler(req, res) {
  // 1. Handle CORS (Allow any origin for this demo, or restrict to your domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 2. Handle Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3. Allow only GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error("Server Error: IMAGEKIT_PRIVATE_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // 4. Generate Auth Parameters
    // Token: Random hex string
    const token = crypto.randomBytes(16).toString("hex");
    
    // Expire: Current time + 30 minutes (unix timestamp)
    const expire = Math.floor(Date.now() / 1000) + 1800;
    
    // Signature: HMAC-SHA1 of (token + expire) using Private Key
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire.toString())
      .digest("hex");

    // 5. Return JSON
    return res.status(200).json({
      token,
      expire,
      signature
    });

  } catch (err) {
    console.error("Auth Generation Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
