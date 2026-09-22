import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Order } from '../../types';
import { WAREHOUSE_LOCATION } from '../../utils/geoUtils';
import { createWarehouseIcon, createCustomerIcon, createDriverVehicleIcon } from './LeafletIcons';
import { Clock, Gauge, ShieldCheck, Phone, Navigation, Compass, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  order: Order;
  heightClass?: string;
  showDetailsBar?: boolean;
}

export const LiveTrackingMap: React.FC<Props> = ({
  order,
  heightClass = 'h-[420px]',
  showDetailsBar = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const plannedPolylineRef = useRef<L.Polyline | null>(null);

  const telemetry = order.telemetry;
  const isEnCamino = order.status === 'en_camino';
  const isEntregado = order.status === 'entregado';

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centro inicial: Almacén o posición del vehículo si existe
      const initialCenter: [number, number] = telemetry
        ? [telemetry.currentPosition.lat, telemetry.currentPosition.lng]
        : [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | Sol Clean GPS Telemetry & OSRM Streets',
        maxZoom: 19,
      }).addTo(map);

      // Marcador del Almacén Central
      L.marker([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], {
        icon: createWarehouseIcon(),
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <strong style="color: #0066cc;">Almacén Central Sol Clean</strong><br>
            <span>Av. Separadora Industrial / Nicolás de Ayllón</span><br>
            <em style="color: #64748b;">Punto de partida de la flota</em>
          </div>
        `);

      // Marcador del Cliente
      const clientMarker = L.marker(
        [order.deliveryLocation.lat, order.deliveryLocation.lng],
        { icon: createCustomerIcon(order.status) }
      )
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <strong style="color: #0066cc;">Destino: ${order.customer.name}</strong><br>
            <span>${order.deliveryLocation.address}</span><br>
            <em style="color: #64748b;">${order.deliveryLocation.reference}</em>
          </div>
        `);
      customerMarkerRef.current = clientMarker;

      // Trazo planificado de calles de Lima (Gris azulado con líneas de calzada)
      const plannedCoords: [number, number][] = telemetry?.plannedStreetRoute && telemetry.plannedStreetRoute.length > 0
        ? telemetry.plannedStreetRoute.map((p) => [p.lat, p.lng] as [number, number])
        : [
            [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng],
            [order.deliveryLocation.lat, order.deliveryLocation.lng],
          ];

      const plannedPolyline = L.polyline(plannedCoords, {
        color: '#64748b',
        weight: 6,
        opacity: 0.5,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      plannedPolylineRef.current = plannedPolyline;

      // Línea de Ruta Recorrida real por calles (Polyline azul sólida anti-desvíos)
      const pathCoords = telemetry?.pathTraveled?.map((p) => [p.lat, p.lng] as [number, number]) || [
        [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng],
      ];

      const routePolyline = L.polyline(pathCoords, {
        color: '#0066cc',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routePolylineRef.current = routePolyline;

      // Marcador del Repartidor (Camioneta con pulso en vivo)
      if (telemetry) {
        const driverMarker = L.marker(
          [telemetry.currentPosition.lat, telemetry.currentPosition.lng],
          {
            icon: createDriverVehicleIcon(telemetry.vehiclePlate, telemetry.isMoving),
          }
        ).addTo(map);

        driverMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0066cc;">${telemetry.vehicleModel}</strong><br>
            <span>Placa: <strong>${telemetry.vehiclePlate}</strong></span><br>
            <span>Conductor: ${telemetry.driverName}</span><br>
            <span style="color: #0284c7; font-weight: bold;">Calle actual: ${telemetry.currentStreet || 'En vía'}</span><br>
            <span style="color: #16a34a; font-weight: bold;">Velocidad: ${telemetry.speedKmh} km/h</span>
          </div>
        `);
        driverMarkerRef.current = driverMarker;

        // Ajustar vista para encuadrar Almacén, Repartidor y Cliente
        const group = L.featureGroup([clientMarker, driverMarker]);
        map.fitBounds(group.getBounds().pad(0.2));
      } else {
        map.setView([order.deliveryLocation.lat, order.deliveryLocation.lng], 14);
      }

      mapInstanceRef.current = map;
    }

    return () => {
      // Limpieza controlada
    };
  }, []);

  // Actualización reactiva de posición del vehículo, calles y línea de ruta en tiempo real
  useEffect(() => {
    if (!mapInstanceRef.current || !telemetry) return;

    const newPos: [number, number] = [
      telemetry.currentPosition.lat,
      telemetry.currentPosition.lng,
    ];

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(newPos);
      driverMarkerRef.current.setIcon(
        createDriverVehicleIcon(telemetry.vehiclePlate, telemetry.isMoving)
      );
      driverMarkerRef.current.setPopupContent(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0066cc;">${telemetry.vehicleModel}</strong><br>
          <span>Placa: <strong>${telemetry.vehiclePlate}</strong></span><br>
          <span>Conductor: ${telemetry.driverName}</span><br>
          <span style="color: #0284c7; font-weight: bold;">Calle actual: ${telemetry.currentStreet || 'En vía'}</span><br>
          <span style="color: #16a34a; font-weight: bold;">Velocidad: ${telemetry.speedKmh} km/h</span>
        </div>
      `);
    } else {
      const driverMarker = L.marker(newPos, {
        icon: createDriverVehicleIcon(telemetry.vehiclePlate, telemetry.isMoving),
      }).addTo(mapInstanceRef.current);
      driverMarkerRef.current = driverMarker;
    }

    // Actualizar trazo de ruta recorrida (Anti-robo / Auditoría)
    if (routePolylineRef.current && telemetry.pathTraveled) {
      const path = telemetry.pathTraveled.map((p) => [p.lat, p.lng] as [number, number]);
      routePolylineRef.current.setLatLngs(path);
    }

    // Actualizar trazo proyectado si llegaron waypoints reales de OSRM
    if (plannedPolylineRef.current && telemetry.plannedStreetRoute && telemetry.plannedStreetRoute.length > 0) {
      const planned = telemetry.plannedStreetRoute.map((p) => [p.lat, p.lng] as [number, number]);
      plannedPolylineRef.current.setLatLngs(planned);
    }
  }, [
    telemetry?.currentPosition?.lat,
    telemetry?.currentPosition?.lng,
    telemetry?.isMoving,
    telemetry?.currentStreet,
    telemetry?.plannedStreetRoute?.length,
  ]);

  const proximity = telemetry?.proximityAlert;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Barra de cabecera con telemetría en tiempo real */}
      {showDetailsBar && (
        <div className="bg-slate-900 text-white p-3 px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${isEnCamino ? 'bg-emerald-400 animate-ping' : isEntregado ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-blue-400 font-bold">{order.orderNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700 font-semibold">
                  {isEnCamino ? 'GPS Satelital Activo (OSRM)' : isEntregado ? 'Pedido Entregado' : 'Asignado'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Conductor: <strong>{telemetry?.driverName || order.assignedDriverName || 'Por asignar'}</strong> • {telemetry?.vehiclePlate || 'Unidad Sol Clean'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEnCamino && telemetry && (
              <>
                <div className="bg-blue-950/80 border border-blue-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <div>
                    <span className="text-[10px] text-blue-300 uppercase block font-semibold">Llegada Aprox. (ETA)</span>
                    <span className="text-sm font-extrabold text-amber-300">{telemetry.etaMinutes} min</span>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Velocidad</span>
                    <span className="text-sm font-extrabold text-white">{telemetry.speedKmh} km/h</span>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Distancia</span>
                    <span className="text-sm font-extrabold text-white">{telemetry.distanceRemainingKm} km</span>
                  </div>
                </div>
              </>
            )}

            {isEntregado && (
              <div className="bg-emerald-900/60 border border-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">Entrega completada sin incidentes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner HUD de Calle en Vivo y Notificación de Proximidad */}
      {isEnCamino && telemetry && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-2.5 border-t border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/80 border border-blue-400 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                  CALLE ACTUAL EN VIVO
                </span>
                {telemetry.nextStreet && (
                  <span className="text-[10px] text-slate-400 truncate">
                    Hacia: <strong className="text-slate-200">{telemetry.nextStreet}</strong>
                  </span>
                )}
              </div>
              <p className="font-bold text-white truncate text-xs sm:text-sm mt-0.5">
                🚗 {telemetry.currentStreet || 'Recorriendo avenidas de Lima'}
              </p>
            </div>
          </div>

          {proximity && (
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold shrink-0 border ${
              proximity.level === 'en_puerta'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 animate-bounce'
                : proximity.level === 'muy_cerca'
                ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-blue-950 text-blue-200 border-blue-700'
            }`}>
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] leading-tight">
                {proximity.level === 'en_puerta' && '¡En tu puerta!'}
                {proximity.level === 'muy_cerca' && '¡A pocas cuadras!'}
                {proximity.level === 'cerca' && 'En tu zona'}
                {proximity.level === 'en_camino' && 'En ruta'}
                {' • '}
                {telemetry.etaMinutes} min
              </span>
            </div>
          )}
        </div>
      )}

      {/* Contenedor del mapa */}
      <div className={`relative w-full ${heightClass}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Leyenda flotante de seguridad en el mapa */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-slate-200 text-[11px] space-y-1.5 max-w-[210px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b pb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Monitoreo de Calles</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="w-3 h-1.5 rounded bg-[#0066cc] inline-block" />
            <span>Ruta recorrida en calle</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-1.5 rounded bg-slate-400 border-b border-dashed inline-block" />
            <span>Giro planificado (OSRM)</span>
          </div>
          {telemetry?.currentStreet && (
            <div className="pt-1 border-t text-[10px] text-blue-700 font-semibold truncate">
              📍 {telemetry.currentStreet}
            </div>
          )}
          {telemetry?.phone && (
            <a
              href={`tel:${telemetry.phone}`}
              className="mt-1 pt-1 border-t flex items-center gap-1 text-blue-700 font-bold hover:underline block"
            >
              <Phone className="w-3 h-3" />
              <span>Llamar al chofer</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
