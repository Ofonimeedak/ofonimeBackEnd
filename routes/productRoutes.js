const express = require('express');
const upload = require("../multer");
const productController = require('../controller/productController')


const router = express.Router();



router.post('/',upload.array("images",3), productController.createProduct);





module.exports = router;