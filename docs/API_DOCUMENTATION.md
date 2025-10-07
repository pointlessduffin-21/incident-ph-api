# Philippine Government Services API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Usage Examples](#usage-examples)
8. [Data Sources](#data-sources)
9. [Caching Strategy](#caching-strategy)
10. [Error Handling](#error-handling)
11. [Performance](#performance)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Overview

A NestJS REST API providing real-time access to Philippine government services data:

- **MMDA Traffic**: Official "MMDA ALERT" advisories sourced from @MMDA on X (Twitter)
- **PAGASA Weather**: Weather forecasts, severe weather alerts, and tropical cyclone updates
- **PHIVOLCS Seismic**: Earthquake monitoring and volcano activity tracking

### Technology Stack

- **Framework**: NestJS 10.3.0 (TypeScript)
- **Data Scraping**: Playwright (for Twitter), Cheerio (for HTML)
- **Traffic Alerts**: Playwright automation against @MMDA (X)
- **Caching**: In-memory cache with configurable TTL
- **HTTP Client**: Axios

---

## Features

### ✅ MMDA Traffic Alerts
- Scrapes the official @MMDA feed for "MMDA ALERT" advisories
- Captures incident summaries, affected roads, and current status notes
- Provides quick filtering by highway keywords within advisory text
- Cached snapshots ensure reliable responses even if X (Twitter) blocks access

### ✅ Weather Information
- PAGASA Twitter feed scraping with Playwright
- Weather forecasts and advisories
- Severe weather warnings
- Tropical cyclone tracking

### ✅ Seismic Monitoring
- Recent earthquake data (24-hour history)
- Latest earthquake details
- Active volcano monitoring
- Magnitude, location, and depth information

### ✅ Performance Optimizations
- Intelligent caching (5-30 minutes TTL)
- Background data refresh
- Graceful error handling with fallback responses
- Request deduplication

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              http://localhost:3000/api               │
└───────────────┬─────────────────┬───────────────────┘
                │                 │
    ┌───────────┴──────┐  ┌──────┴──────────┐
  │   MMDA Module    │  │  PAGASA Module  │  
  │ (Playwright)     │  │  (Playwright)   │  
    └──────────────────┘  └─────────────────┘
                │
         ┌──────┴────────────┐
         │  PHIVOLCS Module  │
         │     (Cheerio)     │
         └───────────────────┘
```

### Module Structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
├── mmda/
│   ├── mmda.module.ts      # MMDA traffic module
│   ├── mmda.controller.ts  # Traffic endpoints
│   └── mmda.service.ts     # MMDA ALERT scraping via Playwright
├── pagasa/
│   ├── pagasa.module.ts    # PAGASA weather module
│   ├── pagasa.controller.ts# Weather endpoints
│   └── pagasa.service.ts   # Playwright Twitter scraping
└── phivolcs/
    ├── phivolcs.module.ts  # PHIVOLCS seismic module
    ├── phivolcs.controller.ts # Earthquake endpoints
    └── phivolcs.service.ts # Web scraping with Cheerio
```

---

## Installation

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **ACLED API Access** (optional for conflict incidents): https://developer.acleddata.com/

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd sms-apis

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Configure environment variables
cp .env.example .env
# Edit .env and add optional ACLED.API credentials if you need incident data

# 5. Start the development server
npm run start:dev

# 6. Verify the server is running
curl http://localhost:3000/api
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000
```json
  "name": "Philippine Government Services API",
  "version": "1.0.0",
  "services": {
    "mmda": {
      "description": "MMDA Traffic Alerts (Twitter)",
      "endpoints": [
        "GET /api/mmda/traffic",
        "GET /api/mmda/highways",
        "GET /api/mmda/segments"
      ]
    },
    "pagasa": {
      "description": "PAGASA Weather Forecast",
      "endpoints": [
        "GET /api/pagasa/forecast",
        "GET /api/pagasa/severe-weather",
        "GET /api/pagasa/tropical-cyclones"
      ]
    },
    "phivolcs": {
      "description": "PHIVOLCS Volcanic and Earthquake Activity",
      "endpoints": [
        "GET /api/phivolcs/earthquakes",
        "GET /api/phivolcs/volcanoes",
        "GET /api/phivolcs/latest-earthquake"
      ]
    }
  }
}
```

---

### 2. MMDA Traffic Endpoints

#### 2.1 Get All Traffic Incidents

**GET /api/mmda/traffic**

Returns official MMDA ALERT advisories scraped from the @MMDA feed on X.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "alerts": [
      {
        "text": "MMDA ALERT: Road crash incident at EDSA Ayala SB involving SUV and motorcycle as of 1:01 PM. One lane occupied. MMDA enforcers are on site managing traffic. #mmda",
        "timestamp": "2025-10-07T05:01:00.000Z",
        "url": "https://x.com/MMDA/status/1234567890",
        "type": "mmda_alert",
        "source": "MMDA Twitter (@MMDA)",
        "lastSeen": "2025-10-07T05:04:15.000Z"
      },
      {
        "text": "MMDA ALERT: Mabuhay Lanes 3 now passable after earlier obstruction. Expect residual traffic in the area as clearing operations wrap up. #mmda",
        "timestamp": "2025-10-07T04:52:00.000Z",
        "url": "https://x.com/MMDA/status/1234567880",
        "type": "mmda_alert",
        "source": "MMDA Twitter (@MMDA)",
        "lastSeen": "2025-10-07T05:04:15.000Z"
      }
    ],
    "source": "MMDA Twitter Official Feed (@MMDA)",
    "lastUpdated": "2025-10-07T05:04:15.000Z",
    "note": "Only tweets starting with \"MMDA ALERT\" are included."
  },
  "timestamp": "2025-10-07T05:04:15.000Z"
}
```

#### 2.2 Get Highways List

**GET /api/mmda/highways**

Returns list of monitored highways with coordinates.

**Response:**
```json
{
  "success": true,
  "data": {
    "highways": [
      {
        "id": "EDSA",
        "name": "EDSA",
        "coordinates": { "lat": 14.5547, "lon": 121.0244 }
      },
      {
        "id": "C5",
        "name": "C5 Road",
        "coordinates": { "lat": 14.5657, "lon": 121.0658 }
      }
      // ... more highways
    ],
    "count": 12,
    "note": "For real-time traffic alerts, check /api/mmda/traffic"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

**Monitored Highways:**
1. EDSA
2. C5 Road
3. Commonwealth Avenue
4. Quezon Avenue
5. España Boulevard
6. Marcos Highway
7. Ortigas Avenue
8. Shaw Boulevard
9. Roxas Boulevard
10. SLEX (South Luzon Expressway)
11. NLEX (North Luzon Expressway)
12. Skyway

#### 2.3 Get Traffic by Highway

**GET /api/mmda/traffic/:highwayId**

Returns MMDA ALERT advisories that mention a specific highway keyword.

**Example:**
```bash
GET /api/mmda/traffic/EDSA
```

**Response:**
```json
{
  "success": true,
  "data": {
    "highway": "EDSA",
    "count": 1,
    "alerts": [
      {
        "text": "MMDA ALERT: Road crash incident at EDSA Ayala SB involving SUV and motorcycle as of 1:01 PM. One lane occupied. MMDA enforcers are on site managing traffic. #mmda",
        "timestamp": "2025-10-07T05:01:00.000Z",
        "url": "https://x.com/MMDA/status/1234567890",
        "type": "mmda_alert",
        "source": "MMDA Twitter (@MMDA)"
      }
    ],
    "lastUpdated": "2025-10-07T05:04:15.000Z",
    "source": "MMDA Twitter Official Feed (@MMDA)"
  },
  "timestamp": "2025-10-07T05:04:15.000Z"
}
```

---

### 3. PAGASA Weather Endpoints

#### 3.1 Get Weather Forecast

**GET /api/pagasa/forecast**

Returns recent weather updates from PAGASA Twitter (@dost_pagasa).

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "updates": [
      {
        "text": "Weather forecast for Metro Manila: Partly cloudy with isolated rain showers in the afternoon...",
        "timestamp": "2025-10-02T08:00:00.000Z",
        "type": "forecast",
        "source": "PAGASA Twitter"
      },
      {
        "text": "Thunderstorm advisory: Expect moderate to heavy rains over Metro Manila within 2 hours...",
        "timestamp": "2025-10-02T10:15:00.000Z",
        "type": "warning",
        "source": "PAGASA Twitter"
      }
    ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

**Tweet Types:**
- `forecast`: General weather forecasts
- `warning`: Weather warnings and alerts
- `tropical_cyclone`: Typhoon/cyclone updates
- `general`: Other weather information

#### 3.2 Get Severe Weather Alerts

**GET /api/pagasa/severe-weather**

Returns filtered severe weather warnings and advisories.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "warnings": [
      {
        "text": "Heavy Rainfall Warning: Red alert for Metro Manila...",
        "timestamp": "2025-10-02T10:00:00.000Z",
        "type": "warning",
        "source": "PAGASA Twitter"
      }
    ],
    "advisories": [
      {
        "text": "Advisory: Monsoon rains expected over Luzon...",
        "timestamp": "2025-10-02T09:30:00.000Z",
        "type": "warning",
        "source": "PAGASA Twitter"
      }
    ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

#### 3.3 Get Tropical Cyclones

**GET /api/pagasa/tropical-cyclones**

Returns updates about tropical cyclones (typhoons).

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 1,
    "updates": [
      {
        "text": "Typhoon 'Pepito' maintains strength, currently at 150 km/h winds...",
        "timestamp": "2025-10-02T06:00:00.000Z",
        "type": "tropical_cyclone",
        "source": "PAGASA Twitter"
      }
    ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

---

### 4. PHIVOLCS Seismic Endpoints

#### 4.1 Get Recent Earthquakes

**GET /api/phivolcs/earthquakes**

Returns earthquakes from the last 24 hours.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 150,
    "earthquakes": [
      {
        "dateTime": "02 October 2025 - 03:26 PM",
        "latitude": "11.01",
        "longitude": "123.98",
        "depth": "032",
        "magnitude": "4.2",
        "location": "004 km S 03° E of City Of Bogo (Cebu)"
      },
      {
        "dateTime": "02 October 2025 - 02:15 PM",
        "latitude": "14.23",
        "longitude": "121.05",
        "depth": "015",
        "magnitude": "3.1",
        "location": "012 km NW of Manila"
      }
    ],
    "source": "PHIVOLCS Earthquake Information",
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

#### 4.2 Get Latest Earthquake

**GET /api/phivolcs/latest-earthquake**

Returns the most recent earthquake.

**Response:**
```json
{
  "success": true,
  "data": {
    "earthquake": {
      "dateTime": "02 October 2025 - 03:26 PM",
      "latitude": "11.01",
      "longitude": "123.98",
      "depth": "032",
      "magnitude": "4.2",
      "location": "004 km S 03° E of City Of Bogo (Cebu)"
    },
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

#### 4.3 Get Active Volcanoes

**GET /api/phivolcs/volcanoes**

Returns monitoring data for active volcanoes.

**Response:**
```json

### 5. ACLED Incident Endpoints

#### 5.1 Get Recent Incidents

**GET /api/acled/incidents?limit=50**

Returns the most recent conflict and incident reports for the Philippines from the ACLED API.

**Query Parameters:**
- `limit` *(optional)*: Number of incidents to return (default `50`, maximum `200`).

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "incidents": [
      {
        "eventDate": "2025-10-05",
        "eventType": "Protests",
        "subEventType": "Peaceful protest",
        "actors": ["Civilian protesters"],
        "admin1": "National Capital Region",
        "location": "Quezon City",
        "coordinates": { "lat": 14.676, "lon": 121.043 },
        "fatalities": 0,
        "notes": "Hundreds gathered peacefully to call for transport policy reforms.",
        "source": "ACLED"
      }
    ],
    "source": "ACLED API",
    "lastUpdated": "2025-10-07T05:04:15.000Z",
    "note": "Most recent incidents for the Philippines as reported by ACLED."
  },
  "timestamp": "2025-10-07T05:04:15.000Z"
}
```

**Authentication:** Set `ACLED_API_EMAIL` and `ACLED_API_KEY` in your `.env` file. Without credentials, the endpoint returns a helpful placeholder response.

---
{
  "success": true,
  "data": {
    "count": 24,
    "volcanoes": [
      {
        "name": "Mayon Volcano",
        "status": "Alert Level 1",
        "location": "Albay",
        "lastActivity": "Low-level unrest"
      },
      {
        "name": "Taal Volcano",
        "status": "Alert Level 1",
        "location": "Batangas",
        "lastActivity": "Background activity"
      }
    ],
    "source": "PHIVOLCS Volcano Monitoring",
    "lastUpdated": "2025-10-02T12:30:00.000Z"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

---

### 5. ACLED Incident Endpoints

#### 5.1 Get Recent Incidents

**GET /api/acled/incidents?limit=50**

Returns the most recent conflict and incident reports for the Philippines from the ACLED API.

**Query Parameters:**
- `limit` *(optional)*: Number of incidents to return (default `50`, maximum `200`).

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "incidents": [
      {
        "eventDate": "2025-10-05",
        "eventType": "Protests",
        "subEventType": "Peaceful protest",
        "actors": ["Civilian protesters"],
        "admin1": "National Capital Region",
        "location": "Quezon City",
        "coordinates": { "lat": 14.676, "lon": 121.043 },
        "fatalities": 0,
        "notes": "Hundreds gathered peacefully to call for transport policy reforms.",
        "source": "ACLED"
      }
    ],
    "source": "ACLED API",
    "lastUpdated": "2025-10-07T05:04:15.000Z",
    "note": "Most recent incidents for the Philippines as reported by ACLED."
  },
  "timestamp": "2025-10-07T05:04:15.000Z"
}
```

**Authentication:** Set `ACLED_API_EMAIL` and `ACLED_API_KEY` in your `.env` file. Without credentials, the endpoint returns a helpful placeholder response.

---

## Usage Examples

### cURL Examples

```bash
# Get all traffic incidents
curl http://localhost:3000/api/mmda/traffic

# Get traffic for EDSA only
curl http://localhost:3000/api/mmda/traffic/EDSA

# Get weather forecast
curl http://localhost:3000/api/pagasa/forecast

# Get severe weather alerts
curl http://localhost:3000/api/pagasa/severe-weather

# Get recent earthquakes
curl http://localhost:3000/api/phivolcs/earthquakes

# Get latest earthquake
curl http://localhost:3000/api/phivolcs/latest-earthquake
```

### JavaScript/TypeScript Examples

```typescript
// Using fetch
const getTraffic = async () => {
  const response = await fetch('http://localhost:3000/api/mmda/traffic');
  const data = await response.json();
  console.log(data.data.alerts);
};

// Using axios
import axios from 'axios';

const getWeather = async () => {
  const { data } = await axios.get('http://localhost:3000/api/pagasa/forecast');
  return data.data.updates;
};
```

### Python Example

```python
import requests

# Get traffic data
response = requests.get('http://localhost:3000/api/mmda/traffic')
traffic = response.json()

for alert in traffic['data']['alerts']:
    print(f"{alert['location']}: {alert['description']}")
    print(f"Severity: {alert['severity']}, Delay: {alert['delay']}s")
```

---

## Data Sources

### MMDA Traffic
- **Source**: Official MMDA Twitter (@MMDA)
- **Method**: Playwright browser automation with "MMDA ALERT" filtering
- **Update Frequency**: 10-minute cache
- **Data Type**: Official traffic advisories and incident highlights

### PAGASA Weather
- **Source**: PAGASA Twitter (@dost_pagasa)
- **Method**: Playwright browser automation
- **Update Frequency**: 30-minute cache
- **Data Type**: Weather forecasts, warnings, typhoon updates

### PHIVOLCS Seismic
- **Source**: PHIVOLCS official website
- **Method**: Web scraping with Cheerio
- **Update Frequency**: 5-minute cache
- **Data Type**: Earthquakes (24h), volcano monitoring

### ACLED Incidents
- **Source**: ACLED API (https://api.acleddata.com/)
- **Method**: Authenticated HTTP requests (email + key)
- **Update Frequency**: 15-minute cache
- **Data Type**: Conflict, protest, and political violence reports for the Philippines

---

## Caching Strategy

| Endpoint | Cache Duration | Reasoning |
|----------|---------------|-----------|
| `/api/mmda/traffic` | 10 minutes | Reduce scraping load and respect X (Twitter) limits |
| `/api/mmda/highways` | 10 minutes | Static data |
| `/api/mmda/segments` | 10 minutes | Static data |
| `/api/pagasa/forecast` | 30 minutes | Weather changes gradually |
| `/api/pagasa/severe-weather` | 10 minutes | Urgent updates |
| `/api/pagasa/tropical-cyclones` | 10 minutes | Important safety info |
| `/api/phivolcs/earthquakes` | 5 minutes | Recent seismic activity |
| `/api/phivolcs/latest-earthquake` | 5 minutes | Most current data |
| `/api/phivolcs/volcanoes` | 10 minutes | Volcano status |
| `/api/acled/incidents` | 15 minutes | Minimize ACLED API usage and provide stable snapshots |

### Cache Benefits
- **Reduced upstream load**: Scrapes fewer Twitter pages and ACLED pages per hour
- **Better performance**: Sub-millisecond cached responses
- **Rate limit protection**: Helps avoid X (Twitter) blocks and ACLED quotas
- **Improved reliability**: Serves cached data during upstream failures

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Service temporarily unavailable",
    "code": "SERVICE_UNAVAILABLE",
    "details": "Unable to connect to upstream service"
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `MISSING_ACLED_CREDENTIALS` | 400 | ACLED email or API key not configured |
| `UPSTREAM_RATE_LIMIT` | 429 | External provider rate-limited the request (X or ACLED) |
| `SERVICE_UNAVAILABLE` | 503 | Upstream service unreachable |
| `INVALID_PARAMETER` | 400 | Invalid request parameter |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Fallback Responses

When data sources are unavailable, the API returns informative fallback messages:

```json
{
  "success": true,
  "data": {
    "count": 0,
    "alerts": [],
    "note": "MMDA traffic alerts temporarily unavailable. Please check https://x.com/mmda for real-time updates.",
    "error": "Unable to scrape @MMDA feed"
  }
}
```

---

## Performance

### Response Times (Typical)

| Scenario | Response Time |
|----------|--------------|
| Cached response | < 5ms |
| Fresh MMDA traffic | 200-400ms |
| Fresh PAGASA (Playwright) | 2-4 seconds |
| Fresh PHIVOLCS earthquakes | 300-600ms |

### Optimization Tips

1. **Use caching aggressively** - Most clients don't need real-time updates
2. **Request specific highways** - Use `/api/mmda/traffic/EDSA` instead of `/api/mmda/traffic`
3. **Implement client-side caching** - Cache responses in your application
4. **Use webhooks** (future feature) - Get notified of important updates

### Resource Usage

- **Memory**: ~200MB base + ~150MB per Playwright browser instance
- **CPU**: Low (< 5%) when serving cached responses
- **Network**: ~10KB per MMDA request, ~500KB per PAGASA request

---

## Deployment

### Development

```bash
npm run start:dev
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name sms-apis
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Playwright to use system chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```bash
# Build and run
docker build -t sms-apis .
docker run -p 3000:3000 --env-file .env sms-apis
```

### Environment-Specific Configuration

```bash
# Development
NODE_ENV=development
PORT=3000
ACLED_API_EMAIL=dev@example.com
ACLED_API_KEY=dev_key

# Production
NODE_ENV=production
PORT=80
ACLED_API_EMAIL=prod@example.com
ACLED_API_KEY=prod_key
```

---

## Troubleshooting

### Issue: "MMDA traffic alerts temporarily unavailable"

**Symptoms:**
```json
{
  "count": 0,
  "alerts": [],
  "note": "MMDA traffic alerts temporarily unavailable. Please check https://x.com/mmda for real-time updates.",
  "error": "Unable to scrape @MMDA feed"
}
```

**Solution:**
1. Confirm Playwright browsers are installed: `npx playwright install chromium`
2. Verify the server can reach the @MMDA feed: `curl https://x.com/mmda`
3. Restart the server after resolving network or scraping issues

---

### Issue: PAGASA returns no tweets

**Symptoms:**
```json
{
  "count": 1,
  "updates": [{
    "text": "No current PAGASA updates found...",
    "type": "info"
  }]
}
```

**Possible Causes:**
1. Twitter blocking Playwright
2. Network connectivity issues
3. PAGASA Twitter account unavailable

**Solutions:**
- Wait 5-10 minutes and retry (respects cache)
- Check Twitter accessibility: `curl https://x.com/dost_pagasa`
- Verify Playwright installation: `npx playwright install chromium`

---

### Issue: Playwright browser not found

**Error:**
```
browserType.launch: Executable doesn't exist at /path/to/chromium
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install chromium

# Verify installation
npx playwright --version
```

---

### Issue: Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

---

### Issue: High memory usage

**Symptoms:**
- Server using > 500MB RAM
- Slow responses

**Solutions:**
1. **Reduce Playwright cache duration** - More aggressive caching
2. **Implement browser pooling** - Reuse browser instances
3. **Use headless shell** - Lighter than full Chromium

```typescript
// In pagasa.service.ts
const browser = await chromium.launch({ 
  headless: true,
  args: ['--disable-dev-shm-usage'] // Use less shared memory
});
```

---

### Issue: ACLED incidents not available

**Error:**
```json
{
  "count": 0,
  "incidents": [],
  "note": "Configure ACLED_API_EMAIL and ACLED_API_KEY to enable ACLED incident retrieval.",
  "source": "ACLED API"
}
```

**Solutions:**
1. Set `ACLED_API_EMAIL` and `ACLED_API_KEY` in `.env`
2. Confirm the credentials work via curl:
   ```bash
   curl "https://api.acleddata.com/acled/read?email=<email>&key=<key>&country=Philippines&limit=1"
   ```
3. Restart the server after updating the environment variables

---

## API Limits & Costs

### ACLED API Access
- **Requirement**: Approved email + API key from ACLED data portal
- **Rate Limits**: Subject to ACLED usage policy (check latest terms)
- **Best Practice**: Cache responses for ≥15 minutes to reduce calls
- **Overage**: Additional volume requires direct agreement with ACLED

### MMDA Twitter Feed
- **Source**: `https://twitter.com/MMDA`
- **Limitations**: Scraping constrained by Twitter rate-limits and markup changes
- **Best Practice**: Keep cache at 10+ minutes; monitor for DOM changes
- **Fallback**: Service returns cached alerts or advisory message if scraping fails

### Playwright
- **Cost**: Free (open-source)
- **Limitations**: CPU/memory intensive
- **Best Practice**: Use aggressive caching (30+ min)

---

## Future Roadmap

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

### Phase 3 (Q2 2026)
- [ ] Traffic heat maps
- [ ] Route optimization
- [ ] User-submitted incident reports
- [ ] Integration with Waze data

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Credits & Attribution

- **MMDA**: Traffic alerts sourced from the official MMDA Twitter account (© Metropolitan Manila Development Authority)
- **ACLED**: Armed Conflict Location & Event Data Project (usage subject to ACLED terms)
- **Playwright**: MIT License (Microsoft)
- **PAGASA**: Public weather data from Philippine Atmospheric, Geophysical and Astronomical Services Administration
- **PHIVOLCS**: Public seismic data from Philippine Institute of Volcanology and Seismology

---

## Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Email**: support@example.com
- **Documentation**: This file!

---

**Last Updated**: October 7, 2025  
**Version**: 2.1.0 (MMDA Twitter + ACLED Integration)  
**Maintained by**: Your Team
