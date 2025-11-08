/**
 * @file DTO-схемы для операций с файлами.
 */

const Joi = require('joi');

/** @typedef {Object} FileListQueryDto */
const fileListQueryDto = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  list_size: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = { fileListQueryDto };
