# 🚀 Quick Start Guide - Tide Forecasts & Iframe Widgets

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Testing](#testing)
5. [Using the Tide API](#using-the-tide-api)
6. [Embedding Widgets](#embedding-widgets)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ (Check: `node --version`)
- **npm** 9+ (Check: `npm --version`)
- **Git** (Check: `git --version`)

### Optional Tools
- **Postman** or **curl** for API testing
- **VS Code** with extensions:
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Tailwind CSS IntelliSense

---

## Backend Setup

### 1. Navigate to Project Root
```bash
cd /Users/yeems214/incident-ph-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
# Option 1: Using npm script
npm run start:dev

# Option 2: Using nest CLI (if installed globally)
nest start --watch

# Option 3: Using npx
npx nest start --watch
```

### 4. Verify Backend is Running
Open browser to: **http://localhost:6144/api**

You should see:
```json
{
  "name": "Philippine Government Services API",
  "version": "1.2.0",
  "services": {
    "mmda": { ... },
    "pagasa": { ... },
    "phivolcs": { ... },
    "acled": { ... },
    "tide": {
      "description": "Tide Forecasts for Philippine Coastal Locations",
      "endpoints": [
        "GET /api/tide/forecast/:location",
        "GET /api/tide/locations"
      ]
    }
  }
}
```

### 5. Access Swagger Documentation
Open: **http://localhost:6144/api/docs**

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

Required variables:
```env
VITE_OPENWEATHER_KEY=your_openweather_api_key
VITE_WINDY_API_KEY=your_windy_api_key
VITE_QWEATHER_KEY=your_qweather_api_key
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Frontend is Running
Open browser to: **http://localhost:5173**

You should see the Incident PH Dashboard.

---

## Testing

### Test Tide API Endpoints

#### 1. Get Available Locations
```bash
curl http://localhost:6144/api/tide/locations
```

Expected response:
```json
{
  "locations": [
    { "slug": "cordova-1", "name": "Cordova" },
    { "slug": "manila-bay", "name": "Manila Bay" },
    { "slug": "cebu-city", "name": "Cebu City" },
    { "slug": "davao-gulf", "name": "Davao Gulf" },
    { "slug": "subic-bay", "name": "Subic Bay" },
    { "slug": "puerto-princesa", "name": "Puerto Princesa" }
  ]
}
```

#### 2. Get Tide Forecast for Cordova
```bash
curl http://localhost:6144/api/tide/forecast/cordova-1
```

Expected response:
```json
{
  "location": "Cordova",
  "timezone": "PST (UTC +8.0hrs)",
  "tides": [
    {
      "date": "Thursday 13 November 2025",
      "events": [
        {
          "type": "High Tide",
          "time": "2:38 AM",
          "heightMeters": 1.66,
          "heightFeet": 5.45
        },
        {
          "type": "Low Tide",
          "time": "11:51 AM",
          "heightMeters": 0.53,
          "heightFeet": 1.74
        }
      ]
    }
  ],
  "cachedAt": "2025-11-13T10:00:00.000Z"
}
```

### Test Frontend Tide Page

1. Navigate to: **http://localhost:5173/tides**
2. Verify tide data displays correctly
3. Click **"Embed Widget"** button
4. Verify modal opens with iframe code
5. Click **"Copy"** buttons to test clipboard functionality

### Test Other Widget Embeds

#### PAGASA Weather
1. Navigate to: **http://localhost:5173/pagasa**
2. Click **"Embed Widget"** button
3. Copy and test embed code

#### PHIVOLCS
1. Navigate to: **http://localhost:5173/phivolcs**
2. Click **"Embed Widget"** button
3. Copy and test embed code

---

## Using the Tide API

### Frontend Integration (TypeScript)

#### 1. Import the Service
```typescript
import { getTideForecast, getTideLocations } from '@/services/tides-api';
```

#### 2. Fetch Tide Data
```typescript
// Get all available locations
const locations = await getTideLocations();
console.log(locations); // [{ slug: 'cordova-1', name: 'Cordova' }, ...]

// Get forecast for specific location
const forecast = await getTideForecast('cordova-1');
console.log(forecast.location); // "Cordova"
console.log(forecast.tides); // Array of tide days with events
```

#### 3. Display Current Tide State
```typescript
import { getCurrentTideState } from '@/services/tides-api';

const forecast = await getTideForecast('cordova-1');
const state = getCurrentTideState(forecast.tides);

console.log(state.state); // "Rising" or "Falling"
console.log(state.nextTide); // Next tide event
console.log(state.timeToNextTide); // "2h 15m"
```

### External API Integration (JavaScript)

```javascript
// Fetch tide locations
fetch('http://localhost:6144/api/tide/locations')
  .then(res => res.json())
  .then(data => console.log(data.locations));

// Fetch tide forecast
fetch('http://localhost:6144/api/tide/forecast/cordova-1')
  .then(res => res.json())
  .then(data => {
    console.log('Location:', data.location);
    console.log('Tides:', data.tides);
  });
```

---

## Embedding Widgets

### Method 1: Using the UI

1. Navigate to widget page (`/tides`, `/pagasa`, or `/phivolcs`)
2. Click purple **"Embed Widget"** button (top-right)
3. Modal opens with two options:
   - **Widget URL**: Copy direct link
   - **Embed Code**: Copy full iframe code
4. Click **"Copy"** button next to desired option
5. Paste into your HTML file

### Method 2: Manual Embed Code

#### Tide Forecast Widget
```html
<iframe 
  src="http://localhost:5173/tides" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: 0;" 
  allowfullscreen>
</iframe>
```

#### PAGASA Weather Widget
```html
<iframe 
  src="http://localhost:5173/pagasa" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: 0;" 
  allowfullscreen>
</iframe>
```

#### PHIVOLCS Widget
```html
<iframe 
  src="http://localhost:5173/phivolcs" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: 0;" 
  allowfullscreen>
</iframe>
```

### Method 3: Responsive Embed

```html
<!-- Responsive container -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="http://localhost:5173/tides" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>
```

### Testing Embeds Locally

Create `test-embed.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Embed Test</title>
</head>
<body>
  <h1>Tide Forecast Widget</h1>
  <iframe 
    src="http://localhost:5173/tides" 
    width="100%" 
    height="800" 
    frameborder="0" 
    style="border: 0;" 
    allowfullscreen>
  </iframe>
</body>
</html>
```

Open in browser to test.

---

## Troubleshooting

### Backend Issues

#### Problem: "nest: command not found"
**Solution**:
```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Or use npx
npx nest start --watch
```

#### Problem: Port 6144 already in use
**Solution**:
```bash
# Find and kill process on port 6144
lsof -ti:6144 | xargs kill -9

# Or change port in src/main.ts
```

#### Problem: Tide data not loading
**Solution**:
1. Check internet connection (needs access to tide-forecast.com)
2. Verify cache is working: Check logs for "Cache hit" or "Fetching fresh data"
3. Try different location: `curl http://localhost:6144/api/tide/forecast/manila-bay`

### Frontend Issues

#### Problem: API requests failing (CORS errors)
**Solution**:
1. Verify backend is running on port 6144
2. Check `src/config/api.ts` has correct `API_BASE_URL`
3. Ensure backend has CORS enabled (should be by default)

#### Problem: Environment variables not loading
**Solution**:
```bash
# Restart dev server after changing .env.local
npm run dev

# Verify variables are loaded
console.log(import.meta.env.VITE_OPENWEATHER_KEY)
```

#### Problem: Embed button not showing
**Solution**:
1. Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Verify component import: Check console for errors
3. Ensure IframeModal.vue exists in `src/components/`

### Embed Issues

#### Problem: Iframe shows blank/white screen
**Solution**:
1. Verify frontend is running: http://localhost:5173
2. Check browser console for errors
3. Try opening URL directly in new tab
4. Ensure no adblocker blocking iframe

#### Problem: Clipboard copy not working
**Solution**:
1. Browser may require HTTPS for clipboard API
2. Falls back to `document.execCommand('copy')` automatically
3. Try manually selecting and copying text

#### Problem: Iframe not responsive
**Solution**:
Use responsive wrapper:
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="..." 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
  </iframe>
</div>
```

---

## Quick Commands Cheat Sheet

### Backend
```bash
# Start dev server
npm run start:dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### API Testing
```bash
# Get tide locations
curl http://localhost:6144/api/tide/locations

# Get tide forecast
curl http://localhost:6144/api/tide/forecast/cordova-1

# Get all services info
curl http://localhost:6144/api

# Test with pretty JSON
curl http://localhost:6144/api/tide/locations | json_pp
```

---

## Next Steps

1. ✅ Backend and Frontend running
2. ✅ Tide API tested
3. ✅ Widget embeds working
4. 📖 Read [API_QUICK_REFERENCE.md](/docs/API_QUICK_REFERENCE.md)
5. 📖 Read [FRONTEND_UPDATES_SUMMARY.md](/frontend/FRONTEND_UPDATES_SUMMARY.md)
6. 🚀 Deploy to production (see deployment guides)
7. 📊 Monitor API usage and performance

---

## Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Architecture**: [ARCHITECTURE_DIAGRAM.md](/docs/ARCHITECTURE_DIAGRAM.md)
- **API Docs**: http://localhost:6144/api/docs

---

## Success Checklist

- [ ] Backend running on port 6144
- [ ] Frontend running on port 5173
- [ ] Tide locations endpoint returns 6 locations
- [ ] Tide forecast endpoint returns data
- [ ] Tides page displays tide data
- [ ] Embed button shows on Tides/PAGASA/PHIVOLCS pages
- [ ] Modal opens and shows embed code
- [ ] Copy buttons work
- [ ] Iframe embeds display correctly in test HTML file

If all checked ✅ - **You're ready to go!** 🎉

---

*Quick Start Guide v1.2.0*  
*Last Updated: November 13, 2025*
