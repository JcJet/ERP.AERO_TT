/**
 * @file index.js
 * @description Инициализация и настройка ORM-моделей Sequelize:
 *  - Подключение к базе данных
 *  - Определение связей (associations) между моделями User, Session, File
 *  - Синхронизация схемы с базой данных
 */

const sequelize = require('../config/db');
const User = require('./user.model');
const Session = require('./session.model');
const File = require('./file.model');

/**
 * Инициализирует все модели и их связи.
 *
 * Вызывается при старте приложения.  
 * Создаёт связи между таблицами и синхронизирует схему с базой данных.
 *
 * Для разработки используется `sequelize.sync({ alter: true })`,
 * чтобы автоматически применять изменения схемы.
 * В продакшне рекомендуется использовать миграции (`sequelize-cli`, `umzug` и т.п.).
 * @async
 * @function initModels
 * @returns {Promise<void>}
 */
const initModels = async () => {
  // Пользователь ↔ Сессии (1:N)
  // Один пользователь может иметь несколько активных сессий.
  User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
  Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Пользователь ↔ Файлы (1:N)
  // Один пользователь может загружать несколько файлов.
  User.hasMany(File, { foreignKey: 'userId', as: 'files' });
  File.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Синхронизация моделей с базой данных
  await sequelize.sync({ alter: true }); // dev only — для продакшна использовать миграции
};

module.exports = {
  sequelize,
  initModels,
  User,
  Session,
  File,
};
