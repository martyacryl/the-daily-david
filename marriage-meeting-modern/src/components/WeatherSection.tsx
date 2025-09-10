import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Eye, 
  Thermometer,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useSettingsStore } from '../stores/settingsStore'

interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    wind_speed: number
    visibility: number
  }
  location: {
    name: string
    country: string
  }
  forecast: Array<{
    date: string
    day: string
    temp_max: number
    temp_min: number
    description: string
    icon: string
    precipitation: number
  }>
}

interface WeatherSectionProps {
  className?: string
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ className = '' }) => {
  const { settings } = useSettingsStore()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [manualLocation, setManualLocation] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  // Get weather icon component
  const getWeatherIcon = (iconCode: string, size: string = 'w-6 h-6') => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      '01d': Sun,    // clear sky day
      '01n': Sun,    // clear sky night
      '02d': Cloud,  // few clouds day
      '02n': Cloud,  // few clouds night
      '03d': Cloud,  // scattered clouds
      '03n': Cloud,  // scattered clouds
      '04d': Cloud,  // broken clouds
      '04n': Cloud,  // broken clouds
      '09d': CloudRain, // shower rain
      '09n': CloudRain, // shower rain
      '10d': CloudRain, // rain day
      '10n': CloudRain, // rain night
      '11d': CloudRain, // thunderstorm
      '11n': CloudRain, // thunderstorm
      '13d': CloudSnow, // snow
      '13n': CloudSnow, // snow
      '50d': Cloud,  // mist
      '50n': Cloud,  // mist
    }
    
    const IconComponent = iconMap[iconCode] || Cloud
    return <IconComponent className={size} />
  }

  // Get location from browser with better mobile support
  const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // More specific error messages for mobile
          let errorMessage = 'Unable to get your location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: false, // Use less accurate but faster location for mobile
          timeout: 15000, // Longer timeout for mobile
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Fetch weather data
  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)

    try {
      // Using OpenWeatherMap API (free tier)
      // You'll need to get a free API key from https://openweathermap.org/api
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key'
      
      if (API_KEY === 'demo_key') {
        // Demo data for development
        setWeather({
          current: {
            temp: 72,
            feels_like: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: '02d',
            wind_speed: 8,
            visibility: 10
          },
          location: {
            name: 'Your City',
            country: 'US'
          },
          forecast: [
            { date: '2024-01-15', day: 'Mon', temp_max: 75, temp_min: 60, description: 'Sunny', icon: '01d', precipitation: 0 },
            { date: '2024-01-16', day: 'Tue', temp_max: 78, temp_min: 62, description: 'Partly cloudy', icon: '02d', precipitation: 10 },
            { date: '2024-01-17', day: 'Wed', temp_max: 70, temp_min: 55, description: 'Light rain', icon: '10d', precipitation: 60 },
            { date: '2024-01-18', day: 'Thu', temp_max: 68, temp_min: 52, description: 'Cloudy', icon: '04d', precipitation: 20 },
            { date: '2024-01-19', day: 'Fri', temp_max: 73, temp_min: 58, description: 'Clear', icon: '01d', precipitation: 0 }
          ]
        })
        setLoading(false)
        return
      }

      // Real API call with better error handling
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Weather API error:', response.status, errorData)
        
        if (response.status === 401) {
          throw new Error('Weather API key is invalid. Using demo data.')
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.')
        } else {
          throw new Error(`Weather service unavailable (${response.status}). Using demo data.`)
        }
      }

      const currentData = await response.json()

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      )
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data')
      }

      const forecastData = await forecastResponse.json()

      // Process forecast data (group by day and get daily max/min)
      const dailyForecast = forecastData.list.reduce((acc: any, item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0]
        const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
        
        if (!acc[date]) {
          acc[date] = {
            date,
            day,
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_min,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            precipitation: item.pop * 100
          }
        } else {
          acc[date].temp_max = Math.max(acc[date].temp_max, item.main.temp_max)
          acc[date].temp_min = Math.min(acc[date].temp_min, item.main.temp_min)
        }
        
        return acc
      }, {})

      const forecast = Object.values(dailyForecast).slice(0, 5)

      setWeather({
        current: {
          temp: Math.round(currentData.main.temp),
          feels_like: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          wind_speed: Math.round(currentData.wind.speed),
          visibility: Math.round((currentData.visibility || 10000) / 1609.34) // Convert meters to miles
        },
        location: {
          name: currentData.name,
          country: currentData.sys.country
        },
        forecast: forecast as any[]
      })

    } catch (err) {
      console.error('Weather fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      
      // If API fails, fall back to demo data
      if (errorMessage.includes('API key') || errorMessage.includes('unavailable')) {
        console.log('Falling back to demo weather data')
        setWeather({
          current: {
            temp: 72,
            feels_like: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: '02d',
            wind_speed: 8,
            visibility: 10
          },
          location: {
            name: 'Demo Location',
            country: 'US'
          },
          forecast: [
            { date: '2024-01-15', day: 'Mon', temp_max: 75, temp_min: 60, description: 'Sunny', icon: '01d', precipitation: 0 },
            { date: '2024-01-16', day: 'Tue', temp_max: 78, temp_min: 62, description: 'Partly cloudy', icon: '02d', precipitation: 10 },
            { date: '2024-01-17', day: 'Wed', temp_max: 70, temp_min: 55, description: 'Light rain', icon: '10d', precipitation: 60 },
            { date: '2024-01-18', day: 'Thu', temp_max: 68, temp_min: 52, description: 'Cloudy', icon: '04d', precipitation: 20 },
            { date: '2024-01-19', day: 'Fri', temp_max: 73, temp_min: 58, description: 'Clear', icon: '01d', precipitation: 0 }
          ]
        })
        setError(null) // Clear error since we're showing demo data
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Load weather on component mount
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const coords = await getCurrentLocation()
        setLocation(coords)
        await fetchWeather(coords.lat, coords.lon)
      } catch (err) {
        console.error('Location error:', err)
        
        // Try to use settings location as fallback
        if (settings.location.city && settings.location.state) {
          const cityName = `${settings.location.city}, ${settings.location.state}`
          console.log('Using settings location as fallback:', cityName)
          setError(null)
          await fetchWeatherByCity(cityName)
        } else {
          // Show manual input if no settings location
          setShowManualInput(true)
          setError('Location access needed. Enter your city below:')
        }
      }
    }

    // Add a small delay to let the component mount properly
    const timer = setTimeout(loadWeather, 100)
    return () => clearTimeout(timer)
  }, [settings.location.city, settings.location.state])

  // Fetch weather by city name
  const fetchWeatherByCity = async (cityName: string) => {
    setLoading(true)
    setError(null)

    try {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key'
      
      if (API_KEY === 'demo_key') {
        // Demo data for development
        setWeather({
          current: {
            temp: 72,
            feels_like: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: '02d',
            wind_speed: 8,
            visibility: 10
          },
          location: {
            name: cityName || 'Your City',
            country: 'US'
          },
          forecast: [
            { date: '2024-01-15', day: 'Mon', temp_max: 75, temp_min: 60, description: 'Sunny', icon: '01d', precipitation: 0 },
            { date: '2024-01-16', day: 'Tue', temp_max: 78, temp_min: 62, description: 'Partly cloudy', icon: '02d', precipitation: 10 },
            { date: '2024-01-17', day: 'Wed', temp_max: 70, temp_min: 55, description: 'Light rain', icon: '10d', precipitation: 60 },
            { date: '2024-01-18', day: 'Thu', temp_max: 68, temp_min: 52, description: 'Cloudy', icon: '04d', precipitation: 20 },
            { date: '2024-01-19', day: 'Fri', temp_max: 73, temp_min: 58, description: 'Clear', icon: '01d', precipitation: 0 }
          ]
        })
        setLoading(false)
        return
      }

      // Real API call by city name
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`
      )
      
      if (!response.ok) {
        throw new Error('City not found. Please check the spelling.')
      }

      const currentData = await response.json()

      // Fetch 5-day forecast by city
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`
      )
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data')
      }

      const forecastData = await forecastResponse.json()

      // Process forecast data (same as before)
      const dailyForecast = forecastData.list.reduce((acc: any, item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0]
        const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
        
        if (!acc[date]) {
          acc[date] = {
            date,
            day,
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_min,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            precipitation: item.pop * 100
          }
        } else {
          acc[date].temp_max = Math.max(acc[date].temp_max, item.main.temp_max)
          acc[date].temp_min = Math.min(acc[date].temp_min, item.main.temp_min)
        }
        
        return acc
      }, {})

      const forecast = Object.values(dailyForecast).slice(0, 5)

      setWeather({
        current: {
          temp: Math.round(currentData.main.temp),
          feels_like: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          wind_speed: Math.round(currentData.wind.speed),
          visibility: Math.round((currentData.visibility || 10000) / 1609.34)
        },
        location: {
          name: currentData.name,
          country: currentData.sys.country
        },
        forecast: forecast as any[]
      })

      setShowManualInput(false)

    } catch (err) {
      console.error('Weather fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      
      // If API fails, fall back to demo data
      if (errorMessage.includes('API key') || errorMessage.includes('unavailable')) {
        console.log('Falling back to demo weather data')
        setWeather({
          current: {
            temp: 72,
            feels_like: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: '02d',
            wind_speed: 8,
            visibility: 10
          },
          location: {
            name: 'Demo Location',
            country: 'US'
          },
          forecast: [
            { date: '2024-01-15', day: 'Mon', temp_max: 75, temp_min: 60, description: 'Sunny', icon: '01d', precipitation: 0 },
            { date: '2024-01-16', day: 'Tue', temp_max: 78, temp_min: 62, description: 'Partly cloudy', icon: '02d', precipitation: 10 },
            { date: '2024-01-17', day: 'Wed', temp_max: 70, temp_min: 55, description: 'Light rain', icon: '10d', precipitation: 60 },
            { date: '2024-01-18', day: 'Thu', temp_max: 68, temp_min: 52, description: 'Cloudy', icon: '04d', precipitation: 20 },
            { date: '2024-01-19', day: 'Fri', temp_max: 73, temp_min: 58, description: 'Clear', icon: '01d', precipitation: 0 }
          ]
        })
        setError(null) // Clear error since we're showing demo data
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Refresh weather
  const handleRefresh = async () => {
    if (location) {
      await fetchWeather(location.lat, location.lon)
    }
  }

  if (loading && !weather) {
    return (
      <Card className={`p-2 ${className}`}>
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="w-3 h-3 animate-spin text-blue-600 mr-1" />
          <span className="text-xs text-gray-600">Loading...</span>
        </div>
      </Card>
    )
  }

  if (error && !weather) {
    return (
      <Card className={`p-2 ${className}`}>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-red-600">
            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-xs block">{error}</span>
            </div>
          </div>
          
          {showManualInput && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Enter your city name:</p>
              <div className="flex flex-col sm:flex-row gap-1">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g., New York, London, Tokyo"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && manualLocation.trim()) {
                      fetchWeatherByCity(manualLocation.trim())
                    }
                  }}
                />
                <Button
                  onClick={() => fetchWeatherByCity(manualLocation.trim())}
                  disabled={!manualLocation.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs"
                >
                  {loading ? 'Loading...' : 'Get Weather'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Try: "City, State" or "City, Country" format
              </p>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={className}
    >
      <Card className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        {/* Header - Ultra Slim */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-0.5 min-w-0 flex-1">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 flex-shrink-0" />
            <h3 className="text-xs font-medium text-gray-900 truncate">
              {weather.location.name}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 p-0.5 h-4 w-4 flex-shrink-0 ml-1"
          >
            <RefreshCw className={`w-2 h-2 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Current Weather - Ultra Slim */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getWeatherIcon(weather.current.icon, 'w-3 h-3 sm:w-4 sm:h-4')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-bold text-gray-900">
                {weather.current.temp}°F
              </div>
              <div className="text-xs text-gray-600 capitalize truncate">
                {weather.current.description}
              </div>
            </div>
          </div>
          
          <div className="text-right text-xs text-gray-600 flex-shrink-0 ml-1">
            <div className="flex items-center gap-0.5">
              <Droplets className="w-2 h-2" />
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Wind className="w-2 h-2" />
              <span>{weather.current.wind_speed}</span>
            </div>
          </div>
        </div>

        {/* Weekly Forecast - Ultra Slim */}
        <div className="grid grid-cols-5 gap-0">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-0.5 truncate">
                {day.day}
              </div>
              <div className="mb-0.5">
                {getWeatherIcon(day.icon, 'w-2.5 h-2.5 sm:w-3 sm:h-3 mx-auto')}
              </div>
              <div className="text-xs font-semibold text-gray-900">
                {day.temp_max}°
              </div>
              <div className="text-xs text-gray-500">
                {day.temp_min}°
              </div>
              {day.precipitation > 30 && (
                <div className="text-xs text-blue-600">
                  {Math.round(day.precipitation)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
