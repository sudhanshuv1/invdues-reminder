const express = require('express');
const { 
  getMailConfig, 
  configureGmail, 
  configureSMTP, 
  removeMailConfig,
  getEmailTemplate,
  updateEmailTemplate 
} = require('../controllers/mailConfigController');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// GET /mail-config - Get current mail configuration
router.get('/', getMailConfig);

// POST /mail-config/gmail - Configure Gmail
router.post('/gmail', configureGmail);

// POST /mail-config/smtp - Configure SMTP
router.post('/smtp', configureSMTP);

// DELETE /mail-config - Remove mail configuration
router.delete('/', removeMailConfig);

// GET /mail-config/template - Get email template
router.get('/template', getEmailTemplate);

// PUT /mail-config/template - Update email template
router.put('/template', updateEmailTemplate);

module.exports = router;