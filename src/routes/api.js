const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const INPICrawler = require('../crawlers/inpiCrawler');
const logger = require('../utils/logger');

const dataLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Try again in 1 minute.' }
});

router.use(dataLimiter);

router.get('/inpi/patents', async (req, res) => {
  try {
    const { medicine } = req.query;
    
    if (!medicine) {
      return res.status(400).json({
        success: false,
        error: 'Medicine parameter is required'
      });
    }

logger.info(`INPI API request: ${medicine}`);

    const inpiCrawler = new INPICrawler();
    const results = await inpiCrawler.searchPatents(medicine);
    
    res.json(results);
    
  } catch (error) {
    logger.error('INPI API error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/docs', (req, res) => {
  res.json({
    name: 'Generic Crawler Platform API',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check',
      'GET /api/data/inpi/patents': 'Search INPI patents by medicine name'
    },
    examples: {
      inpi_search: {
        url: '/api/data/inpi/patents?medicine=paracetamol',
        description: 'Search for patents containing paracetamol'
      }
    }
  });
});

module.exports = router;

