/**
 * @file Контроллер работы с файлами (использует FileService).
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const FileService = require('../services/file.service');
const { fileListQueryDto } = require('../dto/file.dto');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: async (_, __, cb) => {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

/**
 * POST /file/upload — загрузка файла
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });
  try {
    const rec = await FileService.saveFileRecord(req.user.id, req.file);
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /file/list — список файлов
 */
router.get('/list', authMiddleware, async (req, res) => {
  const { error, value } = fileListQueryDto.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const result = await FileService.listFiles(req.user.id, value.page, value.list_size);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /file/delete/:id — удаление файла
 */
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await FileService.deleteFile(req.user.id, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * PUT /file/update/:id — замена файла
 */
router.put('/update/:id', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });
  try {
    const rec = await FileService.updateFile(req.user.id, req.params.id, req.file);
    res.json({ message: 'Updated', id: rec.id });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * GET /file/:id — информация о файле пользователя
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const fileId = req.params.id;
    const rec = await FileService.getFileInfo(req.user.id, fileId);
    if (!rec) return res.status(404).json({ message: 'File not found' });
    res.json({
      id: rec.id,
      originalName: rec.originalName,
      extension: rec.extension,
      mimeType: rec.mimeType,
      size: rec.size,
      uploadedAt: rec.uploadedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /file/download/:id — скачать файл пользователя
 */
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const rec = await FileService.getFileInfo(req.user.id, req.params.id);
    if (!rec) return res.status(404).json({ message: 'File not found' });
    return res.download(rec.path, rec.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
