export const apiKey = process.env.API_KEY;
export const urlBase = process.env.URL_BASE;
export const urlBack =window.location.hostname.includes('localhost')
  ? 'http://localhost:4000'
  : 'https://cinetrack-api-skea.onrender.com';
