const express = require('express');
const paymentController = require('../controller/paymentController')


const router = express.Router();



router.post('/initialize',  paymentController.initializePayment);
router.post('/webhook',  paymentController.getWebhookUpdate);
router.get('/verify/:reference',  paymentController.verifyPayment);





module.exports = router;