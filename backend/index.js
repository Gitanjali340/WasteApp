const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');
const PORT = 3000;
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error:', err));


app.use(cors());
app.use(express.json());

app.use(express.json()); // To handle JSON body
app.use('/api', apiRoutes); // Prefix all routes with /api

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
