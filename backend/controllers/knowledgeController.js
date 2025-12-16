const KnowledgeEntry = require('../models/KnowledgeEntry');
const fs = require('fs').promises; // Use Promise API
const path = require('path');

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

// @desc    Upload Knowledge Base (File)
// @route   POST /api/knowledge/upload
// @access  Private/Admin
const uploadKnowledgeBase = async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
      if (ext === '.json') {
          // Process JSON Asynchronously
          const rawData = await fs.readFile(filePath, 'utf8');
          const entries = JSON.parse(rawData);

          if (!Array.isArray(entries)) {
              throw new Error('Invalid JSON format. Expected an array.');
          }

          let count = 0;
          for (const item of entries) {
              // Basic Validation
              if (!item.keywords || !item.answer) continue;

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
          
          // Cleanup
          await fs.unlink(filePath);
          
          return res.json({ success: true, count, message: `${count} entries imported successfully.` });

      } else if (ext === '.pdf' || ext === '.docx' || ext === '.doc') {
          // Mock Processing for PDF/DOCX
          // In production, use libraries like pdf-parse or mammoth here to extract text
          
          // Cleanup
          await fs.unlink(filePath);

          return res.json({ 
              success: true, 
              count: 0, 
              message: `File received! Background processing started for ${req.file.originalname}.` 
          });
      } else {
          await fs.unlink(filePath);
          return res.status(400).json({ message: 'Unsupported file type.' });
      }

  } catch (error) {
      // Ensure file cleanup on error
      try { await fs.unlink(filePath); } catch(e) {}
      console.error(error);
      res.status(500).json({ message: 'Processing Failed', error: error.message });
  }
};

module.exports = { getKnowledgeBase, addKnowledgeEntry, deleteKnowledgeEntry, uploadKnowledgeBase };