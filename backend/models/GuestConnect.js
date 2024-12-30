const mongoose = require('mongoose');

const GuestConnectSchema = new mongoose.Schema(
  {
    guestFullName: {
      type: String,
      required: true,
      minlength: 3,
    },
    guestPhoneNo: {
      type: String,
      validate: {
        validator: (v) => /^[0-9]{10}$/.test(v),
        message: 'Invalid phone number format. It should be 10 digits.',
      },
    },
    guestEmailId: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.'],
    },
    propertyLocationId: {
      type: String,
      required: true,
      minlength: 10,
    },
    propertyNetworkId: {
      type: String,
      required: true,
      minlength: 10,
    },
  },
  {
    timestamps: true,
  }
);

GuestConnectSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('GuestConnect', GuestConnectSchema);
