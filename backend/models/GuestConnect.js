const mongoose = require('mongoose');
const Joi = require('joi');

// Define the schema for guest connections
const GuestConnectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
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
    timestamps: true,  // Automatically adds `createdAt` and `updatedAt` fields
  }
);

GuestConnectSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;   // Remove __v field
    return ret;
  },
});

// Input validation schema using Joi
const validateGuestConnect = (data) => {
  const schema = Joi.object({
    guestFullName: Joi.string().required().min(3).messages({
      'string.min': 'Full name must be at least 3 characters long.',
      'any.required': 'Full name is required.',
    }),
    guestPhoneNo: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be a 10-digit number.',
      }),
    guestEmailId: Joi.string().email().required().messages({
      'string.email': 'Invalid email format.',
      'any.required': 'Email ID is required.',
    }),
    propertyLocationId: Joi.string().required().min(10).messages({
      'string.min': 'Property Location ID must be at least 10 characters long.',
      'any.required': 'Property Location ID is required.',
    }),
    propertyNetworkId: Joi.string().required().min(10).messages({
      'string.min': 'Property Network ID must be at least 10 characters long.',
      'any.required': 'Property Network ID is required.',
    }),
  });

  return schema.validate(data, { abortEarly: false }); // Returns all errors, not just the first one
};

// Create and export the Mongoose model and validation function
const GuestConnect = mongoose.model('GuestConnect', GuestConnectSchema);

module.exports = { GuestConnect, validateGuestConnect };
