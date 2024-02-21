import type { FC } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

interface GoogleMapProps {
  location: {
    latitude: number
    longitude: number
  }
  height?: number
}

const GoogleMap: FC<GoogleMapProps> = ({ location, height = 450 }) => {
  const { latitude, longitude } = location
  return (
    <iframe
      width="100%"
      height={height}
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${latitude},${longitude}`}
    />
  )
}

export default GoogleMap
