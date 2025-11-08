/**
 * @file app.js
 * @description Точка входа в приложение ERP.AERO Node API.
 *
 * Настраивает и запускает сервер Express:
 *  - подключает middleware (CORS, JSON, логирование);
 *  - инициализирует маршруты (`authRoutes`, `fileRoutes`);
 *  - подключает базу данных Sequelize;
 *  - запускает HTTP-сервер.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize, initModels } = require('./models');

const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');

const app = express();

/**
 * Порт для запуска HTTP-сервера.
 * @type {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

// ==============================
// Middleware
// ==============================

app.use(cors()); // Разрешает доступ с любых доменов
app.use(express.json()); // Парсинг JSON тела запроса
app.use(express.urlencoded({ extended: true })); // Поддержка x-www-form-urlencoded
app.use(morgan('dev')); // Логирование запросов

// ==============================
// Routes
// ==============================

/**
 * Маршруты аутентификации.
 * @see routes/auth.routes.js
 */
app.use('/', authRoutes);

/**
 * Маршруты для загрузки и управления файлами.
 * @see routes/file.routes.js
 */
app.use('/file', fileRoutes);

/**
 * Базовый маршрут для проверки статуса API.
 * @route GET /
 * @returns {object} Объект с сообщением статуса API.
 */
app.get('/', (req, res) => res.json({ message: 'ERP.AERO Node API' }));

// ==============================
// Server bootstrap
// ==============================

/**
 * Асинхронная инициализация сервера:
 *  1. Проверяет подключение к БД.
 *  2. Инициализирует модели Sequelize.
 *  3. Запускает HTTP-сервер.
 */
(async () => {
  try {
    await sequelize.authenticate();
    await initModels();
    console.log('DB connected');
    app.listen(PORT, () => console.log(`Server started on ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();
