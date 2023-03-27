const mongoose = require('mongoose');

const AddPlaceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  description: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: {
    type: Number,
    require: true,
  },
  checkOut: {
    type: Number,
    require: true,
  },
  maxGuests: Number,
  price: Number,
})

const AddPlaceModel = mongoose.model('AddPlace', AddPlaceSchema);

module.exports = AddPlaceModel;