const KnowledgeEntry = require('../models/KnowledgeEntry');

// @desc    Get all knowledge entries
// @route   GET /api/knowledge
// @access  Public
const getKnowledgeBase = async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({});
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a knowledge entry
// @route   POST /api/knowledge
// @access  Private/Admin
const addKnowledgeEntry = async (req, res) => {
  const { id, category, keywords, answer, action } = req.body;

  try {
    const entry = await KnowledgeEntry.create({
      id: id || `kb-${Date.now()}`,
      category,
      keywords,
      answer,
      action
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Delete a knowledge entry
// @route   DELETE /api/knowledge/:id
// @access  Private/Admin
const deleteKnowledgeEntry = async (req, res) => {
  try {
    const entry = await KnowledgeEntry.findOne({ id: req.params.id });
    if (entry) {
      await entry.deleteOne();
      res.json({ message: 'Entry removed' });
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload Knowledge Base (Bulk Replace/Merge)
// @route   POST /api/knowledge/upload
// @access  Private/Admin
const uploadKnowledgeBase = async (req, res) => {
  // Assuming the file content is passed as JSON body for simplicity via middleware or processed file content
  // In a real file upload, we'd read req.file. Here we assume the frontend parses it and sends the array.
  const entries = req.body; 

  if (!Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid format. Expected JSON array.' });
  }

  try {
      // Option 1: Replace All
      // await KnowledgeEntry.deleteMany({});
      
      // Option 2: Merge / Add New
      let count = 0;
      for (const item of entries) {
          const exists = await KnowledgeEntry.findOne({ id: item.id });
          if (!exists) {
              await KnowledgeEntry.create({
                  id: item.id || `kb-imp-${Date.now()}-${count}`,
                  category: item.category || 'general',
                  keywords: item.keywords || [],
                  answer: item.answer || '',
                  action: item.action
              });
              count++;
          }
      }
      
      res.json({ success: true, count, message: `${count} new entries added.` });
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getKnowledgeBase, addKnowledgeEntry, deleteKnowledgeEntry, uploadKnowledgeBase };