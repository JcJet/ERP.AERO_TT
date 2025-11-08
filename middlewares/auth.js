/**
 * @file auth.js
 * @description Express-middleware для проверки JWT access-токенов и актуальности сессии пользователя.
 *
 * Middleware выполняет:
 *  1. Извлечение и проверку JWT access-токена из заголовка Authorization.
 *  2. Валидацию payload токена (наличие userId и sessionId).
 *  3. Проверку существования и активности сессии в базе данных.
 *  4. Передачу данных пользователя (userId, sessionId) в req.user.
 *
 * При невалидном или просроченном токене возвращает HTTP 401 Unauthorized.
 */

const { verifyAccessToken } = require('../utils/tokens');
const db = require('../models');

/**
 * Проверяет JWT-токен и авторизует пользователя.
 * @async
 * @function authMiddleware
 * @param {import('express').Request} req  - Объект запроса Express.
 * @param {import('express').Response} res - Объект ответа Express.
 * @param {import('express').NextFunction} next - Следующий middleware.
 * @returns {Promise<void|import('express').Response>} —
 *  Возвращает 401 Unauthorized при неудачной проверке, либо вызывает next().
 * @example
 * // Пример использования в маршрутах
 * const authMiddleware = require('../middlewares/auth');
 * router.get('/protected', authMiddleware, (req, res) => {
 *   res.json({ userId: req.user.id });
 * });
 */
module.exports = async function authMiddleware(req, res, next) {
  try {
    // Проверка наличия заголовка Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Извлечение токена из заголовка
    const token = authHeader.split(' ')[1];

    // Проверка подписи и целостности токена
    const payload = verifyAccessToken(token);

    // Проверка содержимого payload (должны быть userId и sessionId)
    if (!payload || !payload.sessionId || !payload.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Проверка сессии в БД: существует ли, не отозвана ли и не просрочена ли
    const session = await db.Session.findByPk(payload.sessionId);
    if (!session || session.revoked) {
      return res.status(401).json({ message: 'Session revoked or not found' });
    }
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Авторизация успешна — сохраняем данные пользователя в req.user
    req.user = { id: payload.userId, sessionId: payload.sessionId };

    // Переходим к следующему middleware/контроллеру
    next();
  } catch (err) {
    // Ошибка верификации токена или БД
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};
