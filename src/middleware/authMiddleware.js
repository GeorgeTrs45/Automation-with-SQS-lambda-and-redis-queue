const API_KEYS = new Set([
    process.env.API_KEY_1,
    process.env.API_KEY_2  
  ]);
  
  const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!API_KEYS.has(apiKey)) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
  };
  
  module.exports = { apiKeyAuth };