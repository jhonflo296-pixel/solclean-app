import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Order } from '../../types';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { formatPEN, formatDate } from '../../utils/formatters';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Play, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Gauge, 
  AlertTriangle,
  User,
  Compass
} from 'lucide-react';

export const DriverAppView: React.FC = () => {
  const { 
    orders, 
    workers, 
    startDriverRoute, 
    confirmDelivery, 
    stepSimulationForward,
    fastForwardSimulation
  } = useAppStore();

  const [selectedDriverId, setSelectedDriverId] = useState('driver-1');
  const [receivingPersonName, setReceivingPersonName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [confirmModalOrder, setConfirmModalOrder] = useState<Order | null>(null);

  const repartidores = workers.filter((w) => w.role === 'repartidor');
  const activeDriver = repartidores.find((d) => d.id === selectedDriverId) || repartidores[0];

  // Pedidos asignados a este chofer
  const driverOrders = orders.filter(
    (o) => o.assignedDriverId === activeDriver?.id || (!o.assignedDriverId && o.status === 'listo_despacho')
  );

  const currentActiveOrder = orders.find(
    (o) => o.assignedDriverId === activeDriver?.id && o.status === 'en_camino'
  );

  const handleStartRoute = (order: Order) => {
    startDriverRoute(order.id, activeDriver.id);
  };

  const handleOpenDeliveryModal = (order: Order) => {
    setConfirmModalOrder(order);
    setReceivingPersonName(order.customer.name);
  };

  const handleFinalizeDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModalOrder) return;

    confirmDelivery(confirmModalOrder.id, {
      receivedBy: receivingPersonName || 'Recepción / Cliente',
      notes: deliveryNotes,
    });

    setConfirmModalOrder(null);
    setDeliveryNotes('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Cabecera del Conductor / Repartidor */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Truck className="w-6 h-6 text-[#ffcc33]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#ffcc33] text-slate-950 px-2 py-0.5 rounded">
                MÓVIL CONDUCTOR
              </span>
              <span className="text-xs text-blue-300 font-mono">
                Placa: <strong>{activeDriver?.vehiclePlate || 'B6X-412'}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {activeDriver?.name || 'Conductor Repartidor'}
            </h2>
            <p className="text-xs text-slate-400">
              Unidad: Camioneta Hyundai H1 Sol Clean Logistics
            </p>
          </div>
        </div>

        {/* Selector de Conductor para pruebas */}
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-xs">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Cambiar Conductor:</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-900 text-white px-2.5 py-1 rounded border border-slate-600 focus:outline-none font-semibold"
          >
            {repartidores.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.vehiclePlate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PEDIDO EN RUTA ACTIVA (TELEMETRÍA EN TIEMPO REAL) */}
      {currentActiveOrder ? (
        <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-xl overflow-hidden space-y-4">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 block">
                  Transmitiendo GPS en Tiempo Real al Cliente y al Jefe de Almacén
                </span>
                <h3 className="text-base font-black">
                  Ruta en Curso: {currentActiveOrder.orderNumber} - {currentActiveOrder.customer.name}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => stepSimulationForward(currentActiveOrder.id)}
                title="Avanza 1 tramo en la ruta de Lima inmediatamente"
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition backdrop-blur-sm border border-white/20 active:scale-95 flex items-center gap-1"
              >
                <span>⏩ Avanzar 1 Paso GPS</span>
              </button>

              <button
                type="button"
                onClick={() => fastForwardSimulation(currentActiveOrder.id)}
                title="Ubica el camión en la puerta del cliente para entrega inmediata"
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shadow active:scale-95 flex items-center gap-1"
              >
                <span>🏁 Llegar a Puerta</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeliveryModal(currentActiveOrder)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Entrega</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Telemetría en Vivo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1 animate-spin" />
                <span className="text-[10px] text-blue-700 font-bold uppercase block">Tiempo al Cliente (ETA)</span>
                <span className="text-xl font-black text-blue-900">
                  {currentActiveOrder.telemetry?.etaMinutes || 10} min
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <Compass className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Distancia Restante</span>
                <span className="text-xl font-black text-slate-900">
                  {currentActiveOrder.telemetry?.distanceRemainingKm || 0} km
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <Gauge className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Velocidad Actual</span>
                <span className="text-xl font-black text-slate-900">
                  {currentActiveOrder.telemetry?.speedKmh || 30} km/h
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Auditoría Anti-Robo</span>
                <span className="text-xs font-bold text-emerald-800 block mt-1">
                  Ruta monitoreada por almacén
                </span>
              </div>
            </div>

            {/* Mapa con la camioneta y la línea de ruta recorrida trazada */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Navegación GPS y Ruta Recorrida en el Mapa</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Destino: {currentActiveOrder.deliveryLocation.address} ({currentActiveOrder.deliveryLocation.district})
                </span>
              </div>

              <LiveTrackingMap order={currentActiveOrder} heightClass="h-[380px]" showDetailsBar={false} />
            </div>

            {/* Botones de navegación externa */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>
                  <strong>Referencia cliente:</strong> {currentActiveOrder.deliveryLocation.reference || 'Sin referencia'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${currentActiveOrder.deliveryLocation.lat},${currentActiveOrder.deliveryLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition border border-slate-300 flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Abrir en Google Maps</span>
                </a>

                {currentActiveOrder.customer.phone && (
                  <a
                    href={`tel:${currentActiveOrder.customer.phone}`}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition border border-blue-200 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar al Cliente ({currentActiveOrder.customer.phone})</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <Truck className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-blue-900">
            No tienes ninguna ruta activa en este momento
          </h3>
          <p className="text-xs text-blue-700 mt-1 max-w-md mx-auto">
            Revisa abajo tu lista de pedidos asignados o listos para despacho en el almacén de Sol Clean y presiona "Iniciar Ruta" cuando estés listo para salir.
          </p>
        </div>
      )}

      {/* LISTA DE ENTREGAS ASIGNADAS AL CONDUCTOR */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Hoja de Ruta y Entregas Programadas ({driverOrders.length})</span>
        </h3>

        {driverOrders.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
            No tienes pedidos asignados para hoy. El jefe de almacén te asignará órdenes en cuanto salgan de picking.
          </div>
        ) : (
          <div className="space-y-3">
            {driverOrders.map((order) => {
              const isReady = order.status === 'listo_despacho';
              const isEnCamino = order.status === 'en_camino';
              const isDelivered = order.status === 'entregado';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isEnCamino ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isDelivered ? 'bg-emerald-100 text-emerald-800' : isEnCamino ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{order.customer.name}</h4>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <strong>{order.deliveryLocation.district}</strong>: {order.deliveryLocation.address}
                      </span>
                      <span className="text-slate-500">
                        Horario: {order.scheduledTimeWindow}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {isReady && !currentActiveOrder && (
                      <button
                        type="button"
                        onClick={() => handleStartRoute(order)}
                        className="w-full md:w-auto px-4 py-2.5 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-current text-[#ffcc33]" />
                        <span>Iniciar Ruta y Transmitir GPS</span>
                      </button>
                    )}

                    {isEnCamino && (
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                        Ruta en curso arriba
                      </span>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Entregado con Éxito
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Confirmar Entrega en Puerta del Cliente */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700 border-b pb-3">
              <CheckCircle2 className="w-7 h-7" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Confirmar Entrega en Destino
                </h3>
                <p className="text-xs text-slate-500">
                  Orden: {confirmModalOrder.orderNumber} - {confirmModalOrder.customer.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleFinalizeDelivery} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nombre de la persona que recibe el pedido *
                </label>
                <input
                  type="text"
                  required
                  value={receivingPersonName}
                  onChange={(e) => setReceivingPersonName(e.target.value)}
                  placeholder="Ej: Vigilante Pedro / Sra. Mariana"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observaciones o Notas de Entrega
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ej: Se entregó con guía de remisión firmada y sellada..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                <p>📍 <strong>Coordenadas GPS de Entrega:</strong> Registradas con éxito</p>
                <p>🕒 <strong>Hora de recepción:</strong> {new Date().toLocaleTimeString()}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOrder(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Guardar y Cerrar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
