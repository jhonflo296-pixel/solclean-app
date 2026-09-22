import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Order } from '../../types';
import { WAREHOUSE_LOCATION } from '../../utils/geoUtils';
import { createWarehouseIcon, createCustomerIcon, createDriverVehicleIcon } from './LeafletIcons';
import { Truck, MapPin, Clock } from 'lucide-react';

interface Props {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export const WarehouseFleetOverviewMap: React.FC<Props> = ({
  orders,
  onSelectOrder,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng],
        zoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | Sol Clean Perú Dispatch Fleet',
        maxZoom: 19,
      }).addTo(map);

      // Almacén central
      L.marker([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng], {
        icon: createWarehouseIcon(),
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <strong style="color: #0066cc;">Almacén Central Sol Clean</strong><br>
            Base de operaciones y centro de distribución
          </div>
        `);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Limpieza
    };
  }, []);

  // Actualizar marcadores de pedidos y unidades cuando cambian los pedidos
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const boundsPoints: [number, number][] = [[WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng]];

    orders.forEach((order) => {
      // Marcador del Cliente
      const clientMarker = L.marker(
        [order.deliveryLocation.lat, order.deliveryLocation.lng],
        { icon: createCustomerIcon(order.status) }
      );

      clientMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; max-width: 220px; line-height: 1.4;">
          <div style="font-weight: bold; color: #0066cc;">${order.orderNumber} - ${order.customer.name}</div>
          <div style="font-size: 11px; color: #475569; margin: 3px 0;">${order.deliveryLocation.address} (${order.deliveryLocation.district})</div>
          <div style="font-size: 11px; margin-top: 4px;">
            Estado: <strong>${order.status.toUpperCase()}</strong><br>
            Entrega: <strong>${order.scheduledDate} (${order.scheduledTimeWindow})</strong>
          </div>
          <button id="btn-inspect-${order.id}" style="
            margin-top: 8px;
            width: 100%;
            background: #0066cc;
            color: white;
            border: none;
            padding: 5px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
          ">
            Ver Ficha del Pedido
          </button>
        </div>
      `);

      clientMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${order.id}`);
        if (btn && onSelectOrder) {
          btn.onclick = () => onSelectOrder(order);
        }
      });

      markersLayerRef.current?.addLayer(clientMarker);
      boundsPoints.push([order.deliveryLocation.lat, order.deliveryLocation.lng]);

      // Si tiene vehículo con telemetría en movimiento
      if (order.status === 'en_camino' && order.telemetry) {
        const tel = order.telemetry;
        const vehicleMarker = L.marker([tel.currentPosition.lat, tel.currentPosition.lng], {
          icon: createDriverVehicleIcon(tel.vehiclePlate, tel.isMoving),
        });

        vehicleMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <strong style="color: #0066cc;">Repartidor: ${tel.driverName}</strong><br>
            Placa: <strong>${tel.vehiclePlate}</strong><br>
            Velocidad: <strong>${tel.speedKmh} km/h</strong><br>
            Tiempo estimado: <strong>${tel.etaMinutes} min</strong><br>
            Entregando a: ${order.customer.name}
          </div>
        `);

        markersLayerRef.current?.addLayer(vehicleMarker);
        boundsPoints.push([tel.currentPosition.lat, tel.currentPosition.lng]);

        // Trazo de ruta recorrida en el mapa general
        if (tel.pathTraveled && tel.pathTraveled.length > 1) {
          const path = tel.pathTraveled.map((p) => [p.lat, p.lng] as [number, number]);
          const polyline = L.polyline(path, {
            color: '#0066cc',
            weight: 3,
            opacity: 0.7,
          });
          markersLayerRef.current?.addLayer(polyline);
        }
      }
    });

    if (boundsPoints.length > 1 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(boundsPoints).pad(0.15));
    }
  }, [orders]);

  const activeVehiclesCount = orders.filter((o) => o.status === 'en_camino').length;
  const pendingCount = orders.filter((o) => o.status === 'pendiente').length;

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-300 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating control widget */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200 text-xs flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span className="text-slate-600 font-medium">En ruta activa:</span>
          <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
            {activeVehiclesCount} unidades
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-slate-600 font-medium">Pendientes:</span>
          <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        </div>
      </div>
    </div>
  );
};
