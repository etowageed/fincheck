const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Routes
app.get('/', (req, res) => {
  res.send('Fincheck API running...');
});

// MongoDB connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
    app.listen(PORT, () => {
      console.log(`...Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });
