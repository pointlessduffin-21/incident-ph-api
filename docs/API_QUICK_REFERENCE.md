# API Quick Reference Guide

## Base URL
```
http://localhost:6144/api
```

## Endpoints

### 🚦 MMDA Traffic
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mmda/traffic` | Get all traffic alerts |
| GET | `/mmda/highways` | Get list of highways |
| GET | `/mmda/segments` | Get traffic segments |
| GET | `/mmda/traffic/:highwayId` | Get traffic for specific highway |

**Example Request:**
```bash
curl http://localhost:6144/api/mmda/traffic
```

**Example Response:**
```json
{
  "alerts": [
    {
      "highway": "EDSA",
      "location": "Ortigas",
      "status": "Heavy Traffic",
      "timestamp": "2025-11-13T10:30:00Z"
    }
  ],
  "cachedAt": "2025-11-13T10:30:00Z"
}
```

---

### 🌦️ PAGASA Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pagasa/forecast` | Get weather forecast |
| GET | `/pagasa/severe-weather` | Get severe weather warnings |
| GET | `/pagasa/tropical-cyclones` | Get tropical cyclone bulletins |

**Example Request:**
```bash
curl http://localhost:6144/api/pagasa/forecast
```

**Example Response:**
```json
{
  "updates": [
    {
      "text": "Partly cloudy with isolated rainshowers...",
      "timestamp": "2025-11-13T06:00:00Z"
    }
  ],
  "source": "PAGASA",
  "cachedAt": "2025-11-13T10:00:00Z"
}
```

---

### 🌋 PHIVOLCS Seismology
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/phivolcs/earthquakes` | Get recent earthquakes (last 24 hours) |
| GET | `/phivolcs/latest-earthquake` | Get latest earthquake |
| GET | `/phivolcs/volcanoes` | Get monitored volcanoes |
| GET | `/phivolcs/volcanoes/:name` | Get specific volcano data |

**Example Request:**
```bash
curl http://localhost:6144/api/phivolcs/latest-earthquake
```

**Example Response:**
```json
{
  "earthquake": {
    "magnitude": 4.2,
    "location": "12 km SW of Tagaytay City",
    "depth": "10 km",
    "latitude": 14.05,
    "longitude": 120.95,
    "dateTime": "2025-11-13T08:45:00Z"
  },
  "source": "PHIVOLCS",
  "cachedAt": "2025-11-13T09:00:00Z"
}
```

---

### 🌊 Tide Forecasts (NEW)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tide/locations` | Get available coastal locations |
| GET | `/tide/forecast/:location` | Get tide forecast for specific location |

**Available Locations:**
- `cordova-1` - Cordova, Cebu
- `manila-bay` - Manila Bay
- `cebu-city` - Cebu City
- `davao-gulf` - Davao Gulf
- `subic-bay` - Subic Bay
- `puerto-princesa` - Puerto Princesa

**Example Request:**
```bash
# Get available locations
curl http://localhost:6144/api/tide/locations

# Get tide forecast for Cordova
curl http://localhost:6144/api/tide/forecast/cordova-1
```

**Example Response (Locations):**
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

**Example Response (Forecast):**
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
        },
        {
          "type": "High Tide",
          "time": "6:15 PM",
          "heightMeters": 1.52,
          "heightFeet": 4.99
        }
      ]
    }
  ],
  "cachedAt": "2025-11-13T10:00:00Z"
}
```

---

### 📊 ACLED Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/acled/incidents` | Get conflict and incident reports |

**Example Request:**
```bash
curl http://localhost:6144/api/acled/incidents
```

**Example Response:**
```json
{
  "incidents": [
    {
      "date": "2025-11-10",
      "location": "Mindanao",
      "type": "Armed Conflict",
      "description": "Clash between armed groups...",
      "fatalities": 2
    }
  ],
  "source": "ACLED",
  "cachedAt": "2025-11-13T10:00:00Z"
}
```

---

## Cache TTL by Service

| Service | Cache Duration | Rationale |
|---------|----------------|-----------|
| MMDA | 5 minutes | Traffic changes rapidly |
| PAGASA | 5 minutes | Weather updates frequently |
| PHIVOLCS | 30 minutes | Earthquakes are time-sensitive but not as frequent |
| ACLED | 1 hour | Incident reports updated less frequently |
| **Tide** | **6 hours** | Tides are predictable, change slowly |

