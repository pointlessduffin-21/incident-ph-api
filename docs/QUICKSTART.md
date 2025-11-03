# Quick Start Guide - Philippine Government Services API

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
npx playwright install chromium
```

### Step 2: Review Environment Variables
Copy `env.example` and adjust if you need to override defaults (e.g., custom ports or alternate Twitter URLs):
```bash
cp env.example .env
```
Key optional overrides:
- `MMDA_TWITTER_URL`, `PAGASA_TWITTER_URL` – change if the official handles move
- `TWITTER_PROXY_BASE` – proxy endpoint for unauthenticated Twitter access (defaults to https://r.jina.ai/https://x.com)

### Step 3: Start the Server
```bash
npm run start:dev
```

### Step 4: Test the API
```bash
# Test root endpoint
curl http://localhost:3000/api

# Get real-time Metro Manila traffic
curl http://localhost:3000/api/mmda/traffic

# Get PAGASA weather updates
curl http://localhost:3000/api/pagasa/forecast

# Get recent earthquakes
curl http://localhost:3000/api/phivolcs/earthquakes
```

---

## 📊 Available Endpoints

### MMDA Traffic Alerts (Twitter/X)
- `GET /api/mmda/traffic` - All traffic incidents
- `GET /api/mmda/highways` - List of highways
- `GET /api/mmda/traffic/:highwayId` - Traffic by highway (e.g., EDSA, C5)

### PAGASA Weather (Powered by Playwright)
- `GET /api/pagasa/forecast` - Weather forecasts
- `GET /api/pagasa/severe-weather` - Warnings and advisories
- `GET /api/pagasa/tropical-cyclones` - Typhoon updates

### PHIVOLCS Seismic
- `GET /api/phivolcs/earthquakes` - Last 24h earthquakes
- `GET /api/phivolcs/latest-earthquake` - Most recent earthquake
- `GET /api/phivolcs/volcanoes` - Active volcano monitoring

---

## 💡 Quick Examples

### Get Traffic for Specific Highway
```bash
curl http://localhost:3000/api/mmda/traffic/EDSA
```

### Get Severe Weather Alerts
```bash
curl http://localhost:3000/api/pagasa/severe-weather
```

### Get Latest Earthquake
```bash
curl http://localhost:3000/api/phivolcs/latest-earthquake
```

---

## 🔧 Common Commands

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Kill server on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2025-10-02T12:30:15.000Z"
}
```

---

## ⚡ Performance Notes

- **Cached responses**: < 5ms
- **Fresh MMDA traffic**: 200-400ms
- **Fresh PAGASA** (Playwright): 2-4 seconds
- **Fresh PHIVOLCS**: 300-600ms

**Cache Durations:**
- MMDA: 5 minutes
- PAGASA: 30 minutes (forecast), 10 minutes (alerts)
- PHIVOLCS: 5 minutes

---

## 🆘 Troubleshooting

### Server won't start?
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm run start:dev
```

### "Traffic data unavailable"?
- Ensure Playwright Chromium was installed (`npx playwright install chromium`)
- Verify the host can reach `https://x.com/mmda`
- Restart the server to clear cache

### Playwright issues?
```bash
npx playwright install chromium
```

---

## 📚 Full Documentation

For complete API documentation, see:
- **API_DOCUMENTATION.md** - Comprehensive API reference
- **IMPLEMENTATION_NOTES.md** - Technical implementation details
- **README.md** - Project overview

---

## 🎯 Next Steps

1. ✅ Server is running
2. ✅ Playwright browsers installed
3. ✅ All endpoints functional
4. 📖 Read full documentation
5. 🚀 Build your application!

Happy coding! 🎉
