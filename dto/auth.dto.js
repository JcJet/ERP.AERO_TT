/**
 * @file DTO-схемы для аутентификации пользователей.
 * Используются для валидации данных входа и регистрации.
 */

const Joi = require('joi');

/** @typedef {Object} SignupDto */
const signupDto = Joi.object({
  identifier: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'identifier is required',
      'string.min': 'identifier must be at least 3 characters'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'password is required',
      'string.min': 'password must be at least 6 characters'
    })
});

/** @typedef {Object} SigninDto */
const signinDto = Joi.object({
  identifier: Joi.string().min(3).max(255).required(),
  password: Joi.string().min(6).required()
});

/** @typedef {Object} RefreshTokenDto */
const refreshTokenDto = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = { signupDto, signinDto, refreshTokenDto };
