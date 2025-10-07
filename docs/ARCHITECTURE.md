# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│            (Web, Mobile, Desktop, APIs, etc.)               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS API Server                         │
│                   (Port 3000 - /api)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Global Middleware & Guards                  │  │
│  │  - CORS, Validation, Error Handling, Caching         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   MMDA      │  │   PAGASA     │  │   PHIVOLCS       │  │
│  │  Module     │  │   Module     │  │    Module        │  │
│  │             │  │              │  │                  │  │
│  │ Controller  │  │  Controller  │  │   Controller     │  │
│  │     ↓       │  │      ↓       │  │       ↓          │  │
│  │  Service    │  │   Service    │  │    Service       │  │
│  └─────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└────────┼──────────────────┼───────────────────┼────────────┘
         │                  │                   │
         ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cache Manager (In-Memory)                   │
│                    TTL: 5-30 minutes                         │
└─────────────────────────────────────────────────────────────┘
         │                  │                   │
         ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Data Sources                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐     │
│  │  MMDA    │    │ PAGASA   │    │   PHIVOLCS       │     │
│  │Community │    │ Website  │    │   Website        │     │
│  │   API    │    │(Scraping)│    │  (Scraping)      │     │
│  └──────────┘    └──────────┘    └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Request Flow
1. **Client** sends HTTP request to API endpoint
2. **NestJS Router** matches the route to appropriate controller
3. **Controller** receives request and calls service method
4. **Service** checks cache for existing data
5. If cached: Return cached data
6. If not cached:
   - Fetch data from external source
   - Parse and transform data
   - Store in cache with TTL
   - Return processed data
7. **Controller** wraps response with metadata
8. **Client** receives formatted JSON response

### Error Handling Flow
```
External Source Error
        ↓
Service catches error
        ↓
Log error details
        ↓
Throw HttpException
        ↓
Global Exception Filter
        ↓
Return error response to client
```

## Module Structure

### MMDA Module
- **Strategy**: Community API Wrapper
- **Reliability**: High (depends on community API uptime)
- **Endpoints**:
  - `/mmda/traffic` - All traffic incidents
  - `/mmda/highways` - Highway list
  - `/mmda/segments` - Road segments
  - `/mmda/traffic/:id` - Filtered traffic

### PAGASA Module
- **Strategy**: Web Scraping (Cheerio)
- **Reliability**: Medium (depends on website structure)
- **Endpoints**:
  - `/pagasa/forecast` - General forecast
  - `/pagasa/severe-weather` - Severe weather alerts
  - `/pagasa/tropical-cyclones` - Cyclone tracking

### PHIVOLCS Module
- **Strategy**: Web Scraping (Cheerio)
- **Reliability**: Medium (depends on website structure)
- **Endpoints**:
  - `/phivolcs/earthquakes` - Recent earthquakes
  - `/phivolcs/latest-earthquake` - Most recent
  - `/phivolcs/volcanoes` - Volcano monitoring
  - `/phivolcs/volcanoes/:name` - Specific volcano

## Technology Stack

### Core Framework
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **Express**: HTTP server

### Key Dependencies
- **@nestjs/axios**: HTTP client for external APIs
- **cheerio**: HTML parsing for web scraping
- **cache-manager**: Response caching
- **class-validator**: DTO validation
- **class-transformer**: Data transformation

### Development Tools
- **TypeScript Compiler**: Code compilation
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Caching Strategy

### Cache Keys
- `mmda:traffic` - All traffic data
- `mmda:highways` - Highway list
- `mmda:segments` - Segment data
- `pagasa:forecast` - Weather forecast
- `pagasa:severe-weather` - Severe weather
- `pagasa:tropical-cyclones` - Cyclone data
- `phivolcs:earthquakes` - Earthquake list
- `phivolcs:latest-earthquake` - Latest earthquake
- `phivolcs:volcanoes` - Volcano data

### TTL (Time To Live)
- MMDA Traffic: 5 minutes (300s)
- MMDA Static Data: 10 minutes (600s)
- PAGASA Forecast: 30 minutes (1800s)
- PAGASA Severe Weather: 10 minutes (600s)
- PHIVOLCS Earthquakes: 5 minutes (300s)
- PHIVOLCS Volcanoes: 10 minutes (600s)

## Scalability Considerations

### Current Architecture
- In-memory caching (single instance)
- HTTP-based external calls
- No database persistence

### Future Enhancements
1. **Distributed Caching**: Redis for multi-instance deployment
2. **Database Layer**: PostgreSQL for historical data
3. **Message Queue**: Bull for background jobs
4. **Monitoring**: Prometheus + Grafana
5. **Rate Limiting**: Prevent abuse
6. **WebSockets**: Real-time updates
7. **API Gateway**: Kong or similar
8. **Load Balancer**: Nginx for horizontal scaling

## Security Considerations

### Current Implementation
- ✅ CORS enabled
- ✅ Input validation
- ✅ Error sanitization
- ✅ Environment variable configuration

### Recommended Additions
- [ ] API key authentication
- [ ] Rate limiting per client
- [ ] Request logging
- [ ] IP whitelisting option
- [ ] HTTPS enforcement
- [ ] Input sanitization for XSS
- [ ] SQL injection prevention (when DB added)

## Deployment Options

### Option 1: Traditional Server
- Deploy on VPS (DigitalOcean, Linode, AWS EC2)
- Use PM2 for process management
- Nginx as reverse proxy
- SSL with Let's Encrypt

### Option 2: Container
- Docker containerization
- Deploy to Kubernetes
- Auto-scaling based on load
- Health checks and rolling updates

### Option 3: Serverless
- AWS Lambda with API Gateway
- Vercel or Netlify Functions
- Cold start considerations
- Cost-effective for low traffic

### Option 4: Platform-as-a-Service
- Heroku
- Railway
- Render
- Easy deployment, managed infrastructure

## Performance Optimization

### Current Optimizations
- Response caching
- Efficient data parsing
- Async/await for non-blocking I/O

### Future Optimizations
- Database indexing
- Query optimization
- CDN for static responses
- Compression middleware
- Connection pooling
- Background data fetching
- Partial response support

## Monitoring & Logging

### Recommended Tools
- **Logging**: Winston or Pino
- **APM**: New Relic or DataDog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot
- **Analytics**: Custom dashboard

### Key Metrics to Track
- Response times
- Cache hit rates
- Error rates
- External API availability
- Request volume
- Endpoint usage patterns



