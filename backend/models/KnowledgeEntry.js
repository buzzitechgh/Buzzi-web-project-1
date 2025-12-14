const mongoose = require('mongoose');

const knowledgeEntrySchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  keywords: [{ type: String, required: true }],
  answer: { type: String, required: true },
  action: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);