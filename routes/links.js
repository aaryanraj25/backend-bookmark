const express = require('express');
const router = express.Router();
const Link = require('../models/Link');

// Get all links with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const tags = req.query.tags;
    const source = req.query.source;

    let query = {};
    
    if (search) {
      query.$or = [
        { url: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (source) {
      query.source = source;
    }

    const links = await Link.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Link.countDocuments(query);

    res.json({
      links,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLinks: total
    });
  } catch (error) {
    next(error);
  }
});

// Create a new link
router.post('/', async (req, res, next) => {
  try {
    const link = new Link({
      url: req.body.url,
      title: req.body.title,
      tags: req.body.tags,
      source: req.body.source
    });

    const savedLink = await link.save();
    res.status(201).json(savedLink);
  } catch (error) {
    next(error);
  }
});

// Get a single link
router.get('/:id', async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json(link);
  } catch (error) {
    next(error);
  }
});

// Update a link
router.patch('/:id', async (req, res, next) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json(link);
  } catch (error) {
    next(error);
  }
});

// Delete a link
router.delete('/:id', async (req, res, next) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;