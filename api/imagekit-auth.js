const crypto = require('crypto');

export default function handler(request, response) {
  // CORS configuration
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*'); // Lock this to your domain in production
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('Server configuration error: Missing ImageKit Private Key');
    }

    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    response.status(200).json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}
