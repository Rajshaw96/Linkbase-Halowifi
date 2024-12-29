const mongoose = require('mongoose');
const Joi = require('joi');

// Define the schema and disable the `__v` field
const ConnectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    UserFullName: {
      type: String,
      required: true,
      minlength: 3,
    },
    UserPhoneNo: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^[0-9]{10}$/.test(v), // Regex for valid phone number
        message: 'Invalid phone number format',
      },
    },
    UserEmailId: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    LocationId: {
      type: String,
      required: true,
      minlength: 3,
    }
  },
  {
    versionKey: false, // This disables the `__v` field
    timestamps: true,  // This automatically adds `createdAt` and `updatedAt`
  }
);

// Alternatively, exclude `__v` when converting to JSON
ConnectSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id; // Rename _id to id
    delete ret._id;   // Optionally remove _id field
    delete ret.__v;   // Remove the `__v` field when returning the document
    return ret;
  },
});

// Validation Schema (for input validation)
const validateConnect = (data) => {
  const schema = Joi.object({
    UserFullName: Joi.string().required().min(3),
    UserPhoneNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
    UserEmailId: Joi.string().email().required(),
    LocationId: Joi.string().required().min(3),
  });
  return schema.validate(data);
};

// Ensure the model is exported correctly
const Connect = mongoose.model('Connect', ConnectSchema);

module.exports = {
  Connect,
  validateConnect,
};