---

## Error Responses

All endpoints return consistent error formats:

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Location not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to fetch tide data",
  "error": "Internal Server Error"
}
```

---

## CORS Configuration

The API supports CORS for frontend requests. Allowed origins:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Production server)
- Configure additional origins in backend settings

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- Recommended: 100 requests per minute per IP
- Use Redis for distributed rate limiting
- Return `429 Too Many Requests` when exceeded

---

## Authentication

Currently no authentication required. For production:
- Consider API key authentication
- Use JWT tokens for user-specific data
- Implement OAuth2 for third-party integrations

---

## Versioning

Current API version: **v1.2.0**

Version info available at root endpoint:
```bash
curl http://localhost:6144/api
```

Response:
```json
{
  "name": "Philippine Government Services API",
  "version": "1.2.0",
  "description": "Real-time data aggregation...",
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

---

## TypeScript Interfaces (Frontend)

### Tide Types
```typescript
interface TideEvent {
  type: 'High Tide' | 'Low Tide';
  time: string;
  heightMeters: number;
  heightFeet: number;
}

interface TideDay {
  date: string;
  events: TideEvent[];
}

interface TideForecast {
  location: string;
  timezone: string;
  tides: TideDay[];
  cachedAt: string;
}

interface TideLocation {
  slug: string;
  name: string;
}
```

---

## Frontend Integration

### Using Axios (Recommended)
```typescript
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';

// Get tide locations
const locations = await axios.get(`${API_BASE_URL}${ENDPOINTS.TIDE_LOCATIONS}`);

// Get tide forecast
const forecast = await axios.get(
  `${API_BASE_URL}${ENDPOINTS.TIDE_FORECAST('cordova-1')}`
);
```

### Using Fetch API
```typescript
// Get tide locations
const response = await fetch('http://localhost:6144/api/tide/locations');
const data = await response.json();

// Get tide forecast
const response = await fetch('http://localhost:6144/api/tide/forecast/cordova-1');
const forecast = await response.json();
```

---

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:6144/api/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- Download OpenAPI spec
- Test authentication
- View examples

---

## Webhook Support (Future)

Future enhancement to support webhooks for real-time updates:

```json
POST /webhooks/register
{
  "url": "https://your-domain.com/webhook",
  "events": ["tide.forecast.updated", "earthquake.detected"],
  "secret": "your_webhook_secret"
}
```

Webhook payload example:
```json
{
  "event": "tide.forecast.updated",
  "timestamp": "2025-11-13T10:00:00Z",
  "data": {
    "location": "cordova-1",
    "forecast": { ... }
  },
  "signature": "sha256=..."
}
```

---

## Best Practices

### Caching
- Respect cache headers
- Implement client-side caching (e.g., React Query, SWR)
- Cache duration matches backend TTL

### Error Handling
```typescript
try {
  const response = await axios.get(API_URL);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
  throw error;
}
```

### Performance
- Batch requests when possible
- Use parallel requests for independent data
- Implement request debouncing for user input
- Use pagination for large datasets

### Security
- Always use HTTPS in production
- Validate API responses
- Sanitize user input before sending to API
- Implement CSRF protection
- Use environment variables for API URLs

---

## Support

For issues or questions:
- GitHub Issues: [pointlessduffin-21/incident-ph-api](https://github.com/pointlessduffin-21/incident-ph-api)
- Email: support@incident-ph.com
- Documentation: `/docs` folder in repository

---

## Changelog

### v1.2.0 (2025-11-13)
- ✨ Added Tide Forecast API
- 📍 Added 6 Philippine coastal locations
- 🔄 6-hour caching for tide data
- 📚 Updated Swagger documentation

### v1.1.0 (2025-11-10)
- ✨ Added ACLED incidents
- 🌪️ Added typhoon tracking
- 📱 Improved mobile responsiveness

### v1.0.0 (2025-11-01)
- 🎉 Initial release
- ✨ MMDA traffic alerts
- 🌦️ PAGASA weather
- 🌋 PHIVOLCS seismology
