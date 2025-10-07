# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
The `.env` file has been created with default values. You can modify it if needed.

3. **Start the Development Server**
```bash
npm run start:dev
```

4. **Test the API**
Open your browser or use curl:
```bash
# Test the main endpoint
curl http://localhost:3000/api

# Test MMDA traffic data
curl http://localhost:3000/api/mmda/traffic

# Test PAGASA weather forecast
curl http://localhost:3000/api/pagasa/forecast

# Test PHIVOLCS earthquakes
curl http://localhost:3000/api/phivolcs/earthquakes
```

## API Endpoints Summary

### MMDA Traffic
- `GET /api/mmda/traffic` - All traffic data
- `GET /api/mmda/highways` - List of highways
- `GET /api/mmda/segments` - Road segments
- `GET /api/mmda/traffic/:highwayId` - Traffic by highway

### PAGASA Weather
- `GET /api/pagasa/forecast` - Weather forecast
- `GET /api/pagasa/severe-weather` - Severe weather alerts
- `GET /api/pagasa/tropical-cyclones` - Tropical cyclone information

### PHIVOLCS
- `GET /api/phivolcs/earthquakes` - All recent earthquakes
- `GET /api/phivolcs/latest-earthquake` - Most recent earthquake
- `GET /api/phivolcs/volcanoes` - All volcano statuses
- `GET /api/phivolcs/volcanoes/:name` - Specific volcano info

## Important Notes

### Data Sources & Reliability

1. **MMDA** uses a community API wrapper - generally reliable
2. **PAGASA** uses web scraping - may need updates if website changes
3. **PHIVOLCS** uses web scraping - may need updates if website changes

### If Data Isn't Loading

The web scraping approach means:
- Data structure depends on government website HTML
- If websites are updated, selectors may need adjustment
- Check the service files in `src/[service]/[service].service.ts`

### Customization

To modify data extraction:
1. Open the respective service file
2. Update the cheerio selectors in extraction methods
3. Test with the live website HTML structure

## Troubleshooting

**Error: "Failed to fetch..."**
- Check if the source website is accessible
- Verify your internet connection
- Source website may have changed structure

**No data returned:**
- Web scraping selectors may need updating
- Check the actual HTML of the source website
- Update selectors in the service files

**Cache issues:**
- Clear cache by restarting the server
- Adjust `CACHE_TTL` in `.env` file
- Default cache times are set conservatively

## Next Steps

1. Test all endpoints
2. Monitor for any errors in console
3. Adjust cache times based on your needs
4. Add error notifications if desired
5. Consider adding a database for data persistence

## Support

Check the main README.md for detailed documentation and troubleshooting.



