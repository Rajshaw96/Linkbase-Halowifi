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
    timestamps: true
  }
);

// Alternatively, exclude `__v` when converting to JSON
SplashPageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Property', SplashPageSchema);
