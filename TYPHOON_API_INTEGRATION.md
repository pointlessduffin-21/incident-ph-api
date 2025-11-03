# Typhoon Data API Integration Guide

## Overview

This document explains how the typhoon monitoring system fetches **real-time tropical cyclone data** from public APIs and displays it in the dashboard. You can use this same approach to build an API for other applications.

---

## Data Sources

### 1. **JTWC (Joint Typhoon Warning Center)** - Primary Source
- **Organization**: US Navy / NOAA
- **URL**: `https://www.metoc.navy.mil/jtwc/rss/jtwc.rss`
- **Format**: RSS/XML feed
- **Coverage**: Western Pacific, Indian Ocean, Southern Hemisphere
- **Data Includes**:
  - Active typhoon warnings
  - Track forecast graphics (`.gif`)
  - Satellite imagery (`.jpg`)
  - Text advisories (`.txt`)
  - Warning numbers and issue times

### 2. **GDACS (Global Disaster Alert and Coordination System)** - Fallback
- **Organization**: UN / European Commission
- **URL**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC`
- **Format**: GeoJSON
- **Coverage**: Global tropical cyclones
- **Data Includes**:
  - Event ID and name
  - Alert level (Red/Orange/Green)
  - Coordinates (lat/lon)
  - Affected countries
  - Date range

### 3. **PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)** - Optional
- **Source**: Your backend endpoint
- **URL**: `http://localhost:6144/api/pagasa/tropical-cyclones`
- **Format**: JSON
- **Coverage**: Philippines-specific

---

## Technical Implementation

### Step 1: Handle CORS Issues

**Problem**: Direct browser requests to JTWC RSS fail due to CORS restrictions.

**Solution**: Use RSS2JSON proxy service
```typescript
const rssUrl = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

const { data } = await axios.get(proxyUrl, { timeout: 8000 });
```

**Alternative CORS Proxies**:
- `https://api.allorigins.win/raw?url=<encoded_url>`
- `https://corsproxy.io/?<url>`
- Build your own proxy endpoint

### Step 2: Parse JTWC RSS Feed

The RSS feed returns 4 regional summaries. Each contains HTML with embedded typhoon warnings:

```javascript
// Example RSS item structure
{
  "title": "Current Northwest Pacific/North Indian Ocean* Tropical Systems",
  "pubDate": "2025-11-03 09:54:02",
  "description": "<p><b>Typhoon 31W (Kalmaegi) Warning #09</b><br>..."
}
```

**Extract typhoon information**:
```typescript
const typhoonMatches = description.matchAll(
  /(?:Typhoon|Super Typhoon|Tropical Storm|Tropical Depression)\s+(\d+\w+)\s*\(([^)]+)\)\s*Warning\s*#(\d+)/gi
);

for (const match of typhoonMatches) {
  const designation = match[1];  // "31W"
  const name = match[2];          // "Kalmaegi"
  const warningNum = match[3];    // "09"
  const category = match[0].split(' ')[0]; // "Typhoon"
}
```

**Extract embedded URLs**:
```typescript
// Track forecast graphic
const graphicMatch = description.match(/href="([^"]+\.gif)"/);
// Example: https://www.metoc.navy.mil/jtwc/products/wp3125.gif

// Satellite imagery
const satelliteMatch = description.match(/href="([^"]+sair\.jpg)"/);
// Example: https://www.metoc.navy.mil/jtwc/products/31W_030600sair.jpg

// Text advisory
const warningTextMatch = description.match(/href="([^"]+web\.txt)"/);
// Example: https://www.metoc.navy.mil/jtwc/products/wp3125web.txt
```

### Step 3: Parse GDACS GeoJSON

GDACS provides structured JSON data:

```typescript
const { data } = await axios.get(
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC',
  { timeout: 10000 }
);

// Structure
{
  "features": [
    {
      "properties": {
        "eventid": "TC123456",
        "eventname": "KALMAEGI",
        "alertlevel": "Red",
        "fromdate": "2025-11-01T00:00:00",
        "todate": "2025-11-05T00:00:00",
        "country": "Philippines, Taiwan"
      },
      "geometry": {
        "coordinates": [121.5, 14.2]  // [lon, lat]
      }
    }
  ]
}
```

**Filter for Philippine region**:
```typescript
const storms = data.features
  .filter((feature) => {
    const lat = feature.geometry.coordinates[1];
    const lon = feature.geometry.coordinates[0];
    // Western Pacific: 0-30°N, 100-180°E
    return lat >= 0 && lat <= 30 && lon >= 100 && lon <= 180;
  });
```

---

## Building Your Own API

