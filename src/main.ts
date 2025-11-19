import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Swagger imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Incident PH API')
    .setDescription(`
# Philippine Government Services API

A comprehensive REST API providing real-time access to Philippine government services data including:
- **MMDA Traffic Alerts** - Real-time Metro Manila traffic updates from Twitter
- **PAGASA Weather** - Weather forecasts and severe weather alerts
- **PHIVOLCS** - Earthquake and volcanic activity monitoring
- **ACLED** - Conflict and incident reports for the Philippines
- **Typhoon Tracking** - Real-time tropical cyclone data from JTWC and GDACS
- **Tide Forecasts** - Coastal tide predictions for Philippine locations
- **OpenWeather** - Comprehensive weather data and alerts
- **Windy** - Wind forecasts and typhoon risk analysis
- **QWeather** - Weather warnings and alerts

## Features
- Intelligent caching (5 min - 6 hours TTL)
- Multiple data source fallbacks
- Robust error handling
- RESTful API design
- Complete frontend-backend integration

## Data Sources
- MMDA: [@mmda Twitter](https://x.com/mmda)
- PAGASA: [@dost_pagasa Twitter](https://x.com/dost_pagasa)
- PHIVOLCS: [Official Website](https://earthquake.phivolcs.dost.gov.ph)
- ACLED: [API](https://api.acleddata.com)
- JTWC: [RSS Feed](https://www.metoc.navy.mil/jtwc/rss/jtwc.rss)
- GDACS: [API](https://www.gdacs.org/gdacsapi/)
- Tide Forecast: [tide-forecast.com](https://www.tide-forecast.com)
- OpenWeather: [API](https://openweathermap.org/api)
- Windy: [API](https://api.windy.com)
- QWeather: [API](https://dev.qweather.com)
    `)
    .setVersion('1.2.0')
    .addTag('API Info', 'General API information and available endpoints')
    .addTag('MMDA Traffic', 'Metro Manila Development Authority traffic alerts')
    .addTag('PAGASA Weather', 'Philippine weather forecasts and warnings')
    .addTag('PHIVOLCS Seismic', 'Earthquake and volcanic activity monitoring')
    .addTag('ACLED Incidents', 'Armed Conflict Location & Event Data')
    .addTag('Typhoon', 'Real-time tropical cyclone tracking and forecasts')
    .addTag('Tide Forecasts', 'Coastal tide predictions for Philippine locations')
    .addTag('OpenWeather', 'Comprehensive weather data and alerts from OpenWeather API')
    .addTag('Windy', 'Wind forecasts and typhoon risk analysis from Windy.com')
    .addTag('QWeather', 'Weather warnings and alerts from QWeather API')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();



