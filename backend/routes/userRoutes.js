const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect); // protects all the routes that follow

router.get('/', userController.getAllUsers);
router.get('/me', userController.getMe);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
