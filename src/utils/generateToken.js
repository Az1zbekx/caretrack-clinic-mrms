const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for the user
 * @param {Object} user - User details containing id, username, and role
 * @returns {string} - Signed JWT token
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_key_caretrack';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = generateToken;
