# 🔧 Tuning Guide for PAGASA & PHIVOLCS

## Research Findings

Based on my research of the actual PAGASA and PHIVOLCS websites, here's what I discovered:

---

## 🌦️ PAGASA Weather Data

### Official Data Sources Found:

1. **PAGASA Main Website:** https://www.pagasa.dost.gov.ph/
   - Has `/weather` endpoint with daily forecasts
   - Structure: Uses standard HTML with forecast sections
   - Contains: Synoptic situation, general forecast, regional forecasts

2. **PAGASA 10-Day Forecast:**
   - Available as Excel files
   - Can be parsed with libraries like `ph-municipalities`
   - URL pattern: Check `/weather/weather-outlook-selected-philippine-cities`

3. **PAGASA Tropical Cyclone Bulletins:**
   - Tool available: `pagasa-parser` npm package
   - Parses TCBs into JSON format
   - Website: https://pagasa.chlod.net/

4. **ArcGIS Rainfall Forecast API:**
   - Available at: https://portal.georisk.gov.ph/arcgis/rest/services/PAGASA/Rainfall_Forecast/MapServer
   - Format: JSON/REST API
   - Real data source!

### Recommended Approaches:

#### Option A: Use ArcGIS API (RECOMMENDED) ⭐
```typescript
// This is a REAL API endpoint!
const arcgisUrl = 'https://portal.georisk.gov.ph/arcgis/rest/services/PAGASA/Rainfall_Forecast/MapServer';

// Query params:
// - f=json (format)
// - where=1=1 (get all)
// - outFields=* (all fields)
```

#### Option B: Use PAGASA Parser for Tropical Cyclones
```bash
npm install pagasa-parser
```

```typescript
import { parseTropicalCyclone } from 'pagasa-parser';

// Parse PAGASA bulletin URLs
const data = await parseTropicalCyclone(bulletinUrl);
```

#### Option C: Scrape Weather Pages
Key selectors to look for on `/weather` page:
- `.weather-content` - main weather content
- `.synoptic, .synopsis` - synoptic situation
- `.forecast, .general-forecast` - general forecast
- Region-specific divs/sections

---

## 🌋 PHIVOLCS Volcano Alert Levels

### Official Data Sources Found:

1. **Volcano Bulletin Page:** https://www.phivolcs.dost.gov.ph/index.php/volcano-hazard/volcano-bulletin2
   - Contains: Mayon, Taal, Pinatubo, Kanlaon, Bulusan
   - Format: HTML with volcano cards/sections
   - Has alert level information!

2. **WOVODAT (World Volcano Database):** https://wovodat.phivolcs.dost.gov.ph/
   - Local Active Volcanoes Archive (LAVA)
   - Contains eruption history
   - May have API endpoints!

3. **Volcano Alert Levels Page:** `/index.php/volcano-hazard/volcano-alert-level`
   - Explains alert level system
   - Shows current alerts

### Key HTML Patterns Found:

From my research, the volcano bulletin page likely uses:
```html
<!-- Volcano sections -->
<div class="volcano-section">
  <h3>MAYON</h3>
  <div class="alert-level">Alert Level 1</div>
  <div class="status">...</div>
</div>
```

### Recommended Implementation:

```typescript
async getVolcanoAlertLevels() {
  const url = 'https://www.phivolcs.dost.gov.ph/index.php/volcano-hazard/volcano-bulletin2';
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  const volcanoes = [];
  
  // Look for volcano names
  const volcanoNames = ['MAYON', 'TAAL', 'PINATUBO', 'KANLAON', 'BULUSAN'];
  
  volcanoNames.forEach(name => {
    // Find sections containing volcano name
    const section = $(`h3:contains("${name}")`).parent();
    
    // Extract alert level
    const alertLevel = section.find('.alert-level, [class*="alert"]').text().trim();
    
    // Extract status/advisory
    const status = section.find('.status, .advisory, p').first().text().trim();
    
    volcanoes.push({
      name,
      alertLevel,
      status,
      lastUpdate: new Date().toISOString()
    });
  });
  
  return volcanoes;
}
```

