const mongoose = require('mongoose');

const SplashPageSchema = new mongoose.Schema(
  {
    propertyName: String,
    propertyLogo: String,
    propertyBackgroundImg: String,
    propertySplashPageTitle: String,
    propertySplashPageDescription: String,
    propertyLocationId: String,
  },
  { 
    timestamps: true    // This automatically adds `createdAt` and `updatedAt`
  }
);

// Alternatively, exclude `__v` when converting to JSON
SplashPageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v; // Remove the `__v` field when returning the document
    return ret;
  },
});

module.exports = mongoose.model('Property', SplashPageSchema);
