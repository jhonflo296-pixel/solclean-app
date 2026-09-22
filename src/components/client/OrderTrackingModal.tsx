import React, { useState } from 'react';
import { Order } from '../../types';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { DispatchGuideModal } from '../common/DispatchGuideModal';
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
  PackageCheck,
  FileText,
  PenTool
} from 'lucide-react';

import { useAppStore } from '../../store/appStore';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<Props> = ({
  order: propOrder,
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { orders } = useAppStore();
  const [selectedId, setSelectedId] = useState<string>(propOrder?.id || '');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  React.useEffect(() => {
    if (propOrder) setSelectedId(propOrder.id);
  }, [propOrder]);

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === selectedId) || propOrder || orders[0];
  if (!currentOrder) return null;

  const statusInfo = getStatusDetails(currentOrder.status);
  const telemetry = currentOrder.telemetry;

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
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">
                  Rastreo en Vivo: {currentOrder.orderNumber}
                </h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cliente: <strong>{currentOrder.customer.name}</strong> • Entrega programada: {formatDate(currentOrder.scheduledDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector rápido de pedidos */}
            <select
              value={currentOrder.id}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const found = orders.find(o => o.id === e.target.value);
                if (found && onSelectOrder) onSelectOrder(found);
              }}
              className="bg-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold focus:outline-none"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.customer.name.substring(0, 18)}... ({o.status})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

          {/* Notificación de Proximidad en Tiempo Real al Cliente */}
          {currentOrder.status === 'en_camino' && telemetry && (
            <div className="space-y-3">
              {/* Alerta de proximidad dinámica */}
              <div className={`p-4 rounded-xl shadow-md border flex flex-wrap items-center justify-between gap-3 transition-all ${
                telemetry.proximityAlert?.level === 'en_puerta'
                  ? 'bg-gradient-to-r from-emerald-800 to-green-900 border-emerald-400 text-white animate-pulse'
                  : telemetry.proximityAlert?.level === 'muy_cerca'
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-amber-300 text-white'
                  : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-blue-500/50 text-white'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black shadow-md ${
                    telemetry.proximityAlert?.level === 'en_puerta'
                      ? 'bg-white text-emerald-800 ring-4 ring-emerald-300'
                      : telemetry.proximityAlert?.level === 'muy_cerca'
                      ? 'bg-white text-orange-600 ring-4 ring-amber-300 animate-bounce'
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    {telemetry.proximityAlert?.level === 'en_puerta' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Truck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                        telemetry.proximityAlert?.level === 'en_puerta'
                          ? 'bg-white text-emerald-900 font-extrabold'
                          : telemetry.proximityAlert?.level === 'muy_cerca'
                          ? 'bg-white text-orange-900 font-extrabold'
                          : 'bg-amber-400 text-slate-950 font-bold'
                      }`}>
                        {telemetry.proximityAlert?.level === 'en_puerta'
                          ? '🔔 ¡PEDIDO EN PUERTA!'
                          : telemetry.proximityAlert?.level === 'muy_cerca'
                          ? '⚡ ¡ATENTO! MUY CERCA A TU DOMICILIO'
                          : '🚗 PEDIDO EN CAMINO CON GPS'}
                      </span>
                      <span className="text-[11px] text-white/80 font-mono">
                        {telemetry.lastUpdated}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white mt-1 leading-snug">
                      {telemetry.proximityAlert?.message || (
                        <>El repartidor <strong>{telemetry.driverName}</strong> está en camino a tu dirección.</>
                      )}
                    </p>

                    {/* Vía urbana actual por donde se desplaza */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-amber-200 border border-white/10 font-medium">
                        🛣 Conduciendo por: <strong>{telemetry.currentStreet || 'Calles de Lima'}</strong>
                      </span>
                      {telemetry.nextStreet && (
                        <span className="text-slate-300 text-[11px]">
                          Próximo giro: <strong className="text-white">{telemetry.nextStreet}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-white/20 text-center min-w-[120px] justify-center">
                  <div>
                    <span className="text-[10px] uppercase text-blue-200 block font-semibold">Llegada Aprox.</span>
                    <span className="text-2xl font-black text-amber-300">
                      {telemetry.etaMinutes <= 1 ? '< 1' : telemetry.etaMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      {telemetry.distanceRemainingKm} km rest.
                    </span>
                  </div>
                </div>
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

            <LiveTrackingMap order={currentOrder} heightClass="h-[360px]" showDetailsBar={false} />
          </div>

          {/* Ficha de Detalles de Entrega y Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Destino y Conductor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-800 border-b pb-1 text-xs uppercase tracking-wider">
                Información de Destino
              </h4>
              <p>
                <strong className="text-slate-700">Dirección:</strong> {currentOrder.deliveryLocation.address} ({currentOrder.deliveryLocation.district})
              </p>
              <p>
                <strong className="text-slate-700">Referencia:</strong> {currentOrder.deliveryLocation.reference || 'Sin referencia'}
              </p>
              <p>
                <strong className="text-slate-700">Teléfono Contacto:</strong> {currentOrder.customer.phone}
              </p>
              {currentOrder.notes && (
                <p className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900">
                  <strong>Nota del Cliente:</strong> {currentOrder.notes}
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
                <span>Total: {formatPEN(currentOrder.total)}</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {currentOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                    <div>
                      <span className="font-bold text-slate-800">{it.productName}</span>
                      <span className="text-slate-500 block text-[11px]">{it.presentation} x {it.quantity} unid.</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatPEN(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {currentOrder.deliveryProof && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-[11px] space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 font-bold">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Comprobante de Entrega Certificada</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      {new Date(currentOrder.deliveryProof.deliveredAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p>
                    <strong>Recibido conforme por:</strong> {currentOrder.deliveryProof.receivedBy}
                    {currentOrder.deliveryProof.dniRuc && ` (DNI/RUC: ${currentOrder.deliveryProof.dniRuc})`}
                  </p>

                  {/* Firma Digital en Canvas si existe */}
                  {currentOrder.deliveryProof.signatureDataUrl && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                        <PenTool className="w-3 h-3 text-blue-600" />
                        Firma Digital Registrada en Pantalla:
                      </span>
                      <img
                        src={currentOrder.deliveryProof.signatureDataUrl}
                        alt="Firma del receptor"
                        className="h-16 max-w-full object-contain mx-auto"
                      />
                    </div>
                  )}

                  {/* Foto de Entrega */}
                  {currentOrder.deliveryProof.photoProofUrl && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-200 flex items-center gap-2">
                      <img
                        src={currentOrder.deliveryProof.photoProofUrl}
                        alt="Foto de entrega"
                        className="w-14 h-14 object-cover rounded-md border"
                      />
                      <span className="text-[10px] text-slate-600 font-medium">
                        Fotografía en puerta registrada por el chofer
                      </span>
                    </div>
                  )}

                  {currentOrder.deliveryProof.notes && (
                    <p className="text-[10px] text-emerald-800 italic">
                      "{currentOrder.deliveryProof.notes}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition border border-slate-300 flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Ver Guía de Remisión SUNAT</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Cerrar Vista de Rastreo
          </button>
        </div>
      </div>

      {/* Modal Guía SUNAT */}
      <DispatchGuideModal
        order={currentOrder}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
