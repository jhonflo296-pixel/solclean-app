import React from 'react';
import { Order } from '../../types';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { formatPEN, formatDate, getStatusDetails } from '../../utils/formatters';
import { 
  X, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  PackageCheck
} from 'lucide-react';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<Props> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const statusInfo = getStatusDetails(order.status);
  const telemetry = order.telemetry;

  const stages = [
    { title: 'Pedido Recibido', desc: 'Registrado en almacén', step: 1 },
    { title: 'En Preparación', desc: 'Picking de productos', step: 2 },
    { title: 'Listo para Despacho', desc: 'Embalado y asignado', step: 3 },
    { title: 'En Camino (GPS)', desc: 'Repartidor en ruta', step: 4 },
    { title: 'Entregado', desc: 'Comprobado en destino', step: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">
                  Rastreo en Vivo: {order.orderNumber}
                </h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cliente: <strong>{order.customer.name}</strong> • Entrega programada: {formatDate(order.scheduledDate)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Stepper horizontal de estado */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-5 gap-2 text-center">
              {stages.map((st) => {
                const isPassed = statusInfo.stepNumber >= st.step;
                const isCurrent = statusInfo.stepNumber === st.step;
                return (
                  <div key={st.step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition mb-1.5 ${
                        isPassed
                          ? isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow'
                            : 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        st.step
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold leading-tight ${
                        isCurrent
                          ? 'text-blue-700'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </span>
                    <span className="text-[10px] text-slate-600 hidden sm:inline mt-0.5">
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensaje dinámico al cliente según estado */}
          {order.status === 'en_camino' && telemetry && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black animate-pulse">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                    ¡Tu pedido está en camino hacia tu dirección!
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    El repartidor <strong>{telemetry.driverName}</strong> ({telemetry.vehiclePlate}) está a{' '}
                    <span className="text-amber-300 font-black">{telemetry.distanceRemainingKm} km</span> de tu entrega.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 text-center">
                <span className="text-[10px] uppercase text-blue-200 block font-semibold">Tiempo Estimado (ETA)</span>
                <span className="text-2xl font-black text-amber-300">{telemetry.etaMinutes} min</span>
              </div>
            </div>
          )}

          {/* Mapa con GPS en tiempo real */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0066cc]" />
                <span>Ubicación Satelital y Trayecto en Vivo</span>
              </h3>
              {telemetry?.isMoving && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Transmitiendo telemetría en tiempo real
                </span>
              )}
            </div>

            <LiveTrackingMap order={order} heightClass="h-[360px]" showDetailsBar={false} />
          </div>

          {/* Ficha de Detalles de Entrega y Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Destino y Conductor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-800 border-b pb-1 text-xs uppercase tracking-wider">
                Información de Destino
              </h4>
              <p>
                <strong className="text-slate-700">Dirección:</strong> {order.deliveryLocation.address} ({order.deliveryLocation.district})
              </p>
              <p>
                <strong className="text-slate-700">Referencia:</strong> {order.deliveryLocation.reference || 'Sin referencia'}
              </p>
              <p>
                <strong className="text-slate-700">Teléfono Contacto:</strong> {order.customer.phone}
              </p>
              {order.notes && (
                <p className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900">
                  <strong>Nota del Cliente:</strong> {order.notes}
                </p>
              )}
              {telemetry?.phone && (
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-slate-600">Contacto Directo Chofer:</span>
                  <a
                    href={`tel:${telemetry.phone}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{telemetry.phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Resumen de Productos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-800 border-b pb-1 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Productos del Pedido</span>
                <span>Total: {formatPEN(order.total)}</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                    <div>
                      <span className="font-bold text-slate-800">{it.productName}</span>
                      <span className="text-slate-500 block text-[11px]">{it.presentation} x {it.quantity} unid.</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatPEN(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {order.deliveryProof && (
                <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>Recibido por:</strong> {order.deliveryProof.receivedBy} a las {new Date(order.deliveryProof.deliveredAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Cerrar Vista de Rastreo
          </button>
        </div>
      </div>
    </div>
  );
};
