// tests/utils/testHelpers.js
const bcrypt = require('bcrypt');
const { configureStore } = require('@reduxjs/toolkit');
const { encrypt } = require('../../backend/utils/encryption'); // Add this import

// Backend test utilities
const createTestUser = async (User, overrides = {}) => {
  const userData = {
    displayName: 'Test User',
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    ...overrides
  };
  
  return await User.create(userData);
};

const createTestInvoice = async (Invoice, userId, overrides = {}) => {
  const invoiceData = {
    userId,
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    amount: 1000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'unpaid',
    ...overrides
  };
  
  return await Invoice.create(invoiceData);
};

// Add mail config helper
const createTestMailConfig = async (MailConfig, userId, overrides = {}) => {
  const testPassword = 'testAppPassword123';
  const encryptedPassword = encrypt(testPassword);
  
  const mailConfigData = {
    userId,
    provider: 'smtp',
    user: 'test@example.com',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    pass: encryptedPassword, // Store encrypted password
    isConfigured: true,
    ...overrides
  };
  
  return await MailConfig.create(mailConfigData);
};

// Frontend test utilities
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, { initialState = {}, ...renderOptions } = {}) => {
  const store = createMockStore(initialState);
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(component, { wrapper: Wrapper, ...renderOptions }) };
};

module.exports = {
  createTestUser,
  createTestInvoice,
  createTestMailConfig, 
  createMockStore,
  renderWithProviders
};