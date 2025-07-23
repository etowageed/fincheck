const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const exportController = require('../controllers/exportController');

const router = express.Router();

router.use(authController.protect); // protects all the routes that follow

router.route('/me').get(userController.getMe).patch(userController.updateMe);
router.patch('/me/password', authController.updatePassword); // Add this line for authenticated users
router.get('/me/export', exportController.downloadData);

router.get('/', authController.restrictTo('admin'), userController.getAllUsers);

router.use(authController.restrictTo('admin')); // restricts the following routes to admin and user roles
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