### Option 1: Simple Node.js/Express Backend

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/typhoons', async (req, res) => {
  try {
    // Fetch JTWC via RSS2JSON
    const jtwcUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + 
                    encodeURIComponent('https://www.metoc.navy.mil/jtwc/rss/jtwc.rss');
    const { data } = await axios.get(jtwcUrl);
    
    const typhoons = [];
    
    // Parse each item
    data.items.forEach(item => {
      const description = item.description || '';
      const matches = description.matchAll(
        /(?:Typhoon|Super Typhoon|Tropical Storm)\s+(\d+\w+)\s*\(([^)]+)\)\s*Warning\s*#(\d+)/gi
      );
      
      for (const match of matches) {
        typhoons.push({
          designation: match[1],
          name: match[2],
          warningNumber: match[3],
          category: match[0].split(/\s+\d+/)[0],
          issueDate: item.pubDate,
          trackImage: extractUrl(description, /href="([^"]+\.gif)"/),
          satelliteImage: extractUrl(description, /href="([^"]+sair\.jpg)"/),
          advisoryText: extractUrl(description, /href="([^"]+web\.txt)"/),
        });
      }
    });
    
    res.json({
      success: true,
      count: typhoons.length,
      data: typhoons,
      source: 'JTWC',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

function extractUrl(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : null;
}

app.listen(3000, () => console.log('Typhoon API running on port 3000'));
```

### Option 2: Python Flask API

```python
from flask import Flask, jsonify
import requests
import re
from datetime import datetime

app = Flask(__name__)

@app.route('/api/typhoons')
def get_typhoons():
    try:
        # Fetch JTWC RSS via proxy
        rss_url = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss'
        proxy_url = f'https://api.rss2json.com/v1/api.json?rss_url={rss_url}'
        
        response = requests.get(proxy_url, timeout=8)
        data = response.json()
        
        typhoons = []
        
        for item in data.get('items', []):
            description = item.get('description', '')
            
            # Find typhoon warnings
            pattern = r'(Typhoon|Super Typhoon|Tropical Storm)\s+(\d+\w+)\s*\(([^)]+)\)\s*Warning\s*#(\d+)'
            matches = re.finditer(pattern, description, re.IGNORECASE)
            
            for match in matches:
                typhoons.append({
                    'category': match.group(1),
                    'designation': match.group(2),
                    'name': match.group(3),
                    'warning_number': match.group(4),
                    'issue_date': item.get('pubDate'),
                    'track_image': extract_url(description, r'href="([^"]+\.gif)"'),
                    'satellite_image': extract_url(description, r'href="([^"]+sair\.jpg)"'),
                    'advisory_text': extract_url(description, r'href="([^"]+web\.txt)"'),
                })
        
        return jsonify({
            'success': True,
            'count': len(typhoons),
            'data': typhoons,
            'source': 'JTWC',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def extract_url(html, pattern):
    match = re.search(pattern, html)
    return match.group(1) if match else None

if __name__ == '__main__':
    app.run(port=3000)
```

---

## API Response Format

### Standardized JSON Structure

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "name": "Typhoon 31W (Kalmaegi)",
      "internationalName": "Kalmaegi",
      "designation": "31W",
      "category": "Typhoon",
      "maxWinds": "Warning #09",
      "date": "03/0900Z",
      "affectedAreas": ["Northwest Pacific/North Indian Ocean"],
      "status": "Active",
      "description": "Active tropical cyclone 31W (Kalmaegi). Latest warning #09 issued.",
      "source": "JTWC (US Navy)",
      "coordinates": null,
      "trackImageUrl": "https://www.metoc.navy.mil/jtwc/products/wp3125.gif",
      "satelliteImageUrl": "https://www.metoc.navy.mil/jtwc/products/31W_030600sair.jpg",
      "advisoryUrl": "https://www.metoc.navy.mil/jtwc/products/wp3125web.txt"
    }
  ],
  "timestamp": "2025-11-03T09:54:02Z",
  "sources": ["JTWC", "GDACS"]
}
```

---

## Deployment Considerations

### Caching
- Cache responses for 15-30 minutes (typhoon data doesn't change rapidly)
- Use Redis or simple in-memory cache
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 900 }); // 15 minutes

app.get('/api/typhoons', async (req, res) => {
  const cached = cache.get('typhoons');
  if (cached) return res.json(cached);
  
  // Fetch fresh data...
  const data = await fetchTyphoons();
  cache.set('typhoons', data);
  res.json(data);
});
```

### Rate Limiting
- Protect your API from abuse
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Error Handling
- Implement fallback sources
- Return partial data if one source fails
```javascript
async function fetchAllSources() {
  const results = await Promise.allSettled([
    fetchJTWC(),
    fetchGDACS(),
    fetchPAGASA()
  ]);
  
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}
```

---

## Frontend Integration

### Axios Example
```typescript
import axios from 'axios';

const typhoonClient = axios.create({
  baseURL: 'https://your-api.com',
  timeout: 10000,
});

export async function getTyphoons() {
  const { data } = await typhoonClient.get('/api/typhoons');
  return data.data; // array of typhoons
}
```

### Display Images
```vue
<template>
  <div v-for="typhoon in typhoons" :key="typhoon.designation">
    <h3>{{ typhoon.name }}</h3>
    
    <!-- Track Forecast -->
    <img 
      v-if="typhoon.trackImageUrl"
      :src="typhoon.trackImageUrl" 
      alt="Track forecast"
    />
    
    <!-- Satellite Image -->
    <img 
      v-if="typhoon.satelliteImageUrl"
      :src="typhoon.satelliteImageUrl" 
      alt="Satellite imagery"
    />
    
    <!-- Advisory Link -->
    <a 
      v-if="typhoon.advisoryUrl"
      :href="typhoon.advisoryUrl" 
      target="_blank"
    >
      Read Full Advisory
    </a>
  </div>
</template>
```

---

## Key Takeaways

1. **JTWC RSS is the most reliable source** for Western Pacific typhoons
2. **Use RSS2JSON proxy** to bypass CORS restrictions
3. **Parse HTML content** with regex to extract typhoon data and URLs
4. **GDACS provides structured data** but can be slow/unreliable
5. **Cache responses** to reduce API calls and improve performance
6. **All images/data are publicly accessible** from JTWC servers
7. **No API key required** for JTWC or GDACS

---

## References

- JTWC: https://www.metoc.navy.mil/jtwc/jtwc.html
- GDACS API: https://www.gdacs.org/gdacsapi/
- RSS2JSON: https://rss2json.com/
- PAGASA: https://www.pagasa.dost.gov.ph/

---

**Last Updated**: November 3, 2025
