# Implementation Notes - Playwright Social Scrapers

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

### 2. MMDA Twitter/X Scraper for Traffic Alerts ✅

**What Changed:**
- Leaned fully into Playwright scraping of the official MMDA Twitter/X feed
- Filters for tweets starting with `MMDA ALERT` to capture actionable advisories
- Normalizes tweet metadata so API consumers receive consistent fields

**Implementation:**
```typescript
// src/mmda/mmda.service.ts
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(this.mmdaTwitterUrl, { waitUntil: 'networkidle' });

const alerts = await page.evaluate(() => {
  return [...document.querySelectorAll('article[data-testid="tweet"]')]
    .slice(0, 30)
    .map(...)
});
```

**Captured Fields:**
- `text` — raw tweet content (normalized whitespace)
- `timestamp` — tweet timestamp via `<time>` element
- `url` — canonical link to the tweet
- `source` — fixed to `MMDA Twitter (@MMDA)`
- `type` — currently `mmda_alert` for filtering downstream

**Benefits:**
- Directly mirrors official MMDA public advisories
- Zero third-party API dependencies or keys
- Works even when traffic APIs are unavailable

**Trade-offs:**
- Twitter/X layout or anti-bot changes may require selector updates
- Alerts are limited to information included in tweet text
- Requires Playwright Chromium runtime on the host

---

## Setup Instructions

### Prerequisites

1. **Install Dependencies:**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Configure Environment (optional):**
   ```bash
   cp env.example .env
   # Edit .env to override defaults like PORT or MMDA_TWITTER_URL
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

### MMDA Traffic Alerts (Twitter/X)

**GET /api/mmda/traffic**
Returns the latest `MMDA ALERT` tweets with normalized metadata. Primary scraping uses the Twitter/X proxy defined by `TWITTER_PROXY_BASE` (default: https://r.jina.ai/https://x.com) to avoid headless browser blocks.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "alerts": [
      {
        "text": "MMDA ALERT: Heavy traffic along EDSA SB from Cubao to Ortigas.",
        "timestamp": "2025-10-02T12:00:00.000Z",
        "url": "https://x.com/mmda/status/1234567890",
        "type": "mmda_alert",
        "source": "MMDA Twitter (@MMDA)"
      }
    ],
    "source": "MMDA Twitter Official Feed (@MMDA)",
    "lastUpdated": "2025-10-02T12:05:11.000Z"
  }
}
```

**GET /api/mmda/highways**
Lists monitored highways and coordinates (used for keyword filtering).

**GET /api/mmda/traffic/:highwayId**
Filters alerts by keyword match on the highway name (e.g., `/api/mmda/traffic/EDSA`).

---

### PAGASA Weather (Playwright + Proxy)

**GET /api/pagasa/forecast**
Returns recent tweets from @dost_pagasa. Attempts Playwright scraping first, then falls back to the configurable proxy feed when headless access is blocked.

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
| MMDA Traffic | 10 minutes | Reduces Twitter scraping frequency |
| MMDA Highways | 10 minutes | Static data, rarely changes |
| PAGASA Forecast | 30 minutes | Weather updates not too frequent |
| PAGASA Severe Weather | 10 minutes | More frequent checks for emergencies |
| PHIVOLCS Earthquakes | 5 minutes | Seismic data needs to be current |

---

## Troubleshooting

### Issue: "Traffic data temporarily unavailable"
**Cause:** Twitter/X page structure changed or Playwright prerequisites missing
**Solution:** 
```bash
npx playwright install chromium
curl -I https://x.com/mmda
# If blocked, consider rotating IP or enabling headless login cookies.
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

### Twitter/X Scraping
- **Limit:** Subject to public rate limiting; keep requests < 6/hour per feed via caching
- **Mitigation:** Cache responses for 10 minutes; add randomized delays if scaling horizontally
- **Risk:** Unexpected HTML changes may require quick patches

### Playwright
- **Cost:** Free and open-source
- **Resource Usage:** ~150 MB RAM per browser instance
- **Recommendation:** Use caching aggressively (30-minute cache for weather, 10 minutes for MMDA)

---

## Future Improvements

### Short Term
1. Add retry logic for failed API calls
2. Add selector change detection + alerting for Twitter layout updates
3. Add monitoring/alerting for scraping rate limits
4. Better error messages in responses

### Medium Term
1. Support for additional social sources (e.g., Facebook posts) as fallbacks
2. Traffic predictions using historical data
3. WebSocket for real-time traffic updates
4. Mobile app endpoints

### Long Term
1. Machine learning for traffic prediction
2. Integration with Waze community data
3. Custom traffic incident reporting
4. Traffic heat maps and visualizations

---

## Alternative Data Sources (if Twitter/X fails)

### For Traffic Data:
1. **HERE Traffic API** - https://developer.here.com/
   - Paid plans offer structured incident feeds
   - Consider for enterprise deployments

2. **Google Maps Traffic** - https://developers.google.com/maps/documentation/roads/traffic
   - Requires API key + billing
   - Provides speed and congestion insights

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

- **Playwright:** MIT License (Microsoft)
- **Twitter/X:** Public content per platform terms
- **PAGASA:** Public weather information from Philippines DOST
- **PHIVOLCS:** Public seismic data from Philippines DOST

---

## Support

For issues or questions:
1. Check this document first
2. Review logs: `npm run start:dev`
3. Test endpoints with curl or Postman
4. Inspect scraper logs for selector or navigation errors

---

**Last Updated:** November 1, 2025
**Version:** 2.1.0 (Playwright Twitter Integration)
