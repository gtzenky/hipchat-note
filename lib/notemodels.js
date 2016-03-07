// Collection of all JugglingDB Models
module.exports = function (addon) {
  return {
    noteContent: require('./models/notecontent')(addon),
  }
};