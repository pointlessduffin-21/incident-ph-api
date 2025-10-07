# Implementation Notes - Playwright & TomTom Traffic API

## Recent Changes (October 2, 2025)

### 1. Playwright Integration for PAGASA Twitter Scraping ✅

**What Changed:**
- Upgraded from simple HTTP scraping to Playwright browser automation
- PAGASA service now uses headless Chrome to render JavaScript and scrape Twitter

**Implementation:**
```typescript
// src/pagasa/pagasa.service.ts
import { chromium } from 'playwright';

// Now launches actual browser to scrape @dost_pagasa tweets
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://x.com/dost_pagasa');
```

**Benefits:**
- Handles JavaScript-rendered content
- Can scrape actual Twitter timeline
- More reliable than static HTML parsing

**Drawbacks:**
- Slower (browser launch overhead ~2-3 seconds)
- More resource intensive
- Twitter may still block if detected

---

### 2. TomTom Traffic API for MMDA Traffic Data ✅

**What Changed:**
- Replaced Twitter scraping with real-time traffic data from TomTom
- Now provides actual traffic incidents, delays, and road conditions

**Implementation:**
```typescript
// src/mmda/mmda.service.ts
private readonly tomtomApiKey: string;
private readonly tomtomBaseUrl = 'https://api.tomtom.com/traffic/services/4';

// Fetches traffic incidents for 12 major Metro Manila highways
await this.getTrafficIncidents(lat, lon, highwayName);
```

**Covered Highways:**
- EDSA
- C5 Road  
- Commonwealth Avenue
- Quezon Avenue
- España Boulevard
- Marcos Highway
- Ortigas Avenue
- Shaw Boulevard
- Roxas Boulevard
- SLEX (South Luzon Expressway)
- NLEX (North Luzon Expressway)
- Skyway

**Benefits:**
- Real-time traffic incident data
- Accurate delay information
- Severity levels (critical, major, moderate, minor, low)
- Incident types (traffic jam, accident, road work, etc.)
- Free tier: 2,500 requests/day

---

## Setup Instructions

### Prerequisites

1. **Install Dependencies:**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Get TomTom API Key:**
   - Visit: https://developer.tomtom.com/
   - Sign up for free account
   - Create an API key (Traffic API)
   - Free tier: 2,500 requests/day

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your TOMTOM_API_KEY
   ```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## API Endpoints

### MMDA Traffic (TomTom-powered)

**GET /api/mmda/traffic**
Returns traffic incidents for all major Metro Manila highways

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "alerts": [
      {
        "text": "EDSA: Traffic congestion - Quezon Avenue to Shaw Boulevard",
        "location": "EDSA",
        "description": "Traffic congestion",
        "from": "Quezon Avenue",
        "to": "Shaw Boulevard",
        "severity": "major",
        "delay": 300,
        "length": 2500,
        "type": "TRAFFIC_JAM",
        "timestamp": "2025-10-02T12:00:00.000Z",
        "source": "TomTom Traffic API"
      }
    ],
    "source": "TomTom Traffic API (Metro Manila)",
    "lastUpdated": "2025-10-02T12:00:00.000Z"
  }
}
```

**GET /api/mmda/highways**
Lists all monitored highways with coordinates

**GET /api/mmda/traffic/:highwayId**
Filter traffic by specific highway (e.g., `/api/mmda/traffic/EDSA`)

---

### PAGASA Weather (Playwright-powered)

