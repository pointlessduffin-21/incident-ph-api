# Incident PH Frontend

A modern, responsive frontend dashboard for monitoring real-time incidents in the Philippines.

## Features

- **MMDA Traffic Alerts**: Real-time traffic information from Metro Manila Development Authority
- **PAGASA Weather**: Weather forecasts, severe weather warnings, and tropical cyclone bulletins
- **PHIVOLCS Data**: Earthquake monitoring and volcano status
- **ACLED Incidents**: Conflict and incident reports across the Philippines
- **Windy Typhoon Alerts**: Wind and gust monitoring with typhoon-level alerting powered by Windy.com
- **Local Weather & Typhoon Monitoring**: Live weather data for Pagbilao, Quezon with active typhoon tracking

## Tech Stack

- **Vue 3** with TypeScript
- **Vite** for fast development and builds
- **Pinia** for state management
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Naive UI** for UI components
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `localhost:6144`
- **OpenWeather API key** (required for Local Weather page)
- Windy.com API key stored in `VITE_WINDY_API_KEY`
- (Optional) QWeather API key stored in `VITE_QWEATHER_KEY` for additional typhoon warnings

### Environment variables

Create a `.env.local` file (or export variables in your shell) with the following entries:

```
VITE_OPENWEATHER_KEY=your_openweather_api_key_here
VITE_WINDY_API_KEY=your_windy_api_key_here
VITE_QWEATHER_KEY=your_qweather_api_key_here
```

**Getting API Keys:**
- **OpenWeather**: Sign up at https://openweathermap.org/api (free tier available)
- **QWeather**: Create account at https://dev.qweather.com (free non-commercial tier)
- **Windy**: Get API key from Windy.com

You can copy `.env.example` to `.env.local` and fill in your API keys.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   ├── views/               # Page views
│   ├── stores/              # Pinia stores for state management
│   ├── services/            # API service layer
│   ├── config/              # Configuration files
│   ├── router/              # Vue Router setup
│   ├── App.vue              # Root component
│   └── main.ts              # Application entry point
├── index.html
├── package.json
└── README.md
```

## API Configuration

The API base URL is configured in `src/config/api.ts`. By default, it points to `http://localhost:6144/api`.

## License

MIT
