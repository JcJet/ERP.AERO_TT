/**
 * @file Контроллер аутентификации пользователей (использует AuthService).
 */
const express = require('express');
const { signupDto, signinDto, refreshTokenDto } = require('../dto/auth.dto');
const AuthService = require('../services/auth.service');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

/**
 * POST /signup — регистрация
 */
router.post('/signup', async (req, res) => {
  const { error } = signupDto.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const result = await AuthService.signup(req.body.identifier, req.body.password, req);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.message.includes('exists') ? 409 : 400).json({ message: err.message });
  }
});

/**
 * POST /signin — вход
 */
router.post('/signin', async (req, res) => {
  const { error } = signinDto.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const result = await AuthService.signin(req.body.identifier, req.body.password, req);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /signin/new_token — обновление токенов
 */
router.post('/signin/new_token', async (req, res) => {
  const { error } = refreshTokenDto.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const result = await AuthService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * GET /info — данные текущего пользователя
 */
router.get('/info', authMiddleware, (req, res) => res.json({ userId: req.user.id }));

/**
 * GET /logout — выход
 */
router.get('/logout', authMiddleware, async (req, res) => {
  try {
    await AuthService.logout(req.user.sessionId);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
