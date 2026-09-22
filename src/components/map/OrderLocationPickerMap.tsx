import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoCoordinate, DeliveryLocation } from '../../types';
import { WAREHOUSE_LOCATION, calculateDistanceKm } from '../../utils/geoUtils';
import { LIMA_DISTRICT_SUGGESTIONS } from '../../data/mockData';
import { createWarehouseIcon, createCustomerIcon } from './LeafletIcons';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface Props {
  selectedLocation: DeliveryLocation;
  onChangeLocation: (location: Partial<DeliveryLocation>) => void;
}

export const OrderLocationPickerMap: React.FC<Props> = ({
  selectedLocation,
  onChangeLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Distancia calculada al almacén central
  const distanceToWarehouse = calculateDistanceKm(WAREHOUSE_LOCATION, selectedLocation);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Inicializar mapa centrado en la ubicación seleccionada
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 14,
        zoomControl: true,
      });

      // Capa de teselas OpenStreetMap con estilo limpio
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contribuyentes | Sol Clean Logistics',
        maxZoom: 19,
      }).addTo(map);

      // Marcador del Almacén Central
      const warehouseMarker = L.marker([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], {
        icon: createWarehouseIcon(),
      }).addTo(map);

      warehouseMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #0066cc;">${WAREHOUSE_LOCATION.name}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">${WAREHOUSE_LOCATION.address}</p>
          <div style="margin-top: 6px; font-size: 11px; color: #16a34a; font-weight: bold;">Centro de Despacho Principal</div>
        </div>
      `);

      // Marcador interactivo del Cliente (Draggable)
      const customerMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: createCustomerIcon('pendiente'),
        draggable: true,
      }).addTo(map);

      customerMarker.on('dragend', (e) => {
        const marker = e.target as L.Marker;
        const position = marker.getLatLng();
        onChangeLocation({
          lat: Number(position.lat.toFixed(6)),
          lng: Number(position.lng.toFixed(6)),
        });
      });

      // Permitir hacer clic en cualquier punto del mapa para mover el pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        customerMarker.setLatLng([lat, lng]);
        onChangeLocation({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = customerMarker;
    }

    return () => {
      // Limpieza controlada
    };
  }, []);

  // Actualizar posición del marcador si cambian las coordenadas desde fuera (ej: selector rápido)
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - selectedLocation.lat) > 0.0001 ||
        Math.abs(currentPos.lng - selectedLocation.lng) > 0.0001
      ) {
        markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
        mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 15, {
          duration: 1,
        });
      }
    }
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChangeLocation({
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
        });
        setIsDetectingGPS(false);
      },
      (err) => {
        setIsDetectingGPS(false);
        setGpsError('No se pudo acceder a tu GPS. Por favor arrastra el pin en el mapa.');
        console.warn('GPS Error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectDistrict = (item: (typeof LIMA_DISTRICT_SUGGESTIONS)[0]) => {
    onChangeLocation({
      lat: item.lat,
      lng: item.lng,
      district: item.name,
      reference: item.reference,
    });
  };

  return (
    <div className="space-y-3">
      {/* Barra de herramientas de geolocalización */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600 animate-bounce" />
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              Punto Exacto de Entrega en Lima
            </span>
            <span className="text-xs text-blue-700">
              Arrastra el pin rojo en el mapa o haz clic en tu calle
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isDetectingGPS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin' : ''}`} />
          {isDetectingGPS ? 'Detectando GPS...' : 'Usar mi GPS Actual'}
        </button>
      </div>

      {gpsError && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Badge flotante de distancia al almacén */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-600" />
          <span className="text-slate-600">Distancia desde Almacén:</span>
          <strong className="text-blue-900 font-bold">{distanceToWarehouse} km</strong>
        </div>
      </div>

      {/* Accesos rápidos a distritos de Lima */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
          Ubicaciones Rápidas en Lima / Callao:
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {LIMA_DISTRICT_SUGGESTIONS.map((dist) => (
            <button
              key={dist.name}
              type="button"
              onClick={() => handleSelectDistrict(dist)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-800 border border-slate-200 transition text-slate-700 font-medium"
            >
              {dist.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
