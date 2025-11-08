/**
 * @file FileService — бизнес-логика загрузки и управления файлами.
 */
const fs = require('fs/promises');
const path = require('path');
const { File } = require('../models');

class FileService {
  /**
   * Создаёт новую запись о файле в БД.
   * @param userId
   * @param file
   */
  static async saveFileRecord(userId, file) {
    const { path: filepath, originalname, mimetype, size } = file;
    const extension = path.extname(originalname).replace(/^\./, '');
    return File.create({
      userId,
      originalName: originalname,
      extension,
      mimeType: mimetype,
      size,
      path: filepath,
      uploadedAt: new Date()
    });
  }

  /**
   * Возвращает список файлов пользователя с пагинацией.
   * @param userId
   * @param page
   * @param list_size
   */
  static async listFiles(userId, page = 1, list_size = 10) {
    const offset = (page - 1) * list_size;
    const { count, rows } = await File.findAndCountAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']],
      offset,
      limit: list_size
    });
    return {
      meta: { total: count, page, list_size, total_pages: Math.ceil(count / list_size) },
      data: rows
    };
  }

  /**
   * Удаляет файл и запись о нём.
   * @param userId
   * @param id
   */
  static async deleteFile(userId, id) {
    const rec = await File.findOne({ where: { id, userId } });
    if (!rec) throw new Error('File not found');
    await fs.unlink(rec.path).catch(() => null);
    await rec.destroy();
  }

  /**
   * Обновляет (заменяет) файл.
   * @param userId
   * @param id
   * @param file
   */
  static async updateFile(userId, id, file) {
    const rec = await File.findOne({ where: { id, userId } });
    if (!rec) throw new Error('File not found');
    await fs.unlink(rec.path).catch(() => null);
    const { path: filepath, originalname, mimetype, size } = file;
    rec.set({
      originalName: originalname,
      extension: path.extname(originalname).replace(/^\./, ''),
      mimeType: mimetype,
      size,
      path: filepath,
      uploadedAt: new Date()
    });
    await rec.save();
    return rec;
  }

  /**
   * Возвращает информацию о файле по id (принадлежащем пользователю).
   * @param userId
   * @param fileId
   */
  static async getFileInfo(userId, fileId) {
    return File.findOne({ where: { id: fileId, userId } });
    }

  /**
   * Возвращает путь и имя файла для скачивания.
   * @param userId
   * @param fileId
   */
  static async getFileForDownload(userId, fileId) {
    return File.findOne({ where: { id: fileId, userId } });
}

}



module.exports = FileService;
