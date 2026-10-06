const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');
const AI_FEATURE_POLICY = require('../config/aiFeaturePolicy');
const AppError = require('../utils/appError');

const router = express.Router();

// Multer memory storage configuration for in-memory receipt upload processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: AI_FEATURE_POLICY.receiptScanLimits.maxFileSizeBytes,
  },
  fileFilter: (req, file, cb) => {
    if (AI_FEATURE_POLICY.receiptScanLimits.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid image file type. Please upload JPEG, PNG, WebP, HEIC, or GIF.', 400), false);
    }
  },
});

// Protect all AI routes with authentication
router.use(authController.protect);

router.get('/quota', aiController.getQuotaStatus);
router.post('/quick-log', aiController.quickLog);
router.post('/receipt-scan', upload.single('file'), aiController.receiptScan);
router.post('/confirm-transactions', aiController.confirmTransactions);

router.post('/coach', aiController.financialCoach);
router.post('/budget-forecast', aiController.budgetForecast);
router.post('/savings-scenario', aiController.savingsScenario);
router.post('/ask-plete', aiController.askPlete);
router.post('/monthly-report', aiController.monthlyReport);
router.post('/spending-insights', aiController.spendingInsights);

module.exports = router;
