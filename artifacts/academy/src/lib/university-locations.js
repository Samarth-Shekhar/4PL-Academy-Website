// Directory map positions are city centres, never surveyed campus addresses.
const CITY_CENTRES = {
  gurugram: { latitude: 28.4595, longitude: 77.0266 },
  gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
};

const number = (value) => value == null || value === '' ? NaN : Number(value);
export const hasMapCoordinates = (u) => {
  const lat = number(u.latitude), lon = number(u.longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98;
};

export function universityMapLocation(u) {
  if (hasMapCoordinates(u)) return u;
  const city = String(u.city || u.location || '').trim().toLowerCase();
  const point = CITY_CENTRES[city];
  return point ? { ...u, ...point, coordinateAccuracy: 'city-centre' } : u;
}
