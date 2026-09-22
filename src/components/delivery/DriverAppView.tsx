import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Order } from '../../types';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { DispatchGuideModal } from '../common/DispatchGuideModal';
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
  Compass,
  FileText,
  AlertOctagon,
  Camera,
  Check
} from 'lucide-react';

export const DriverAppView: React.FC = () => {
  const { 
    orders, 
    workers, 
    startDriverRoute, 
    confirmDelivery, 
    stepSimulationForward,
    fastForwardSimulation,
    triggerPanicAlert,
    simulateRouteDeviation
  } = useAppStore();

  const [selectedDriverId, setSelectedDriverId] = useState('driver-1');
  const [receivingPersonName, setReceivingPersonName] = useState('');
  const [receivingDni, setReceivingDni] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [confirmModalOrder, setConfirmModalOrder] = useState<Order | null>(null);
  const [guideModalOrder, setGuideModalOrder] = useState<Order | null>(null);

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
    setReceivingDni(order.customer.dniRuc || '');
    setSignatureData(null);
    setPhotoProof(null);
    setDeliveryNotes('');
  };

  const handleFinalizeDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModalOrder) return;

    confirmDelivery(confirmModalOrder.id, {
      receivedBy: receivingPersonName || 'Recepción / Cliente',
      dniRuc: receivingDni,
      signatureDataUrl: signatureData || undefined,
      photoProofUrl: photoProof || undefined,
      notes: deliveryNotes,
    });

    setConfirmModalOrder(null);
    setDeliveryNotes('');
    setSignatureData(null);
    setPhotoProof(null);
  };

  const handleSimulatePhoto = () => {
    // Foto de entrega simulada representativa con marca de agua
    setPhotoProof('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80');
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
                onClick={() => setGuideModalOrder(currentActiveOrder)}
                className="px-3 py-2 bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition border border-white/20 flex items-center gap-1 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-blue-300" />
                <span>Guía SUNAT</span>
              </button>

              <button
                type="button"
                onClick={() => simulateRouteDeviation(currentActiveOrder.id)}
                title="Prueba de desvío no autorizado para auditoría"
                className="px-2.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition border border-orange-400/80 flex items-center gap-1 shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test Desvío</span>
              </button>

              <button
                type="button"
                onClick={() => triggerPanicAlert(currentActiveOrder.id, 'Alerta de Auxilio SOS emitida desde cabina')}
                title="Botón de Pánico SOS en Ruta"
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition shadow-md animate-pulse flex items-center gap-1"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-300" />
                <span>SOS PÁNICO</span>
              </button>

              <button
                type="button"
                onClick={() => stepSimulationForward(currentActiveOrder.id)}
                title="Avanza 1 tramo en la ruta de Lima inmediatamente"
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition backdrop-blur-sm border border-white/20 active:scale-95 flex items-center gap-1"
              >
                <span>⏩ Avanzar Paso</span>
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

          {/* Banner de Alerta de Seguridad Activa */}
          {currentActiveOrder.telemetry?.securityAlert && !currentActiveOrder.telemetry.securityAlert.resolved && (
            <div className="mx-4 bg-red-600 text-white p-3 rounded-xl flex items-center justify-between gap-3 animate-pulse border-2 border-red-300 shadow-md">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-6 h-6 text-amber-300 shrink-0" />
                <div>
                  <strong className="text-xs uppercase font-black">{currentActiveOrder.telemetry.securityAlert.title}</strong>
                  <p className="text-[11px] text-red-100">{currentActiveOrder.telemetry.securityAlert.description}</p>
                </div>
              </div>
              <span className="text-[10px] bg-red-950 text-amber-300 px-2 py-1 rounded font-mono font-bold shrink-0">
                AUDITORÍA EN VIVO
              </span>
            </div>
          )}

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

            {/* Panel de Vía Urbana y Notificación al Cliente */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                    EN VÍA PÚBLICA
                  </span>
                  <span className="text-slate-400">
                    Última actualización GPS: <strong className="text-white">{currentActiveOrder.telemetry?.lastUpdated}</strong>
                  </span>
                </div>
                <p className="text-sm font-black text-white flex items-center gap-2">
                  <span>🚗 Circulando por:</span>
                  <span className="text-amber-300 font-extrabold">{currentActiveOrder.telemetry?.currentStreet || 'Calles de Lima'}</span>
                </p>
                {currentActiveOrder.telemetry?.nextStreet && (
                  <p className="text-xs text-slate-300">
                    ↪ Próximo giro: <strong className="text-cyan-300">{currentActiveOrder.telemetry.nextStreet}</strong>
                  </p>
                )}
              </div>

              {currentActiveOrder.telemetry?.proximityAlert && (
                <div className="bg-slate-800 border border-slate-600 p-2.5 rounded-lg max-w-sm">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">
                    Notificación enviada al Cliente:
                  </span>
                  <p className="text-[11px] text-slate-200 mt-0.5 italic">
                    "{currentActiveOrder.telemetry.proximityAlert.message}"
                  </p>
                </div>
              )}
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
                <button
                  type="button"
                  onClick={() => setGuideModalOrder(currentActiveOrder)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition border border-slate-300 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ver Guía de Remisión SUNAT</span>
                </button>

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
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">
            No tienes ninguna ruta activa en este momento
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Revisa abajo tu lista de despachos programados asignados a tu unidad y presiona "Iniciar Ruta" cuando cargues la camioneta.
          </p>
        </div>
      )}

      {/* LISTADO DE PEDIDOS DEL REPARTIDOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Mis Despachos Asignados ({driverOrders.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pedidos asignados a tu camioneta para entrega el día de hoy
            </p>
          </div>
        </div>

        {driverOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay despachos pendientes asignados a {activeDriver?.name}.
          </div>
        ) : (
          <div className="space-y-3">
            {driverOrders.map((order) => {
              const isEnCamino = order.status === 'en_camino';
              const isDelivered = order.status === 'entregado';
              const isReady = order.status === 'listo_despacho';

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isEnCamino
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                      : isDelivered
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        Entrega: {formatDate(order.scheduledDate)} ({order.scheduledTimeWindow})
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {order.customer.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        <strong>{order.deliveryLocation.district}</strong>: {order.deliveryLocation.address}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px]">
                      {order.items.map((i) => `${i.productName} (${i.presentation} x${i.quantity})`).join(', ')}
                    </div>

                    {order.deliveryProof && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded w-fit">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Recibido por: <strong>{order.deliveryProof.receivedBy}</strong> ({order.deliveryProof.dniRuc || 'Firma OK'})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setGuideModalOrder(order)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-300 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Guía SUNAT</span>
                    </button>

                    {isReady && !currentActiveOrder && (
                      <button
                        type="button"
                        onClick={() => handleStartRoute(order)}
                        className="w-full md:w-auto px-4 py-2.5 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-current text-[#ffcc33]" />
                        <span>Iniciar Ruta y GPS</span>
                      </button>
                    )}

                    {isEnCamino && (
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                        Ruta en curso activa
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

      {/* Modal para Confirmar Entrega en Puerta del Cliente con Firma Digital Canvas y Foto POD */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 my-8">
            <div className="flex items-center gap-3 text-emerald-700 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Prueba de Entrega Digital (POD)
                </h3>
                <p className="text-xs text-slate-500">
                  Orden: {confirmModalOrder.orderNumber} - {confirmModalOrder.customer.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleFinalizeDelivery} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Persona que recibe *
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
                    DNI / RUC del receptor *
                  </label>
                  <input
                    type="text"
                    required
                    value={receivingDni}
                    onChange={(e) => setReceivingDni(e.target.value)}
                    placeholder="DNI (8 dígitos) / RUC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* LIENZO DE FIRMA DIGITAL TÁCTIL CANVAS */}
              <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/40">
                <DigitalSignaturePad
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                />
                {signatureData && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center justify-between text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Firma de conformidad registrada
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignatureData(null)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Volver a firmar
                    </button>
                  </div>
                )}
              </div>

              {/* FOTO DE ENTREGA / PRUEBA VISUAL */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Fotografía de Recepción del Producto
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSimulatePhoto}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition text-xs"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{photoProof ? 'Reemplazar Foto' : 'Tomar / Adjuntar Foto'}</span>
                  </button>

                  {photoProof && (
                    <div className="flex items-center gap-2">
                      <img
                        src={photoProof}
                        alt="Prueba de entrega"
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold">Foto adjunta</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observaciones de Entrega
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ej: Se entregó con guía de remisión conforme y bidones sellados de fábrica..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <p>📍 <strong>GPS Certificado:</strong> Coordenadas registradas automáticamente en destino</p>
                <p>🕒 <strong>Hora de recepción:</strong> {new Date().toLocaleTimeString()} ({new Date().toLocaleDateString('es-PE')})</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setConfirmModalOrder(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalizar y Guardar Entrega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Guía de Remisión SUNAT */}
      <DispatchGuideModal
        order={guideModalOrder}
        isOpen={!!guideModalOrder}
        onClose={() => setGuideModalOrder(null)}
      />
    </div>
  );
};
