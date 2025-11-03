# Incident PH API Documentation

This document describes available endpoints, request forms, and response formats for the Incident PH APIs. All endpoints are prefixed with `/api/`.

---

## 1. MMDA (Metro Manila Development Authority)

### - GET /api/mmda/traffic
Returns the most recent MMDA traffic alerts scraped from @MMDA Twitter.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 3,
    "alerts": [
      {
        "text": "MMDA ALERT: Accident on EDSA...",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "type": "mmda_alert",
        "url": "https://x.com/mmda/status/123456789",
        "source": "MMDA Twitter (@MMDA)"
      }
      // ...
    ],
    "source": "MMDA Twitter Official Feed (@MMDA)",
    "lastUpdated": "2024-01-01T10:01:00.000Z",
    "note": "Only tweets starting with 'MMDA ALERT' are included."
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/mmda/highways
Returns a list of major Metro Manila highways.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "highways": [
      { "id": "EDSA", "name": "EDSA", "coordinates": { "lat": 14.5547, "lon": 121.0244 } }
      // ...
    ],
    "count": 12,
    "note": "For real-time traffic alerts, check /api/mmda/traffic"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/mmda/segments
Returns information on road segment details.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "message": "Road segment details are derived from MMDA ALERT tweets",
    "note": "Check /api/mmda/traffic for the latest official advisories",
    "suggestion": "Use keyword filtering on traffic alerts to extract specific road segments"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/mmda/traffic/:highwayId
Returns traffic alerts for a specific highway.
```
Request Parameters:
  - highwayId (string): The ID of the highway (e.g. "EDSA")
Response:
{
  "success": true,
  "data": {
    "highway": "EDSA",
    "count": 1,
    "alerts": [/* filtered alerts mentioning EDSA */],
    "lastUpdated": "2024-01-01T10:01:00.000Z",
    "source": "MMDA Twitter Official Feed (@MMDA)"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

---

## 2. PAGASA (Weather)

### - GET /api/pagasa/forecast
PAGASA weather updates and forecasts.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 5,
    "updates": [
      {
        "text": "Weather forecast: ...",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "type": "forecast",
        "source": "PAGASA Twitter"
      }
      // ...
    ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/pagasa/severe-weather
PAGASA severe weather (warnings and advisories).
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 2,
    "warnings": [ { /* tweet objects */ } ],
    "advisories": [ { /* tweet objects */ } ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/pagasa/tropical-cyclones
Tropical cyclone and typhoon bulletins (from recent tweets).
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 1,
    "updates": [ { /* tweet objects */ } ],
    "source": "PAGASA Twitter (@dost_pagasa)",
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

---

## 3. PHIVOLCS (Volcanoes & Earthquakes)

### - GET /api/phivolcs/earthquakes
Recent earthquakes as officially published by PHIVOLCS.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 2,
    "earthquakes": [
      {
        "dateTime": "2024-01-01T08:15:00.000Z",
        "latitude": "14.1",
        "longitude": "122.1",
        "depth": "10km",
        "magnitude": "5.2",
        "location": "Sorsogon",
        "note": "..."
      }
      // ...
    ],
    "source": "PHIVOLCS Earthquake Information",
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/phivolcs/latest-earthquake
Most recent earthquake event.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "earthquake": {
      /* latest earthquake object */
    },
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/phivolcs/volcanoes
Status and alert levels for each monitored Philippine volcano.
```
Request: None
Response:
{
  "success": true,
  "data": {
    "count": 3,
    "volcanoes": [
      {
        "name": "Mayon Volcano",
        "alertLevel": "N/A",
        "status": "Check official sources",
        "lastUpdate": "2024-01-01T10:00:00.000Z"
      }
      // ...
    ],
    "source": "PHIVOLCS",
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

### - GET /api/phivolcs/volcanoes/:name
Status for a specific volcano by name.
```
Request Parameters:
  - name (string): volcano name or part of name
Response:
{
  "success": true,
  "data": {
    "volcano": {
      /* volcano object (see structure above) */
    },
    "lastUpdated": "2024-01-01T10:01:00.000Z"
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

---

## 4. ACLED (Conflict & Incident Reports)

### - GET /api/acled/incidents
ACLED incident data for the Philippines (requires proper API key/email in config).
```
Request Query Parameters:
  - limit (integer): number of incidents (default: 50, max: 200)
Response:
{
  "success": true,
  "data": {
    "count": 10,
    "incidents": [
      {
        "eventDate": "2024-01-01",
        "eventType": "Violence against civilians",
        "subEventType": "Attack",
        "actors": ["Group 1", "Group 2"],
        "admin1": "Region",
        "location": "Municipality",
        "coordinates": { "lat": 13.123, "lon": 123.123 },
        "fatalities": 1,
        "notes": "...",
        "source": "ACLED"
      }
      // ...
    ],
    "source": "ACLED API",
    "lastUpdated": "2024-01-01T10:01:00.000Z",
    "note": "Most recent 10 incidents for the Philippines as reported by ACLED."
  },
  "timestamp": "2024-01-01T10:01:00.000Z"
}
```

---

_All endpoints return ISO8601-formatted "timestamp" fields, and have a uniform envelope: { "success": boolean, "data": any, "timestamp": string }._

For further details and interactive docs, see `/api/docs` when your server is running.
