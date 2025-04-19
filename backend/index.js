const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');
const PORT = 3000;
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error:', err));


app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

app.use(express.json()); // To handle JSON body
app.use('/api', apiRoutes); // Prefix all routes with /api
app.use('/api/auth', authRoutes);
app.post('/api/logout', (req, res) => {
  // If you're using sessions, you can destroy it like:
  // req.session.destroy();

  res.send('Logged out successfully');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
