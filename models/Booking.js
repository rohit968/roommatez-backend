const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  placeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  price: Number,
})

const BookingModel = mongoose.model('Booking', bookingSchema)

module.exports = BookingModel