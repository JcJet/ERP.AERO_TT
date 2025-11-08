/**
 * @file AuthService — сервис аутентификации и управления JWT/сессиями.
 */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Session } = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  compareTokenHash,
  verifyRefreshToken,
  ACCESS_EXPIRES_SECONDS,
  REFRESH_EXPIRES_DAYS
} = require('../utils/tokens');

class AuthService {
  /**
   * Регистрирует пользователя и создаёт новую сессию.
   * @param {string} identifier
   * @param {string} password
   * @param {import('express').Request} req
   * @returns {Promise<object>}
   */
  static async signup(identifier, password, req) {
    const existing = await User.findOne({ where: { identifier } });
    if (existing) throw new Error('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ identifier, passwordHash });
    return this._createSessionAndTokens(user, req);
  }

  /**
   * Вход по логину/паролю.
   * @param identifier
   * @param password
   * @param req
   */
  static async signin(identifier, password, req) {
    const user = await User.findOne({ where: { identifier } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    return this._createSessionAndTokens(user, req);
  }

  /**
   * Обновляет токены по refresh-токену.
   * @param refreshToken
   */
  static async refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const { sessionId, userId } = payload;
    const session = await Session.findByPk(sessionId);
    if (!session || session.revoked) throw new Error('Session not found or revoked');
    if (new Date(session.expiresAt) < new Date()) throw new Error('Refresh token expired');
    const match = await compareTokenHash(refreshToken, session.refreshTokenHash);
    if (!match) {
      session.revoked = true;
      await session.save();
      throw new Error('Refresh token invalid');
    }
    const newAccess = signAccessToken({ userId, sessionId });
    const newRefresh = signRefreshToken({ userId, sessionId });
    session.refreshTokenHash = await hashToken(newRefresh);
    session.expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000);
    await session.save();
    return { accessToken: newAccess, refreshToken: newRefresh, accessExpiresIn: ACCESS_EXPIRES_SECONDS };
  }

  /**
   * Завершает текущую сессию.
   * @param sessionId
   */
  static async logout(sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    session.revoked = true;
    session.refreshTokenHash = '';
    await session.save();
  }

  /**
   * Приватный метод создания JWT и записи сессии.
   * @param user
   * @param req
   * @private
   */
  static async _createSessionAndTokens(user, req) {
    const sessionId = uuidv4();
    const payload = { userId: user.id, sessionId };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000);

    await Session.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: refreshHash,
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip,
      revoked: false,
      expiresAt
    });

    return { userId: user.id, accessToken, refreshToken, accessExpiresIn: ACCESS_EXPIRES_SECONDS };
  }
}

module.exports = AuthService;
