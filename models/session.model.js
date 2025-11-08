/**
 * @file session.model.js
 * @description Sequelize-модель для хранения пользовательских сессий.
 *
 * Таблица `sessions` хранит активные refresh-токены и связанную с ними информацию:
 *  - уникальный идентификатор сессии (UUID)
 *  - ID пользователя
 *  - хэш refresh-токена
 *  - информацию об устройстве (User-Agent, IP)
 *  - статус (активна / отозвана)
 *  - срок действия refresh-токена
 *
 * Используется для:
 *  - поддержки нескольких устройств (несколько активных сессий на одного пользователя)
 *  - инвалидации конкретных refresh-токенов при logout
 */

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Класс Session — ORM-модель, описывающая таблицу `sessions`.
 * @class Session
 * @augments Model
 * @property {string} id                — Уникальный идентификатор сессии (UUID, PK).
 * @property {number} userId            — ID пользователя, к которому относится сессия (FK → users.id).
 * @property {string} refreshTokenHash  — Хэш refresh-токена (для защиты от утечек).
 * @property {string|null} userAgent    — Строка User-Agent браузера или приложения, из которого выполнен вход.
 * @property {string|null} ip           — IP-адрес клиента.
 * @property {boolean} revoked          — Флаг отзыва сессии (true — сессия недействительна).
 * @property {Date} expiresAt           — Дата и время истечения срока действия refresh-токена.
 */
class Session extends Model {}

/**
 * Инициализация ORM-модели `Session`.
 * Определяет схему таблицы `sessions` и их типы данных.
 */
Session.init(
  {
    /** Уникальный идентификатор сессии (UUID v4) */
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      comment: 'UUID идентификатор сессии',
    },

    /** Внешний ключ — ID пользователя */
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Связь с пользователем (users.id)',
    },

    /** Хэш refresh-токена (bcrypt), хранится вместо оригинального токена */
    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Хэшированный refresh-токен',
    },

    /** User-Agent клиента (браузера или приложения) */
    userAgent: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: 'Информация об устройстве пользователя',
    },

    /** IP-адрес клиента */
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP-адрес пользователя при входе',
    },

    /** Флаг отзыва сессии */
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Признак того, что сессия отозвана (logout или reuse)',
    },

    /** Срок действия refresh-токена */
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Дата и время истечения срока действия refresh-токена',
    },
  },
  {
    sequelize,
    modelName: 'session',
    tableName: 'sessions',
    timestamps: false,
    comment: 'Таблица активных refresh-токенов пользователей',
  }
);

module.exports = Session;
