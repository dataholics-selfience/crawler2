const BaseCrawler = require('./baseCrawler');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const { parseWithGroq } = require('../parsers/groqParser');

class INPICrawler extends BaseCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://busca.inpi.gov.br';
    this.searchUrl = 'https://busca.inpi.gov.br/pePI/jsp/patentes/PatenteSearchBasico.jsp';
    this.name = 'INPI_CRAWLER';
  }

  async searchPatents(searchTerm, options = {}) {
    const strategies = ['requests', 'puppeteer'];
    
    for (const strategy of strategies) {
      try {
logger.info(`INPI: Trying ${strategy} strategy for: ${searchTerm}`);
        
        if (strategy === 'requests') {
          return await this.searchWithRequests(searchTerm, options);
        } else {
          return await this.searchWithPuppeteer(searchTerm, options);
        }
      } catch (error) {
        logger.warn(INPI:  strategy failed:, error.message);
        
        if (strategy === strategies[strategies.length - 1]) {
          throw new Error(All strategies failed for INPI search: );
        }
      }
    }
  }

  async searchWithRequests(searchTerm, options = {}) {
    try {
      const formResponse = await axios.get(this.searchUrl, {
        headers: this.getHeaders(),
        timeout: 30000
      });

      const $ = cheerio.load(formResponse.data);
      const formData = this.extractFormData($);
      
      const searchData = {
        ...formData,
        'textoPesquisa': searchTerm,
        'tipoSearchBas': '1',
        'searchBasico': 'Pesquisar'
      };

      const searchResponse = await axios.post(
        'https://busca.inpi.gov.br/pePI/servlet/PatenteServletController',
        new URLSearchParams(searchData),
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': this.searchUrl
          },
          timeout: 30000
        }
      );

      return await this.parseSearchResults(searchResponse.data, searchTerm);
      
    } catch (error) {
      logger.error('INPI Requests strategy error:', error);
      throw error;
    }
  }

  async searchWithPuppeteer(searchTerm, options = {}) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(this.searchUrl, { waitUntil: 'networkidle2' });
      
      await page.type('input[name="textoPesquisa"]', searchTerm);
      await page.select('select[name="tipoSearchBas"]', '1');
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('input[name="searchBasico"]')
      ]);
      
      const resultsHtml = await page.content();
      return await this.parseSearchResults(resultsHtml, searchTerm);
      
    } catch (error) {
      logger.error('INPI Puppeteer strategy error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async parseSearchResults(html, searchTerm) {
    try {
      const groqPrompt = Parse this INPI patent search results HTML and extract structured data.
Search term: ""

Extract each patent with:
- patent_number (número da patente)
- title (título/nome da patente)  
- holder (titular/depositante)
- filing_date (data de depósito)
- status (situação da patente)

Return as JSON array. If no results found, return empty array.;

      const parsedData = await parseWithGroq(groqPrompt, html);
      const results = this.validateResults(parsedData, searchTerm);
      
      logger.info(INPI: Found  patents for "");
      
      return {
        success: true,
        search_term: searchTerm,
        total_results: results.length,
        timestamp: new Date().toISOString(),
        results: results
      };
      
    } catch (error) {
      logger.error('INPI parsing error:', error);
      throw error;
    }
  }

  extractFormData($) {
    const formData = {};
    input[type="hidden"].each((i, el) => {
      const name = .attr('name');
      const value = .attr('value');
      if (name && value) {
        formData[name] = value;
      }
    });
    return formData;
  }

  validateResults(results, searchTerm) {
    if (!Array.isArray(results)) {
      return [];
    }
    
    return results
      .filter(result => result.patent_number && result.title)
      .map(result => ({
        patent_number: result.patent_number.trim(),
        title: result.title.trim(),
        holder: result.holder?.trim() || 'N/A',
        filing_date: result.filing_date?.trim() || 'N/A',
        status: result.status?.trim() || 'N/A',
        source: 'INPI',
        search_term: searchTerm,
        extracted_at: new Date().toISOString()
      }));
  }

  getHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'DNT': '1',
      'Connection': 'keep-alive'
    };
  }
}

module.exports = INPICrawler;

