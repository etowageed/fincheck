const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

router
  .route('/')
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

router
  .route('/global-defaults')
  .get(categoryController.getGlobalDefaults)
  .post(
    authController.restrictTo('admin'),
    categoryController.createGlobalDefaults
  );

// Explicit override endpoint (optional - auto-override works via update)
router
  .route('/override/:globalCategoryId')
  .post(categoryController.overrideGlobalDefault);

router
  .route('/:id')
  .patch(categoryController.updateCategory) // Now handles auto-override
  .delete(categoryController.deleteCategory); // Now handles hiding global defaults

router
  .route('/:id/restore-to-global')
  .patch(categoryController.restoreToGlobalDefault);

module.exports = router;
