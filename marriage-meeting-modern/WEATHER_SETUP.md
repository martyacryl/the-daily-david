# 🌤️ Weather Section Setup

The dashboard now includes a weather section that shows current conditions and a 5-day forecast to help with planning as a couple.

## 🆓 Free Weather API Setup

### Option 1: OpenWeatherMap (Recommended)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your environment variables:

```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### Option 2: Demo Mode (No API Key Required)
If you don't set up an API key, the weather section will show demo data for development.

## 🌍 Location Access

The weather section automatically detects your location using the browser's geolocation API. Users will be prompted to allow location access.

### Privacy Note
- Location is only used to fetch weather data
- No location data is stored or transmitted to our servers
- Weather data is fetched directly from the weather API

## 📱 Features

### Current Weather
- Temperature (actual and "feels like")
- Weather description and icon
- Humidity, wind speed, visibility
- Location name

### 5-Day Forecast
- Daily high/low temperatures
- Weather conditions and icons
- Precipitation probability
- Day-by-day planning view

### Planning Tips
- Automatic suggestions based on weather conditions
- Rain alerts for indoor activity planning
- Temperature-based recommendations
- Weekly planning guidance

## 🎨 Design
- Blue gradient theme for weather
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Clear visual hierarchy

## 🔄 Refresh
- Manual refresh button
- Automatic location-based updates
- Loading states and error handling

## 🚀 Deployment
The weather section works in both development and production:
- **Development**: Shows demo data if no API key
- **Production**: Uses real weather data with API key

Add your OpenWeatherMap API key to Vercel environment variables for production use!
