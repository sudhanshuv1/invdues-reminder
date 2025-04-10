const Invoice = require('../models/Invoice'); // Import the Invoice model

// Create a new Invoice
const createInvoice = async (req, res) => {
  try {
    const { clientName, clientEmail, amount, dueDate, status } = req.body;
    console.log('Creating invoice with data:', req.body);
    const newInvoice = new Invoice({
      userId: req.user.id,
      clientName,
      clientEmail,
      amount,
      dueDate,
      status, // Optional: Defaults to 'unpaid' if not provided
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create invoice', error: error.message });
  }
};

// Get all Invoices for a user
const getInvoices = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to the request (via authentication middleware)
    console.log('Fetching invoices for user:', userId);
    const invoices = await Invoice.find({ userId });
    console.log('Invoices found:', invoices);
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve invoices', error: error.message });
  }
};

// Update an Invoice by ID
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Data to update, e.g., { status: 'paid' }

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update invoice', error: error.message });
  }
};

// Delete an Invoice by ID
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete invoice', error: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
};
