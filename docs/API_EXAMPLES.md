# API Usage Examples

## Table of Contents
- [MMDA Examples](#mmda-examples)
- [PAGASA Examples](#pagasa-examples)
- [PHIVOLCS Examples](#phivolcs-examples)
- [Error Handling](#error-handling)
- [Integration Examples](#integration-examples)

## MMDA Examples

### Get All Traffic Data

**cURL:**
```bash
curl http://localhost:3000/api/mmda/traffic
```

**JavaScript (Fetch):**
```javascript
fetch('http://localhost:3000/api/mmda/traffic')
  .then(response => response.json())
  .then(data => {
    console.log('Traffic data:', data);
  });
```

**TypeScript (Axios):**
```typescript
import axios from 'axios';

const getTrafficData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/mmda/traffic');
    return response.data;
  } catch (error) {
    console.error('Error fetching traffic data:', error);
  }
};
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "highway": "EDSA",
      "segment": "Magallanes to Ayala",
      "status": "Heavy Traffic",
      "lastUpdated": "2025-10-02T10:30:00Z"
    }
  ],
  "timestamp": "2025-10-02T10:30:15.000Z"
}
```

### Get Traffic by Highway

**cURL:**
```bash
curl http://localhost:3000/api/mmda/traffic/edsa
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "highway": "EDSA",
      "segment": "Magallanes to Ayala",
      "status": "Heavy Traffic"
    }
  ],
  "timestamp": "2025-10-02T10:30:15.000Z"
}
```

### Get All Highways

**cURL:**
```bash
curl http://localhost:3000/api/mmda/highways
```

---

## PAGASA Examples

### Get Weather Forecast

**cURL:**
```bash
curl http://localhost:3000/api/pagasa/forecast
```

**JavaScript (Async/Await):**
```javascript
const getWeatherForecast = async () => {
  const response = await fetch('http://localhost:3000/api/pagasa/forecast');
  const data = await response.json();
  
  if (data.success) {
    console.log('Synoptic Situation:', data.data.synopticSituation);
    console.log('General Forecast:', data.data.generalForecast);
    
    data.data.regionalForecasts.forEach(region => {
      console.log(`${region.region}: ${region.forecast}`);
    });
  }
};
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "synopticSituation": "The Southwest Monsoon affecting Luzon and Visayas...",
    "generalForecast": "Metro Manila and the rest of the country will have...",
    "regionalForecasts": [
      {
        "region": "Metro Manila",
        "forecast": "Partly cloudy with isolated rainshowers"
      }
    ],
    "warnings": [
      "Heavy rainfall warning in effect for Northern Luzon"
    ],
    "lastUpdated": "2025-10-02T10:30:00.000Z"
  },
  "timestamp": "2025-10-02T10:30:15.000Z"
}
```

### Get Severe Weather

**cURL:**
```bash
curl http://localhost:3000/api/pagasa/severe-weather
```

**Vue.js Example:**
```vue
<template>
  <div>
    <h2>Severe Weather Alerts</h2>
    <div v-for="cyclone in activeCyclones" :key="cyclone.name">
      <h3>{{ cyclone.name }}</h3>
      <p>Status: {{ cyclone.status }}</p>
      <p>Location: {{ cyclone.location }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const activeCyclones = ref([]);

onMounted(async () => {
  const response = await axios.get('http://localhost:3000/api/pagasa/severe-weather');
  if (response.data.success) {
    activeCyclones.value = response.data.data.activeCyclones;
  }
});
</script>
```

### Get Tropical Cyclones

**cURL:**
```bash
curl http://localhost:3000/api/pagasa/tropical-cyclones
```

---

## PHIVOLCS Examples

### Get All Earthquakes

**cURL:**
```bash
curl http://localhost:3000/api/phivolcs/earthquakes
```

**React Example:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EarthquakeList() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/phivolcs/earthquakes');
        if (response.data.success) {
          setEarthquakes(response.data.data.earthquakes);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Recent Earthquakes ({earthquakes.length})</h2>
      {earthquakes.map((eq, index) => (
        <div key={index}>
          <p><strong>Magnitude:</strong> {eq.magnitude}</p>
          <p><strong>Location:</strong> {eq.location}</p>
          <p><strong>Date/Time:</strong> {eq.dateTime}</p>
          <p><strong>Depth:</strong> {eq.depth}</p>
        </div>
      ))}
    </div>
  );
}

export default EarthquakeList;
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "earthquakes": [
      {
        "dateTime": "2025-10-02 08:15:23",
        "latitude": "14.5995",
        "longitude": "120.9842",
        "depth": "10 km",
        "magnitude": "4.5",
        "location": "5 km SE of Manila"
      }
    ],
    "lastUpdated": "2025-10-02T10:30:00.000Z"
  },
  "timestamp": "2025-10-02T10:30:15.000Z"
}
```

### Get Latest Earthquake

**cURL:**
```bash
curl http://localhost:3000/api/phivolcs/latest-earthquake
```

**Node.js Script:**
```javascript
const axios = require('axios');

async function checkLatestEarthquake() {
  try {
    const response = await axios.get('http://localhost:3000/api/phivolcs/latest-earthquake');
    
    if (response.data.success && response.data.data.earthquake) {
      const eq = response.data.data.earthquake;
      
      console.log('\n🚨 Latest Earthquake Alert 🚨');
      console.log('================================');
      console.log(`Magnitude: ${eq.magnitude}`);
      console.log(`Location: ${eq.location}`);
      console.log(`Time: ${eq.dateTime}`);
      console.log(`Depth: ${eq.depth}`);
      console.log('================================\n');
      
      // Send notification, SMS, or other alert
      if (parseFloat(eq.magnitude) >= 5.0) {
        console.log('⚠️ STRONG EARTHQUAKE DETECTED!');
        // Trigger alert system
      }
    }
  } catch (error) {
    console.error('Error fetching earthquake data:', error.message);
  }
}

// Run every 5 minutes
setInterval(checkLatestEarthquake, 5 * 60 * 1000);
checkLatestEarthquake(); // Run immediately
```

### Get All Volcanoes

**cURL:**
```bash
curl http://localhost:3000/api/phivolcs/volcanoes
```

### Get Specific Volcano

**cURL:**
```bash
curl http://localhost:3000/api/phivolcs/volcanoes/mayon
```

**Python Example:**
```python
import requests

def get_volcano_status(volcano_name):
    url = f'http://localhost:3000/api/phivolcs/volcanoes/{volcano_name}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data['success']:
            volcano = data['data']['volcano']
            print(f"\n🌋 {volcano['name']} Status")
            print(f"Alert Level: {volcano['alertLevel']}")
            print(f"Status: {volcano['status']}")
            print(f"Last Update: {volcano['lastUpdate']}")
        else:
            print(f"Volcano '{volcano_name}' not found")
            
    except Exception as e:
        print(f"Error: {e}")

# Check multiple volcanoes
volcanoes = ['mayon', 'taal', 'pinatubo']
for volcano in volcanoes:
    get_volcano_status(volcano)
```

---

## Error Handling

### Handling HTTP Errors

**JavaScript Example:**
```javascript
async function fetchWithErrorHandling(endpoint) {
  try {
    const response = await fetch(`http://localhost:3000/api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Handle specific error cases
    if (error.message.includes('503')) {
      console.log('Service temporarily unavailable. Retrying...');
      // Implement retry logic
    }
    
    return null;
  }
}
```

**Error Response Example:**
```json
{
  "statusCode": 503,
  "message": "Failed to fetch MMDA traffic data",
  "error": "Service Unavailable"
}
```

---

## Integration Examples

### Building a Weather Dashboard

**Full Stack Example (Express + React):**

**Backend (Express middleware):**
```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

const API_BASE = 'http://localhost:3000/api';

app.get('/api/dashboard', async (req, res) => {
  try {
    const [traffic, weather, earthquakes] = await Promise.all([
      axios.get(`${API_BASE}/mmda/traffic`),
      axios.get(`${API_BASE}/pagasa/forecast`),
      axios.get(`${API_BASE}/phivolcs/latest-earthquake`)
    ]);

    res.json({
      traffic: traffic.data,
      weather: weather.data,
      earthquake: earthquakes.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.listen(4000);
```

**Frontend (React):**
```jsx
import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <section>
        <h2>Traffic Updates</h2>
        {/* Render traffic data */}
      </section>
      
      <section>
        <h2>Weather Forecast</h2>
        {/* Render weather data */}
      </section>
      
      <section>
        <h2>Latest Earthquake</h2>
        {/* Render earthquake data */}
      </section>
    </div>
  );
}
```

### SMS Alert System

```javascript
// alert-system.js
const axios = require('axios');
const twilio = require('twilio'); // SMS service

const client = twilio(accountSid, authToken);

async function monitorAndAlert() {
  // Check latest earthquake
  const eqResponse = await axios.get('http://localhost:3000/api/phivolcs/latest-earthquake');
  
  if (eqResponse.data.success) {
    const eq = eqResponse.data.data.earthquake;
    const magnitude = parseFloat(eq.magnitude);
    
    if (magnitude >= 5.0) {
      // Send SMS alert
      await client.messages.create({
        body: `⚠️ Earthquake Alert: Magnitude ${magnitude} detected at ${eq.location}`,
        from: '+1234567890',
        to: '+1234567890'
      });
    }
  }
}

// Run every 5 minutes
setInterval(monitorAndAlert, 5 * 60 * 1000);
```

### Mobile App Integration (React Native)

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import axios from 'axios';

const TrafficScreen = () => {
  const [traffic, setTraffic] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTraffic = async () => {
    try {
      const response = await axios.get('http://your-server.com/api/mmda/traffic');
      if (response.data.success) {
        setTraffic(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTraffic();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTraffic();
  }, []);

  return (
    <FlatList
      data={traffic}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <View>
          <Text>{item.highway}</Text>
          <Text>{item.status}</Text>
        </View>
      )}
    />
  );
};
```

---

## Best Practices

1. **Always check `success` field** before processing data
2. **Implement retry logic** for failed requests
3. **Cache responses** on the client side when appropriate
4. **Handle errors gracefully** with user-friendly messages
5. **Use environment variables** for API URLs
6. **Implement rate limiting** to avoid overwhelming the server
7. **Monitor response times** and optimize as needed
8. **Keep user informed** during loading states



