import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Order } from '../../types';
import { WAREHOUSE_LOCATION } from '../../utils/geoUtils';
import { createWarehouseIcon, createCustomerIcon, createDriverVehicleIcon } from './LeafletIcons';
import { Clock, Gauge, ShieldCheck, Phone, Navigation } from 'lucide-react';

interface Props {
  order: Order;
  heightClass?: string;
  showDetailsBar?: boolean;
}

export const LiveTrackingMap: React.FC<Props> = ({
  order,
  heightClass = 'h-[400px]',
  showDetailsBar = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const projectedPolylineRef = useRef<L.Polyline | null>(null);

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
        attribution: '&copy; OpenStreetMap | Sol Clean GPS Telemetry',
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
            Punto de partida de la flota
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

      // Línea de Ruta Recorrida (Polyline azul sólida para seguridad / auditoría)
      const pathCoords = telemetry?.pathTraveled?.map((p) => [p.lat, p.lng] as [number, number]) || [
        [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng],
      ];

      const routePolyline = L.polyline(pathCoords, {
        color: '#0066cc',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routePolylineRef.current = routePolyline;

      // Línea proyectada hacia el cliente (punteada)
      const currentPos: [number, number] = telemetry
        ? [telemetry.currentPosition.lat, telemetry.currentPosition.lng]
        : [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng];

      const projectedPolyline = L.polyline(
        [currentPos, [order.deliveryLocation.lat, order.deliveryLocation.lng]],
        {
          color: '#94a3b8',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.7,
        }
      ).addTo(map);
      projectedPolylineRef.current = projectedPolyline;

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

  // Actualización reactiva de posición del vehículo y línea de ruta en tiempo real
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

    // Actualizar línea proyectada
    if (projectedPolylineRef.current) {
      projectedPolylineRef.current.setLatLngs([
        newPos,
        [order.deliveryLocation.lat, order.deliveryLocation.lng],
      ]);
    }
  }, [telemetry?.currentPosition?.lat, telemetry?.currentPosition?.lng, telemetry?.isMoving]);

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
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700">
                  {isEnCamino ? 'En Camino con GPS Activo' : isEntregado ? 'Pedido Entregado' : 'Asignado'}
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

      {/* Contenedor del mapa */}
      <div className={`relative w-full ${heightClass}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Leyenda flotante de seguridad en el mapa */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b pb-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Monitoreo de Seguridad</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Ruta recorrida trazada</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Ruta proyectada</span>
          </div>
          {telemetry?.phone && (
            <a
              href={`tel:${telemetry.phone}`}
              className="mt-1 pt-1 border-t flex items-center gap-1 text-blue-700 font-semibold hover:underline block"
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
