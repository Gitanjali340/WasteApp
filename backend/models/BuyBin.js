const mongoose = require('mongoose');

const buyBinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BuyBin', buyBinSchema);
