const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/dashboard', reportController.getDashboard);
router.get('/period', reportController.getReportByPeriod);
router.get('/categories', reportController.getCategoryReport);

module.exports = router;
