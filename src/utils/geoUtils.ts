import { GeoCoordinate, StreetWaypoint, ProximityAlert } from '../types';

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
  if (distanceKm <= 0.15) return 1;
  const hours = distanceKm / Math.max(speedKmh, 15);
  const minutes = Math.ceil(hours * 60) + 2; // +2 minutos de margen de maniobra
  return Math.max(minutes, 1);
}

/**
 * Genera el estado de alerta de proximidad para el cliente indicando calle y cercanía
 */
export function computeProximityAlert(
  remainingKm: number,
  etaMinutes: number,
  currentStreet: string,
  driverName: string
): ProximityAlert {
  const streetDisplay = currentStreet ? `por ${currentStreet}` : 'en dirección a tu entrega';
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (remainingKm <= 0.15) {
    return {
      level: 'en_puerta',
      message: `¡Tu pedido ha llegado! El conductor ${driverName} está estacionando en tu puerta (${currentStreet || 'tu dirección'}).`,
      streetName: currentStreet || 'En tu puerta',
      etaMinutes: 1,
      timestamp: nowStr,
    };
  }

  if (remainingKm <= 0.8 || etaMinutes <= 3) {
    return {
      level: 'muy_cerca',
      message: `¡Tu pedido está a solo 2-3 cuadras! El vehículo circula ${streetDisplay} y llegará en aproximadamente ${etaMinutes} min.`,
      streetName: currentStreet || 'A pocas cuadras',
      etaMinutes,
      timestamp: nowStr,
    };
  }

  if (remainingKm <= 2.5 || etaMinutes <= 8) {
    return {
      level: 'cerca',
      message: `¡Tu pedido está cerca! El repartidor ya ingresó a tu zona y avanza ${streetDisplay} (aprox. ${etaMinutes} min).`,
      streetName: currentStreet || 'Zona cercana',
      etaMinutes,
      timestamp: nowStr,
    };
  }

  return {
    level: 'en_camino',
    message: `Tu pedido está en camino: El vehículo avanza ${streetDisplay}. Tiempo estimado de llegada: ${etaMinutes} min.`,
    streetName: currentStreet || 'En ruta',
    etaMinutes,
    timestamp: nowStr,
  };
}

/**
 * Obtiene la ruta REAL por las calles y avenidas de Lima usando el motor OSRM
 * (Open Source Routing Machine). Devuelve cada punto con el nombre de la calle real.
 */
export async function fetchRealStreetRoute(
  start: GeoCoordinate,
  destination: GeoCoordinate
): Promise<StreetWaypoint[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM service response not ok');

    const data = await res.json();
    if (!data.routes || !data.routes[0]) throw new Error('No route found');

    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates; // [lng, lat]
    const steps: Array<{ name: string; geometry: any; distance: number }> = route.legs[0].steps;

    // Mapear cada coordenada al nombre de la calle del tramo (step) correspondiente
    const waypoints: StreetWaypoint[] = [];
    let currentStepIdx = 0;

    for (let i = 0; i < coordinates.length; i++) {
      const [lng, lat] = coordinates[i];

      // Determinar nombre de calle según el paso
      let streetName = 'Vía Urbana de Lima';
      if (steps && steps.length > 0) {
        const stepProgress = Math.min(
          Math.floor((i / coordinates.length) * steps.length),
          steps.length - 1
        );
        const candidateName = steps[stepProgress]?.name;
        if (candidateName && candidateName.trim().length > 0) {
          streetName = candidateName;
        } else if (steps[0]?.name) {
          streetName = steps[0].name;
        }
      }

      waypoints.push({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        streetName,
      });
    }

    if (waypoints.length >= 2) {
      return waypoints;
    }
  } catch (err) {
    console.warn('Fallback a generador de calles de Lima por indisponibilidad de OSRM:', err);
  }

  // Fallback con avenidas emblemáticas de Lima si OSRM tarda o no responde
  return generateLimaStreetFallbackWaypoints(start, destination);
}

/**
 * Generador de respaldo de tramos urbanos con nombres de avenidas de Lima
 */
export function generateLimaStreetFallbackWaypoints(
  start: GeoCoordinate,
  destination: GeoCoordinate,
  totalSteps: number = 30
): StreetWaypoint[] {
  const limaAvenues = [
    'Av. Nicolás de Ayllón',
    'Av. Separadora Industrial',
    'Av. México',
    'Av. Nicolás Arriola',
    'Av. Aviación',
    'Av. Javier Prado Este',
    'Vía Expresa Luis Fernán Bedoya Reyes',
    'Av. Paseo de la República',
    'Av. Angamos Este',
    'Av. Benavides',
    'Av. José Larco',
  ];

  const waypoints: StreetWaypoint[] = [];
  const midLat = (start.lat + destination.lat) / 2;
  const midLng = (start.lng + destination.lng) / 2;
  const offset = 0.005 * (start.lng > destination.lng ? 1 : -1);

  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * (midLat + offset) + t * t * destination.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * (midLng - offset) + t * t * destination.lng;

    const aveIndex = Math.min(
      Math.floor(t * limaAvenues.length),
      limaAvenues.length - 1
    );

    waypoints.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      streetName: limaAvenues[aveIndex],
    });
  }

  return waypoints;
}

/**
 * Genera puntos intermedios simples (compatibilidad)
 */
export function generateRouteWaypoints(
  start: GeoCoordinate,
  destination: GeoCoordinate,
  steps: number = 20
): GeoCoordinate[] {
  return generateLimaStreetFallbackWaypoints(start, destination, steps);
}

/**
 * Formatea coordenadas a texto legible
 */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
