const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const verifyJWT = require('../middleware/verifyJWT')


router.use(verifyJWT);


router.route('/')
    .post(invoiceController.createInvoice)
    .get(invoiceController.getInvoices)

router.route('/:id')
    .patch(invoiceController.updateInvoice)
    .delete(invoiceController.deleteInvoice);

module.exports = router;