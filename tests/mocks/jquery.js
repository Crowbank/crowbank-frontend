const $ = function(selector) {
  // Basic implementation
  if (selector === 'document') {
    return {
      ready: function(callback) {
        callback();
      },
    };
  }
  return {
    // Add other methods as needed
  };
};

$.ajax = function() {
  // Mock ajax implementation if needed
};

// Add any other jQuery methods you're using in your code

module.exports = $;
