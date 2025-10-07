# Alternative Data Sources & APIs

This document lists alternative approaches and data sources if the primary methods don't work for you.

## 🚦 MMDA Traffic Information

### Current Implementation
- **Source**: Community API wrapper (mmdatraffic.interaksyon.com)
- **Method**: REST API calls
- **Reliability**: Good (depends on community API)

### Alternative Sources

#### 1. Twitter/X Scraping
MMDA posts real-time traffic updates on Twitter:
- **Account**: [@MMDA](https://twitter.com/MMDA)
- **Method**: Twitter API or web scraping
- **Pros**: Official source, frequent updates
- **Cons**: Requires Twitter API access, text parsing needed

**Implementation idea:**
```typescript
// Using Twitter API
const twitterClient = new TwitterApi(bearerToken);
const tweets = await twitterClient.v2.userTimeline('MMDA');
// Parse tweets for traffic info
```

#### 2. Google Maps Traffic Layer
- **Source**: Google Maps API
- **Method**: Distance Matrix API / Directions API
- **Pros**: Very reliable, global coverage
- **Cons**: Requires API key, costs money after free tier
- **Cost**: $5 per 1000 requests after free quota

**Implementation:**
```typescript
const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
  params: {
    origin: 'Makati',
    destination: 'Quezon City',
    departure_time: 'now',
    key: GOOGLE_MAPS_API_KEY
  }
});
```

#### 3. Waze API (Community)
- **Source**: Waze traffic data
- **Method**: Unofficial community endpoints
- **Pros**: Good coverage of Metro Manila
- **Cons**: Unofficial, may break

#### 4. Direct MMDA Website Scraping
- **URL**: https://www.mmda.gov.ph
- **Method**: Cheerio scraping
- **Pros**: Official source
- **Cons**: Website updates infrequently

---

## 🌦️ PAGASA Weather Forecast

### Current Implementation
- **Source**: PAGASA official website scraping
- **Method**: Cheerio HTML parsing
- **Reliability**: Medium (depends on website structure)

### Alternative Sources

#### 1. OpenWeatherMap API ⭐ (RECOMMENDED)
- **URL**: https://openweathermap.org/api
- **Coverage**: Philippines included
- **Free Tier**: 60 calls/minute, 1M calls/month
- **Pros**: Very reliable, well-documented, JSON responses
- **Cons**: Not PAGASA-specific data

**Implementation:**
```typescript
const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
  params: {
    q: 'Manila,PH',
    appid: OPENWEATHER_API_KEY,
    units: 'metric'
  }
});
```

**Sign up**: https://openweathermap.org/api

#### 2. WeatherAPI.com
- **URL**: https://www.weatherapi.com
- **Free Tier**: 1M calls/month
- **Pros**: Great documentation, includes forecasts
- **Cons**: Not official PAGASA data

**Implementation:**
```typescript
const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
  params: {
    key: WEATHER_API_KEY,
    q: 'Manila',
    days: 3
  }
});
```

#### 3. PAGASA RSS Feeds
- **URL**: Check PAGASA website for RSS feeds
- **Method**: RSS parser
- **Pros**: Structured data
- **Cons**: Limited information

#### 4. PAGASA Mobile App Reverse Engineering
- Analyze PAGASA mobile app network requests
- Find internal API endpoints
- **Risk**: May violate terms of service

#### 5. Project NOAH (DOST)
- **URL**: https://noah.up.edu.ph
- **Method**: Web scraping
- **Pros**: Comprehensive weather data
- **Cons**: Requires scraping

---

## 🌋 PHIVOLCS Earthquake & Volcanic Data

### Current Implementation
- **Source**: PHIVOLCS website scraping
- **Method**: Cheerio HTML parsing
- **Reliability**: Medium (depends on website structure)

### Alternative Sources

#### 1. USGS Earthquake API ⭐ (RECOMMENDED)
- **URL**: https://earthquake.usgs.gov/fdsnws/event/1/
- **Coverage**: Global including Philippines
- **Free**: Yes, no API key required
- **Pros**: Very reliable, real-time, JSON format
- **Cons**: Global data (need to filter for Philippines)

**Implementation:**
```typescript
const response = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
  params: {
    format: 'geojson',
    minlatitude: 4.5,     // Philippines bounds
    maxlatitude: 21.5,
    minlongitude: 116,
    maxlongitude: 127,
    minmagnitude: 2.5,
    orderby: 'time'
  }
});
```

**Documentation**: https://earthquake.usgs.gov/fdsnws/event/1/

#### 2. GeoNet (Regional Seismic Networks)
- Various regional seismic networks
- May have Philippines data
- Free APIs available

#### 3. EMSC (European-Mediterranean Seismological Centre)
- **URL**: https://www.emsc-csem.org
- **Coverage**: Global
- **Method**: API or RSS feeds
- **Pros**: Real-time earthquake data

#### 4. PHIVOLCS RSS Feeds
- Check if PHIVOLCS provides RSS feeds
- Parse with RSS parser library

#### 5. PHIVOLCS FTP Server
- PHIVOLCS may have FTP server with data files
- Check their website for data access

---

## 🔄 Hybrid Approach (RECOMMENDED)

### Best Practice: Use Multiple Sources

**Primary + Fallback Strategy:**

```typescript
class WeatherService {
  async getWeather() {
    try {
      // Try primary source (PAGASA)
      return await this.getPagasaWeather();
    } catch (error) {
      this.logger.warn('PAGASA failed, using fallback');
      
      try {
        // Fallback to OpenWeatherMap
        return await this.getOpenWeatherMap();
      } catch (error2) {
        // Final fallback
        return this.getCachedData();
      }
    }
  }
}
```

### Benefits
- Higher reliability
- Better uptime
- Redundancy
- Can compare data sources

---

## 💰 Recommended Free APIs

### For Weather
1. **OpenWeatherMap** - https://openweathermap.org
   - Free tier: 60 calls/min
   - Easy integration
   - Great documentation

2. **WeatherAPI.com** - https://www.weatherapi.com
   - Free tier: 1M calls/month
   - No credit card required

3. **Tomorrow.io** - https://www.tomorrow.io
   - Free tier: 500 calls/day
   - Advanced weather data

### For Earthquakes
1. **USGS Earthquake API** - https://earthquake.usgs.gov
   - Completely free
   - No API key needed
   - Real-time data
   - Best option for Philippines

2. **EMSC API** - https://www.emsc-csem.org
   - Free real-time earthquake data

### For Traffic
1. **Google Maps API**
   - Free tier: $200 credit/month
   - Most reliable traffic data
   - Requires credit card

2. **HERE Maps API**
   - Free tier: 250k transactions/month
   - Good traffic data

---

## 🛠️ How to Switch Data Sources

### Example: Switching to OpenWeatherMap

1. **Get API Key**:
   - Sign up at https://openweathermap.org/api
   - Get free API key

2. **Add to Environment**:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

3. **Update Service**:
```typescript
// src/pagasa/pagasa.service.ts
async getWeatherForecast() {
  const apiKey = this.configService.get('OPENWEATHER_API_KEY');
  
  const response = await firstValueFrom(
    this.httpService.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: 'Manila,PH',
        appid: apiKey,
        units: 'metric',
        cnt: 40 // 5 days
      }
    })
  );
  
  return this.transformOpenWeatherData(response.data);
}

private transformOpenWeatherData(data: any) {
  return {
    generalForecast: data.list[0].weather[0].description,
    temperature: data.list[0].main.temp,
    humidity: data.list[0].main.humidity,
    forecasts: data.list.map(item => ({
      dateTime: item.dt_txt,
      temperature: item.main.temp,
      description: item.weather[0].description,
      humidity: item.main.humidity
    }))
  };
}
```

### Example: Switching to USGS for Earthquakes

```typescript
// src/phivolcs/phivolcs.service.ts
async getEarthquakes() {
  const response = await firstValueFrom(
    this.httpService.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      params: {
        format: 'geojson',
        minlatitude: 4.5,
        maxlatitude: 21.5,
        minlongitude: 116,
        maxlongitude: 127,
        minmagnitude: 2.5,
        orderby: 'time',
        limit: 100
      }
    })
  );
  
  return this.transformUSGSData(response.data);
}

private transformUSGSData(data: any) {
  return {
    count: data.features.length,
    earthquakes: data.features.map(feature => ({
      dateTime: new Date(feature.properties.time).toISOString(),
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      depth: `${feature.geometry.coordinates[2]} km`,
      magnitude: feature.properties.mag,
      location: feature.properties.place
    })),
    lastUpdated: new Date().toISOString()
  };
}
```

---

## 📊 Comparison Table

| Service | Source | Reliability | Cost | Official |
|---------|--------|-------------|------|----------|
| **MMDA** | Community API | ⭐⭐⭐⭐ | Free | No |
| | Google Maps | ⭐⭐⭐⭐⭐ | Paid | No |
| | Twitter | ⭐⭐⭐ | Free | Yes |
| **PAGASA** | Website Scraping | ⭐⭐⭐ | Free | Yes |
| | OpenWeatherMap | ⭐⭐⭐⭐⭐ | Free | No |
| | WeatherAPI | ⭐⭐⭐⭐⭐ | Free | No |
| **PHIVOLCS** | Website Scraping | ⭐⭐⭐ | Free | Yes |
| | USGS | ⭐⭐⭐⭐⭐ | Free | No |
| | EMSC | ⭐⭐⭐⭐ | Free | No |

---

## 🎯 Recommendations

### For Production Use

1. **Traffic**: Use Google Maps API (paid) or stick with community MMDA API
2. **Weather**: Switch to OpenWeatherMap (free tier) for better reliability
3. **Earthquakes**: Switch to USGS API (free, no key needed) for best reliability

### For Development/Testing

1. Use the provided web scraping implementations
2. They work but may need occasional updates
3. Good for learning and prototyping

### For Enterprise

1. Consider paid API services for SLA guarantees
2. Implement multiple data sources with fallbacks
3. Add monitoring and alerting
4. Consider data persistence and analytics

---

## 📞 Contact Government Agencies

If you need official API access, contact:

- **MMDA**: https://mmda.gov.ph/contact
- **PAGASA**: https://www.pagasa.dost.gov.ph
- **PHIVOLCS**: https://www.phivolcs.dost.gov.ph

Request API access for your project. They may provide official endpoints for developers.



