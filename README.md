# Philippine Government Services API 🇵🇭

A comprehensive NestJS-based REST API providing real-time access to Philippine government services data including traffic, weather, and seismic information.

[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🚀 Features

- **MMDA Traffic Information**: Real-time traffic incidents powered by TomTom Traffic API (12 major highways)
- **PAGASA Weather Forecasts**: Live updates from PAGASA Twitter using Playwright browser automation
- **PHIVOLCS Data**: Earthquake and volcanic activity monitoring via web scraping
- Built-in intelligent caching (5-30 min TTL)
- Robust error handling and rate limiting
- RESTful API design
- Full TypeScript support

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sms-apis
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers (required for PAGASA weather scraping):
```bash
npx playwright install chromium
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`:
```env
# TomTom Traffic API Key (Required for MMDA traffic)
# Get free key at: https://developer.tomtom.com/
TOMTOM_API_KEY=your_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Getting TomTom API Key:**
1. Visit https://developer.tomtom.com/
2. Sign up for a free account
3. Create API key for Traffic API (Free Tier: 2,500 requests/day)
4. Add key to `.env` file

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Complete API Documentation](docs/API_DOCUMENTATION.md)** - Full API reference (70+ pages)
- **[Implementation Notes](docs/IMPLEMENTATION_NOTES.md)** - Technical implementation details
- **[Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Navigation hub for all documentation

### Base URL
```
http://localhost:3000/api
```

### Quick API Reference

### MMDA Traffic Endpoints

#### Get All Traffic Data
```http
GET /api/mmda/traffic
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2025-10-02T00:00:00.000Z"
}
```

#### Get Highways
```http
GET /api/mmda/highways
```

#### Get Segments
```http
GET /api/mmda/segments
```

#### Get Traffic by Highway
```http
GET /api/mmda/traffic/:highwayId
```

**Example:**
```http
GET /api/mmda/traffic/edsa
```

---

### PAGASA Weather Endpoints

#### Get Weather Forecast
```http
GET /api/pagasa/forecast
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synopticSituation": "...",
    "generalForecast": "...",
    "regionalForecasts": [...],
    "warnings": [...],
    "lastUpdated": "2025-10-02T00:00:00.000Z"
  },
  "timestamp": "2025-10-02T00:00:00.000Z"
}
```

#### Get Severe Weather Information
```http
GET /api/pagasa/severe-weather
```

#### Get Tropical Cyclones
```http
GET /api/pagasa/tropical-cyclones
```

---

### PHIVOLCS Endpoints

#### Get All Earthquakes
```http
GET /api/phivolcs/earthquakes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "earthquakes": [
      {
        "dateTime": "2025-10-02 12:00:00",
        "latitude": "14.5995",
        "longitude": "120.9842",
        "depth": "10 km",
        "magnitude": "4.5",
        "location": "Manila"
      }
    ],
    "lastUpdated": "2025-10-02T00:00:00.000Z"
  },
  "timestamp": "2025-10-02T00:00:00.000Z"
}
```

#### Get Latest Earthquake
```http
GET /api/phivolcs/latest-earthquake
```

#### Get All Volcanoes
```http
GET /api/phivolcs/volcanoes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "volcanoes": [
      {
        "name": "Mayon Volcano",
        "location": "Albay",
        "alertLevel": "Alert Level 0",
        "status": "Normal",
        "lastUpdate": "2025-10-02T00:00:00.000Z"
      }
    ],
    "lastUpdated": "2025-10-02T00:00:00.000Z"
  },
  "timestamp": "2025-10-02T00:00:00.000Z"
}
```

#### Get Volcano by Name
```http
GET /api/phivolcs/volcanoes/:name
```

**Example:**
```http
GET /api/phivolcs/volcanoes/mayon
```

---

## 🏗️ Project Structure

```
sms-apis/
├── src/                        # Source code
│   ├── mmda/                   # MMDA traffic module (TomTom-powered)
│   │   ├── mmda.controller.ts
│   │   ├── mmda.service.ts
│   │   └── mmda.module.ts
│   ├── pagasa/                 # PAGASA weather module (Playwright-powered)
│   │   ├── pagasa.controller.ts
│   │   ├── pagasa.service.ts
│   │   └── pagasa.module.ts
│   ├── phivolcs/              # PHIVOLCS seismic module
│   │   ├── phivolcs.controller.ts
│   │   ├── phivolcs.service.ts
│   │   └── phivolcs.module.ts
│   ├── app.controller.ts       # Root controller
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── docs/                       # Documentation
│   ├── API_DOCUMENTATION.md    # Complete API reference (70+ pages)
│   ├── QUICKSTART.md          # 5-minute setup guide
│   ├── IMPLEMENTATION_NOTES.md # Technical details
│   └── DOCUMENTATION_INDEX.md  # Documentation hub
├── .env                        # Environment configuration
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── nest-cli.json              # NestJS config
└── README.md                  # This file
```

## 🔍 How It Works

### Data Sources & Implementation

#### 1. MMDA Traffic Information
- **Method**: TomTom Traffic API Integration
- **Source**: TomTom Traffic API (professional traffic data provider)
- **Coverage**: 12 major Metro Manila highways (EDSA, C5, Commonwealth, etc.)
- **Update Frequency**: 5 minutes cache
- **Reliability**: ⭐⭐⭐⭐⭐ (Enterprise-grade API)
- **Free Tier**: 2,500 requests/day
- **Actual Usage**: ~288 requests/day (with caching)

#### 2. PAGASA Weather Forecast
- **Method**: Playwright Browser Automation
- **Source**: PAGASA Twitter (@dost_pagasa)
- **Technology**: Headless Chromium browser
- **Update Frequency**: 30 minutes cache for forecasts, 10 minutes for severe weather
- **Reliability**: ⭐⭐⭐⭐ (Official PAGASA Twitter, requires browser automation)
- **Note**: Scrapes live tweets from official PAGASA Twitter account

#### 3. PHIVOLCS Earthquake & Volcanic Activity
- **Method**: Web Scraping (Cheerio)
- **Source**: PHIVOLCS Official Website
- **Update Frequency**: 5 minutes cache for earthquakes, 10 minutes for volcanoes
- **Reliability**: ⭐⭐⭐ (Dependent on website structure)
- **Note**: May require updates if PHIVOLCS changes their website structure

### Caching Strategy

All endpoints implement intelligent caching:

| Endpoint | Cache Duration | Reason |
|----------|---------------|--------|
| MMDA Traffic | 5 minutes | Balance freshness & API rate limits |
| PAGASA Forecast | 30 minutes | Weather changes gradually |
| PAGASA Severe Weather | 10 minutes | More urgent updates needed |
| PHIVOLCS Earthquakes | 5 minutes | Recent seismic activity |
| PHIVOLCS Volcanoes | 10 minutes | Slower changing data |

**Benefits:**
- Reduced load on source systems
- Improved response times (< 5ms for cached)
- Respects API rate limits
- Better user experience

## 💰 API Costs & Usage

### TomTom Traffic API
- **Free Tier**: 2,500 requests/day
- **Actual Usage**: ~288 requests/day (with 5-min caching)
- **Headroom**: 8.7x capacity available
- **Overage Cost**: $0.50 per 1,000 requests (if exceeded)
- **Monthly Cost**: $0 (well within free tier)

### Playwright Browser Automation
- **Cost**: FREE (open-source)
- **Resource Usage**: ~150MB RAM per browser instance
- **One-time Setup**: `npx playwright install chromium`

### Total Monthly Cost: **$0.00** ✅

## 🌟 Monitored Highways

**MMDA Traffic covers 12 major Metro Manila highways:**

1. **EDSA** - Epifanio de los Santos Avenue
2. **C5 Road** - Circumferential Road 5
3. **Commonwealth Avenue**
4. **Quezon Avenue**
5. **España Boulevard**
6. **Marcos Highway**
7. **Ortigas Avenue**
8. **Shaw Boulevard**
9. **Roxas Boulevard**
10. **SLEX** - South Luzon Expressway
11. **NLEX** - North Luzon Expressway
12. **Skyway** - Metro Manila Skyway

Each highway monitored with ~2km radius for comprehensive coverage.

## ⚠️ Important Notes

### Why This Approach?

Philippine government agencies have limited public APIs. This project addresses the gap through:
1. **Enterprise Traffic API** (TomTom) - Professional-grade traffic data
2. **Browser Automation** (Playwright) - Access JavaScript-rendered Twitter content
3. **Web Scraping** (Cheerio) - Extract data from public websites

### Trade-offs

**Advantages:**
- ✅ Reliable, enterprise-grade traffic data (TomTom)
- ✅ Real-time weather updates from official source (PAGASA Twitter)
- ✅ Built-in caching and error handling
- ✅ Free for typical usage
- ✅ Easy to maintain and update

**Considerations:**
- ⚠️ TomTom API key required (free tier available)
- ⚠️ Playwright requires browser installation (~150MB)
- ⚠️ Twitter structure changes may require updates
- ⚠️ PHIVOLCS scraping depends on website structure

## 🔒 Legal & Ethical Considerations

- This project scrapes publicly available data
- Always respect `robots.txt` and terms of service
- Implement reasonable request intervals
- Cache aggressively to minimize load
- Consider reaching out to agencies for official API access

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Troubleshooting

### Common Issues

**1. "Traffic data temporarily unavailable"**
```bash
# Check TomTom API key is configured
cat .env | grep TOMTOM_API_KEY

