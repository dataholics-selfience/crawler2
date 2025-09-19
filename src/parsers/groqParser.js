const Groq = require('groq-sdk');
const logger = require('../utils/logger');

class GroqParser {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = 'llama-3.1-70b-versatile';
  }

  async parseHTML(html, prompt, options = {}) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert HTML parser. Return only valid JSON."
          },
          {
            role: "user", 
            content: ${prompt}\n\nHTML: \n\nReturn only valid JSON, no additional text.
          }
        ],
        model: this.model,
        temperature: 0.1,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      const cleanedResponse = this.cleanJSONResponse(response);
      return JSON.parse(cleanedResponse);
      
    } catch (error) {
      logger.error('Groq parsing error:', error);
      throw error;
    }
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/`json\s*/g, '').replace(/`\s*/g, '');
    
    const jsonStart = Math.min(
      cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity,
      cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity
    );
    
    if (jsonStart !== Infinity) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    const jsonEnd = Math.max(
      cleaned.lastIndexOf('}'),
      cleaned.lastIndexOf(']')
    );
    
    if (jsonEnd !== -1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    return cleaned.trim();
  }
}

const groqParser = new GroqParser();

async function parseWithGroq(prompt, html = null, options = {}) {
  if (html) {
    return await groqParser.parseHTML(html, prompt, options);
  } else {
    return await groqParser.parseHTML('', prompt, options);
  }
}

module.exports = {
  GroqParser,
  groqParser,
  parseWithGroq
};
