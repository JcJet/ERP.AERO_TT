const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const ACCESS_EXPIRES_SECONDS = parseInt(process.env.ACCESS_TOKEN_EXPIRES_SECONDS || '600', 10);
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);

/**
 * Подписывает access token с указанным payload.
 *
 * @param {{ userId: string, sessionId: string }} payload - Данные, которые будут закодированы в токен.
 * @returns {string} Подписанный JWT access token.
 */
function signAccessToken(payload) {
  // payload should contain { userId, sessionId }
  const opts = { expiresIn: `${ACCESS_EXPIRES_SECONDS}s`, jwtid: uuidv4() };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, opts);
}

/**
 * Проверяет и декодирует access token.
 *
 * @param {string} token - JWT access token для проверки.
 * @returns {object} Декодированные данные токена, если он валиден.
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError} Если токен недействителен или истёк.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Подписывает refresh token с указанным payload.
 *
 * @param {{ userId: string, sessionId: string }} payload - Данные, которые будут закодированы в токен.
 * @returns {string} Подписанный JWT refresh token.
 */
function signRefreshToken(payload) {
  // payload contains { userId, sessionId }
  const opts = { expiresIn: `${REFRESH_EXPIRES_DAYS}d`, jwtid: uuidv4() };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, opts);
}

/**
 * Проверяет и декодирует refresh token.
 *
 * @param {string} token - JWT refresh token для проверки.
 * @returns {object} Декодированные данные токена, если он валиден.
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError} Если токен недействителен или истёк.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

/**
 * Хэширует токен для безопасного хранения.
 *
 * @param {string} token - Исходный токен.
 * @returns {Promise<string>} Хэш токена.
 */
async function hashToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

/**
 * Сравнивает исходный токен с сохранённым хэшем.
 *
 * @param {string} token - Исходный токен.
 * @param {string} hash - Хэш, с которым нужно сравнить.
 * @returns {Promise<boolean>} Возвращает `true`, если токен соответствует хэшу.
 */
async function compareTokenHash(token, hash) {
  return bcrypt.compare(token, hash);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  compareTokenHash,
  ACCESS_EXPIRES_SECONDS,
  REFRESH_EXPIRES_DAYS
};