**GET /api/pagasa/forecast**
Returns recent tweets from @dost_pagasa

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "updates": [
      {
        "text": "Weather forecast for Metro Manila: Partly cloudy...",
        "timestamp": "2025-10-02T08:00:00.000Z",
        "type": "forecast",
        "source": "PAGASA Twitter"
      }
    ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2025-10-02T12:00:00.000Z"
  }
}
```

**GET /api/pagasa/severe-weather**
Filters tweets for warnings and advisories

**GET /api/pagasa/tropical-cyclones**
Filters tweets about typhoons and tropical cyclones

---

### PHIVOLCS Earthquakes (unchanged)

**GET /api/phivolcs/earthquakes**
Returns recent earthquakes (last 24 hours)

**GET /api/phivolcs/latest-earthquake**
Returns the most recent earthquake

**GET /api/phivolcs/volcanoes**
Returns active volcano monitoring data

---

## Performance & Caching

| Endpoint | Cache Duration | Notes |
|----------|---------------|-------|
| MMDA Traffic | 5 minutes | Balance between freshness and API limits |
| MMDA Highways | 10 minutes | Static data, rarely changes |
| PAGASA Forecast | 30 minutes | Weather updates not too frequent |
| PAGASA Severe Weather | 10 minutes | More frequent checks for emergencies |
| PHIVOLCS Earthquakes | 5 minutes | Seismic data needs to be current |

---

## Troubleshooting

### Issue: "Traffic data temporarily unavailable"
**Cause:** Missing or invalid TomTom API key
**Solution:** 
```bash
# Check .env file
cat .env | grep TOMTOM_API_KEY

# Should see:
TOMTOM_API_KEY=your_actual_api_key_here
```

### Issue: PAGASA returns no tweets
**Possible Causes:**
1. Twitter blocking Playwright (rare)
2. Twitter rate limiting
3. Network issues

**Solutions:**
- Wait a few minutes and retry
- Check if Twitter is accessible: `curl https://x.com/dost_pagasa`
- Increase cache duration to reduce requests

### Issue: Playwright browser not found
**Solution:**
```bash
npx playwright install chromium
```

---

## Cost Analysis

### TomTom Traffic API (Free Tier)
- **Limit:** 2,500 requests/day
- **With 5-min cache:** ~12 requests/hour = 288 requests/day
- **Headroom:** Can handle ~8.7x more traffic
- **Cost if exceeded:** $0.50 per 1,000 extra requests

### Playwright
- **Cost:** Free and open-source
- **Resource Usage:** ~150MB RAM per browser instance
- **Recommendation:** Use caching aggressively (30-min cache)

---

## Future Improvements

### Short Term
1. Add retry logic for failed API calls
2. Implement request queuing for TomTom API
3. Add monitoring/alerting for API rate limits
4. Better error messages in responses

### Medium Term
1. Support for more traffic APIs (HERE, Google Maps)
2. Traffic predictions using historical data
3. WebSocket for real-time traffic updates
4. Mobile app endpoints

### Long Term
1. Machine learning for traffic prediction
2. Integration with Waze community data
3. Custom traffic incident reporting
4. Traffic heat maps and visualizations

---

## Alternative APIs (if TomTom doesn't work)

### For Traffic Data:
1. **HERE Traffic API** - https://developer.here.com/
   - Free tier: 250,000 transactions/month
   - More generous than TomTom

2. **Google Maps Traffic** - https://developers.google.com/maps/documentation/roads/traffic
   - Requires API key + billing
   - $5-7 per 1,000 requests

3. **OpenTrafficCam** - Open-source alternative
   - Self-hosted, no API limits
   - Requires camera data sources

### For Weather:
1. **OpenWeatherMap** - https://openweathermap.org/api
   - Free tier: 60 calls/minute
   - Historical + forecast data

2. **WeatherAPI.com** - https://www.weatherapi.com/
   - Free tier: 1M calls/month
   - Philippines coverage

---

## License & Attribution

- **TomTom:** Traffic data © TomTom International B.V.
- **Playwright:** MIT License
- **PAGASA:** Public weather information from Philippines DOST
- **PHIVOLCS:** Public seismic data from Philippines DOST

---

## Support

For issues or questions:
1. Check this document first
2. Review logs: `npm run start:dev`
3. Test endpoints with curl or Postman
4. Check API key validity

---

**Last Updated:** October 2, 2025
**Version:** 2.0.0 (Playwright + TomTom Integration)
