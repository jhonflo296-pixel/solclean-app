import { GeoCoordinate } from '../types';

// Almacén Central de Sol Clean Perú en Lima
export const WAREHOUSE_LOCATION: GeoCoordinate & { name: string; address: string } = {
  lat: -12.0583,
  lng: -76.9934,
  name: 'Planta & Almacén Central Sol Clean Perú',
  address: 'Av. Nicolás de Ayllón / Av. Separadora Industrial, Lima',
};

/**
 * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula Haversine
 */
export function calculateDistanceKm(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Calcula el tiempo estimado de llegada (ETA) en minutos considerando tráfico urbano de Lima
 */
export function calculateEtaMinutes(distanceKm: number, speedKmh: number = 28): number {
  if (distanceKm <= 0.2) return 1;
  const hours = distanceKm / Math.max(speedKmh, 15);
  const minutes = Math.ceil(hours * 60) + 3; // +3 minutos de margen de parqueo y entrega
  return Math.max(minutes, 2);
}

/**
 * Genera puntos intermedios (waypoints) para simular un recorrido continuo por las avenidas
 */
export function generateRouteWaypoints(
  start: GeoCoordinate,
  destination: GeoCoordinate,
  steps: number = 20
): GeoCoordinate[] {
  const waypoints: GeoCoordinate[] = [];
  
  // Agregar una pequeña curvatura que simule vías urbanas
  const midLat = (start.lat + destination.lat) / 2;
  const midLng = (start.lng + destination.lng) / 2;
  const offset = 0.004 * (start.lng > destination.lng ? 1 : -1);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Curva Bezier cuadrática para que no sea una línea recta rígida
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * (midLat + offset) + t * t * destination.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * (midLng - offset) + t * t * destination.lng;
    
    waypoints.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    });
  }

  return waypoints;
}

/**
 * Formatea coordenadas a texto legible
 */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
