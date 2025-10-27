const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', categoryController.getCategories);

module.exports = router;
