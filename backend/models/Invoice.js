const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User
  clientName: { type: String, required: true }, // Name of the client
  clientEmail: { type: String, required: true }, // Email of the client
  amount: { type: Number, required: true }, // Invoice amount
  dueDate: { type: Date, required: true }, // Invoice due date
  status: { type: String, enum: ['paid', 'unpaid', 'overdue'], default: 'unpaid' }, // Invoice status
  createdAt: { type: Date, default: Date.now } // Timestamp for invoice creation
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;