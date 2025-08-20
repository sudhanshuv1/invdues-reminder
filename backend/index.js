const app = require('./app');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Import the scheduler so cron jobs are set up (only for local development)
require(path.join(__dirname, 'utils', 'reminderScheduler'));

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
