/**
 * @file user.model.js
 * @description Sequelize-модель для хранения учетных записей пользователей.
 *
 * Таблица `users` содержит базовые данные для аутентификации:
 *  - уникальный идентификатор пользователя
 *  - логин (email или номер телефона)
 *  - хэш пароля
 *
 * Эта модель участвует в связях:
 *  - 1:N → `Session` (пользователь может иметь несколько сессий)
 *  - 1:N → `File` (пользователь может загружать несколько файлов)
 */

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Класс User — ORM-модель, описывающая таблицу `users`.
 * @class User
 * @augments Model
 * @property {number} id             — Уникальный идентификатор пользователя (PK).
 * @property {string} identifier     — Уникальный логин: email или номер телефона.
 * @property {string} passwordHash   — Хэш пароля (bcrypt).
 * @example
 * // Создание нового пользователя
 * await User.create({
 *   identifier: 'user@example.com',
 *   passwordHash: bcrypt.hashSync('secret123', 10)
 * });
 */
class User extends Model {}

/**
 * Инициализация ORM-модели `User`.
 * Определяет структуру таблицы `users` в базе данных.
 */
User.init(
  {
    /** Уникальный идентификатор пользователя (PK) */
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Автоинкрементный идентификатор пользователя',
    },

    /** Уникальный логин пользователя — email или телефон */
    identifier: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      comment: 'Уникальный идентификатор (email или телефон)',
    },

    /** Хэш пароля (bcrypt) */
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Хэшированный пароль пользователя',
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    timestamps: false,
    comment: 'Таблица учетных записей пользователей',
  }
);

module.exports = User;
