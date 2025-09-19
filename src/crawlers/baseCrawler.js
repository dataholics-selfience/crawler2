const logger = require('../utils/logger');

class BaseCrawler {
  constructor() {
    this.name = 'BASE_CRAWLER';
    this.baseUrl = '';
    this.defaultTimeout = 30000;
  }

  async crawl(url, options = {}) {
    throw new Error(crawl method must be implemented by );
  }

  log(message, data = {}) {
    logger.info([] , data);
  }

  logError(message, error) {
    logger.error([] , { error: error.message, stack: error.stack });
  }
}

module.exports = BaseCrawler;
