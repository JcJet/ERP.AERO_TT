/**
 * @file file.model.js
 * @description Sequelize-модель для хранения метаданных загруженных пользователем файлов.
 *
 * Таблица `files` хранит не сами файлы, а информацию о них:
 *  - путь к файлу на диске
 *  - оригинальное имя
 *  - MIME-тип и расширение
 *  - размер и дату загрузки
 *  - связь с пользователем (userId)
 */

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Класс File — ORM-модель, описывающая таблицу `files`.
 * @class File
 * @augments Model
 * @property {number} id             — Уникальный идентификатор файла (PK, auto-increment).
 * @property {number} userId         — ID пользователя, которому принадлежит файл (FK → users.id).
 * @property {string} originalName   — Оригинальное имя файла при загрузке.
 * @property {string} [extension]    — Расширение файла (например, "jpg", "pdf").
 * @property {string} [mimeType]     — MIME-тип файла, например, "image/png" или "application/pdf".
 * @property {number} size           — Размер файла в байтах.
 * @property {string} path           — Абсолютный путь к файлу в локальном хранилище.
 * @property {Date} uploadedAt       — Дата и время загрузки файла.
 */
class File extends Model {}

/**
 * Инициализация модели File.
 * Определяет схему таблицы `files` в базе данных.
 */
File.init(
  {
    /** Уникальный идентификатор файла */
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    /** Внешний ключ — ID пользователя, которому принадлежит файл */
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    /** Оригинальное имя файла при загрузке */
    originalName: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },

    /** Расширение файла, например 'png', 'pdf' */
    extension: {
      type: DataTypes.STRING(100),
    },

    /** MIME-тип файла (определяется автоматически при загрузке) */
    mimeType: {
      type: DataTypes.STRING(255),
    },

    /** Размер файла в байтах */
    size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    /** Абсолютный путь к файлу в локальном хранилище */
    path: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },

    /** Дата и время загрузки файла */
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'file',
    tableName: 'files',
    timestamps: false, // отключаем createdAt / updatedAt
  }
);

module.exports = File;
