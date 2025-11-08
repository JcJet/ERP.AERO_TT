const router = require('express').Router();
const fileController = require('../controllers/file.controller');
router.use('/', fileController);
module.exports = router;
