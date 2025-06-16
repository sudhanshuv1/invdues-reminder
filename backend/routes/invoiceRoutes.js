const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT);

router.route('/')
    .post(invoiceController.createInvoice)
    .get(invoiceController.getInvoices)

router.route('/due')
    .get(invoiceController.getDueInvoices);

router.route('/:id')
    .get(invoiceController.getInvoiceById)
    .patch(invoiceController.updateInvoice)
    .delete(invoiceController.deleteInvoice);

module.exports = router;