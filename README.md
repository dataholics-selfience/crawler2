# Generic Crawler Platform

A platform for intelligent web crawling and data extraction, starting with INPI patent searches.

## Features

- 🏥 INPI Patent Search
- 🤖 AI-powered HTML parsing with Groq
- 🔄 Multiple crawling strategies
- 📊 RESTful API
- 🚀 Deployed on Railway

## API Endpoints

### Health Check
```
GET /health
```

### Search INPI Patents
```
GET /api/data/inpi/patents?medicine=paracetamol
```

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

```
GROQ_API_KEY=your_groq_key
DATABASE_URL=postgres://...
```
