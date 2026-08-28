# CycleStar

A 100% client-side web app for cyclists. Drop a GPX file, set your start time and average speed, and instantly see whether to ride your loop **clockwise** or **counter-clockwise** based on wind.

## Features

- GPX route parsing (client-side, no uploads)
- Open-Meteo hourly wind forecast integration
- Per-segment headwind / crosswind / tailwind analysis
- Color-coded Leaflet map with wind direction arrows
- Clockwise vs counter-clockwise comparison

## Privacy

Your GPX file never leaves your browser. Only route coordinates are sent to the free Open-Meteo API for weather data.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Leaflet + React-Leaflet
- Turf.js for spatial calculations
- @tmcw/togeojson for GPX parsing
- Open-Meteo Weather Forecast API
