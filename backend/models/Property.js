const mongoose = require('mongoose');

const SplashPageSchema = new mongoose.Schema(
  {
    propertyName: String,
    propertyLogo: String,
    propertyBackgroundImg: String,
    propertySplashPageTitle: String,
    propertySplashPageDescription: String,
  },
  { 
    versionKey: false,  // This disables the `__v` field
    timestamps: true    // This automatically adds `createdAt` and `updatedAt`
  }
);

// Alternatively, exclude `__v` when converting to JSON
SplashPageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id; // Rename _id to id
    delete ret._id;   // Optionally remove _id field
    delete ret.__v; // Remove the `__v` field when returning the document
    return ret;
  },
});

module.exports = mongoose.model('Property', SplashPageSchema);
