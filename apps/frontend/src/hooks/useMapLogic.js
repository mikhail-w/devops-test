import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const LIBRARIES = ['places']; // Define libraries as a constant outside

const useMapLogic = () => {
  const apiKey = window._env_?.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('Google Maps API Key:', apiKey); // Debug line to check the key
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES, // Use the constant
  });

  if (loadError) {
    console.error('Google Maps load error:', loadError);
  }

  return { isLoaded, loadError };
};

export default useMapLogic;
