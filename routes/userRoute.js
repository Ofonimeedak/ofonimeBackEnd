const express= require('express');

const userController = require('../controller/userController')


const router = express.Router();




router.post('/signup', userController.signup);
router.patch('/signup', userController.signup);
router.get('/login', userController.login);
router.post('/login', userController.login);
router.post('/update-profile', userController.signup);
router.post('/delete-user', userController.signup);
router.get('/all', userController.getAllUser);
router.post('/register', userController.register);
router.post('/verify', userController.verify);
router.post('/validate', userController.validate);
router.get('/users/:userId', userController.getSingleUser);

 module.exports = router;
