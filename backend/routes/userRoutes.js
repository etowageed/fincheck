const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect); // protects all the routes that follow

router.get('/', authController.restrictTo('admin'), userController.getAllUsers);
router.get('/me', userController.getMe);

router.use(authController.restrictTo('admin')); // restricts the following routes to admin and user roles
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
