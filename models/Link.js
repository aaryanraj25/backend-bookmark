const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        try {
          new URL(v);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  title: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  visits: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['chrome_extension', 'mobile_app', 'web'],
    default: 'chrome_extension'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
linkSchema.index({ url: 1 });
linkSchema.index({ timestamp: -1 });
linkSchema.index({ tags: 1 });

module.exports = mongoose.model('Link', linkSchema);