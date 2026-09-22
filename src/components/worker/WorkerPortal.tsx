import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Order } from '../../types';
import { formatPEN, formatDate } from '../../utils/formatters';
import { 
  Layers, 
  CheckSquare, 
  Square, 
  PackageCheck, 
  Clock, 
  AlertCircle, 
  User,
  MapPin,
  Calendar
} from 'lucide-react';

export const WorkerPortal: React.FC = () => {
  const { orders, workers, toggleItemPicked, updateOrderStatus } = useAppStore();
  const [selectedWorkerId, setSelectedWorkerId] = useState('work-1');

  const operarios = workers.filter((w) => w.role === 'operario');
  const activeWorker = operarios.find((w) => w.id === selectedWorkerId) || operarios[0];

  // Pedidos que requieren picking
  const pickingOrders = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Cabecera del Operario */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0066cc] flex items-center justify-center text-white shadow-md">
            <Layers className="w-6 h-6 text-[#ffcc33]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#ffcc33] text-slate-950 px-2 py-0.5 rounded">
                OPERARIO DE ALMACÉN
              </span>
              <span className="text-xs text-blue-300">
                Módulo de Picking y Armado de Cajas
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {activeWorker?.name || 'Operario de Almacén'}
            </h2>
            <p className="text-xs text-slate-400">
              Verifica cada producto en las estanterías antes de pasar al área de despacho
            </p>
          </div>
        </div>

        {/* Selector de Operario */}
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-xs">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Operario:</span>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="bg-slate-900 text-white px-2.5 py-1 rounded border border-slate-600 focus:outline-none font-semibold"
          >
            {operarios.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Pedidos en Picking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#0066cc]" />
            <span>Órdenes Pendientes de Armado ({pickingOrders.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            Marca el checkbox de cada producto conforme lo colocas en la caja/palet
          </span>
        </div>

        {pickingOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
            <CheckSquare className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">¡Al día! No hay pedidos pendientes de armado.</p>
            <p className="text-slate-500 mt-1">Los nuevos pedidos de los clientes aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pickingOrders.map((order) => {
              const allPicked = order.items.every((it) => it.picked);
              const totalItems = order.items.reduce((s, it) => s + it.quantity, 0);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                    allPicked ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Encabezado del Pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-[#0066cc] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {order.customer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {order.deliveryLocation.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Fecha de entrega: <strong>{formatDate(order.scheduledDate)}</strong> ({order.scheduledTimeWindow})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total a Armar:</span>
                      <span className="font-extrabold text-sm text-slate-900">{totalItems} unidades</span>
                    </div>
                  </div>

                  {/* Checklist de Productos (Picking) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 block">
                        Lista de Verificación de Insumos:
                      </span>
                      {!allPicked && (
                        <button
                          type="button"
                          onClick={() => {
                            order.items.forEach((it) => {
                              if (!it.picked) {
                                toggleItemPicked(order.id, it.productId, it.presentation);
                              }
                            });
                          }}
                          className="text-[11px] text-[#0066cc] hover:underline font-bold"
                        >
                          ⚡ Marcar todos como recogidos
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {order.items.map((item) => {
                        const isPicked = !!item.picked;
                        return (
                          <div
                            key={`${item.productId}-${item.presentation}`}
                            onClick={() =>
                              toggleItemPicked(order.id, item.productId, item.presentation)
                            }
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition ${
                              isPicked
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isPicked ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400 shrink-0" />
                              )}
                              <div>
                                <span className={`text-xs font-bold ${isPicked ? 'line-through opacity-75' : ''}`}>
                                  {item.productName}
                                </span>
                                <span className="block text-[11px] text-slate-500">
                                  Presentación: <strong>{item.presentation}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm">
                                Cantidad: {item.quantity} unid.
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Botón de Confirmación de Picking */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    {allPicked ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                        ¡Todos los productos han sido verificados y colocados en la caja!
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Faltan productos por marcar en el checklist
                      </span>
                    )}

                    {order.status !== 'listo_despacho' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'listo_despacho')}
                        disabled={!allPicked}
                        className={`px-4 py-2 font-bold rounded-xl transition shadow-sm ${
                          allPicked
                            ? 'bg-[#0066cc] hover:bg-[#004d99] text-white active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Marcar como "Listo para Despacho"
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