# If missing, add to .env:
TOMTOM_API_KEY=your_api_key_here
```

**2. "Playwright browser not found"**
```bash
# Install Chromium browser
npx playwright install chromium
```

**3. "Port 3000 already in use"**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Start server
npm run start:dev
```

**4. "Weather data unavailable"**
- Twitter/X may be blocking requests
- Check internet connection
- Try clearing cache: restart server

**5. "Module not found" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npx playwright install chromium
```

### Getting Help

- **Documentation**: See `docs/` folder for detailed guides
- **Issues**: Check console logs for specific errors
- **API Reference**: See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Quick Fixes**: See [QUICKSTART.md](docs/QUICKSTART.md)

## � Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install Playwright dependencies
RUN apk add --no-cache chromium

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```bash
docker build -t sms-apis .
docker run -p 3000:3000 --env-file .env sms-apis
```

### PM2 (Process Manager)

```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name sms-apis
pm2 save
```

For detailed deployment instructions, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md#deployment).

## 🔮 Future Enhancements

### Phase 1 (Q4 2025)
- [ ] WebSocket support for real-time updates
- [ ] Historical traffic data storage
- [ ] Advanced filtering and search
- [ ] Rate limiting per client

### Phase 2 (Q1 2026)
- [ ] Machine learning traffic predictions
- [ ] Mobile app SDK
- [ ] GraphQL API
- [ ] Multilingual support (Tagalog, English)

## 📧 Support & Resources

- **Quick Start**: [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **API Reference**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Technical Details**: [docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md)
- **Documentation Hub**: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- **Issues**: Open an issue on GitHub

## 🙏 Credits & Attribution

- **TomTom**: Traffic data © TomTom International B.V.
- **Playwright**: MIT License (Microsoft)
- **PAGASA**: Philippine Atmospheric, Geophysical and Astronomical Services Administration
- **PHIVOLCS**: Philippine Institute of Volcanology and Seismology
- **NestJS**: Progressive Node.js framework

---

## ⚡ Quick Test

Test all services with these commands:

```bash
# Start server
npm run start:dev

# Test MMDA Traffic
curl http://localhost:3000/api/mmda/traffic

# Test PAGASA Weather
curl http://localhost:3000/api/pagasa/forecast

# Test PHIVOLCS Earthquakes
curl http://localhost:3000/api/phivolcs/earthquakes
```

---

**Note**: This project uses TomTom Traffic API for MMDA traffic data and scrapes public sources for PAGASA/PHIVOLCS data. For official information, visit:
- MMDA: https://mmda.gov.ph
- PAGASA: https://www.pagasa.dost.gov.ph
- PHIVOLCS: https://www.phivolcs.dost.gov.ph

**Built with ❤️ for the Philippines**

**Version:** 2.0.0 (Playwright + TomTom Integration)  
**Last Updated:** October 2, 2025