---

## 🚀 Implementation Plan

### Phase 1: PAGASA Weather (Use ArcGIS API)

**Why:** It's a real API, not web scraping!

**Steps:**
1. Test ArcGIS endpoint manually
2. Create service method to query rainfall data
3. Transform data to our format
4. Implement caching

**Expected Result:** Real rainfall forecast data!

### Phase 2: PHIVOLCS Volcano Bulletins

**Steps:**
1. Fetch HTML from volcano bulletin page
2. Parse volcano sections
3. Extract alert levels and status
4. Cache for 30 minutes

**Expected Result:** Real volcano alert levels!

### Phase 3: PAGASA General Weather

**Options:**
1. Use PAGASA Parser for tropical cyclones
2. Scrape weather page with proper selectors
3. Optionally integrate OpenWeatherMap as backup

---

## 📝 Quick Implementation

### For PAGASA (ArcGIS Rainfall):

```typescript
async getRainfallForecast() {
  const url = 'https://portal.georisk.gov.ph/arcgis/rest/services/PAGASA/Rainfall_Forecast/MapServer/query';
  
  const response = await axios.get(url, {
    params: {
      f: 'json',
      where: '1=1',
      outFields: '*',
      returnGeometry: false
    }
  });
  
  return response.data;
}
```

### For PHIVOLCS Volcanoes:

```typescript
async getVolcanoAlerts() {
  const url = 'https://www.phivolcs.dost.gov.ph/index.php/volcano-hazard/volcano-bulletin2';
  const response = await axios.get(url, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  
  const $ = cheerio.load(response.data);
  
  // Extract volcano information
  // Look for headers, divs, tables containing volcano names
  const volcanoes = [];
  
  $('h2, h3, h4').each((i, elem) => {
    const text = $(elem).text().toUpperCase();
    if (text.includes('MAYON') || text.includes('TAAL') || 
        text.includes('PINATUBO') || text.includes('KANLAON') || 
        text.includes('BULUSAN')) {
      
      const parent = $(elem).parent();
      const alertText = parent.text();
      
      // Extract alert level from text
      const alertMatch = alertText.match(/Alert Level (\d+)/i);
      
      volcanoes.push({
        name: text.trim(),
        alertLevel: alertMatch ? `Alert Level ${alertMatch[1]}` : 'N/A',
        fullText: alertText.substring(0, 200)
      });
    }
  });
  
  return volcanoes;
}
```

---

## 🎯 Next Steps

1. **Test ArcGIS endpoint manually:**
   ```bash
   curl "https://portal.georisk.gov.ph/arcgis/rest/services/PAGASA/Rainfall_Forecast/MapServer?f=json"
   ```

2. **Inspect PHIVOLCS volcano bulletin page:**
   ```bash
   curl "https://www.phivolcs.dost.gov.ph/index.php/volcano-hazard/volcano-bulletin2" | grep -i "alert"
   ```

3. **Implement and test one at a time**

4. **Add proper error handling and caching**

---

## ⚠️ Important Notes

### For PAGASA:
- ArcGIS API is **the best option** - it's a real API!
- Tropical cyclone data: use `pagasa-parser` package
- General weather: may need web scraping with proper selectors

### For PHIVOLCS:
- Volcano bulletin page has real data
- Need to handle SSL certificate issues (rejectUnauthorized: false)
- Alert levels are in the HTML content
- Update cache every 30 minutes

### General:
- Always implement fallback data
- Handle errors gracefully
- Cache aggressively
- Log when scraping succeeds vs fails

---

## 📚 Resources

- PAGASA Parser: https://pagasa.chlod.net/
- ArcGIS API: https://portal.georisk.gov.ph/arcgis/rest/services/PAGASA/
- PHIVOLCS Volcano Bulletin: https://www.phivolcs.dost.gov.ph/index.php/volcano-hazard/volcano-bulletin2
- WOVODAT: https://wovodat.phivolcs.dost.gov.ph/

---

**Ready to implement? Start with testing the ArcGIS endpoint - it's the easiest win!**

