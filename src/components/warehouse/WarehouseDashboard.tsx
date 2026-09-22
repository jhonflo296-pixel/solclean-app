import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Order, OrderStatus } from '../../types';
import { WarehouseFleetOverviewMap } from '../map/WarehouseFleetOverviewMap';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { formatPEN, formatDate, getStatusDetails } from '../../utils/formatters';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Layers, 
  BellRing,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface Props {
  onOpenOrderDetails?: (order: Order) => void;
}

export const WarehouseDashboard: React.FC<Props> = ({ onOpenOrderDetails }) => {
  const { 
    orders, 
    workers, 
    products, 
    updateOrderStatus, 
    assignWorker, 
    startDriverRoute 
  } = useAppStore();

  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'manana' | 'semana'>('todos');
  const [activeTab, setActiveTab] = useState<'mapa' | 'pedidos' | 'inventario'>('pedidos');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Filtrado de pedidos según fecha para evitar cuellos de botella
  const filteredOrders = orders.filter((o) => {
    if (dateFilter === 'hoy') return o.scheduledDate === todayStr;
    if (dateFilter === 'manana') return o.scheduledDate === tomorrowStr;
    if (dateFilter === 'semana') return o.scheduledDate >= todayStr;
    return true;
  });

  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const inPickingOrders = orders.filter((o) => o.status === 'en_preparacion');
  const readyOrders = orders.filter((o) => o.status === 'listo_despacho');
  const inTransitOrders = orders.filter((o) => o.status === 'en_camino');
  const deliveredOrders = orders.filter((o) => o.status === 'entregado');

  // Productos con stock crítico
  const lowStockProducts = products.filter((p) => p.totalStock <= p.minStockAlert);

  const operarios = workers.filter((w) => w.role === 'operario');
  const repartidores = workers.filter((w) => w.role === 'repartidor');

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Alerta Activa para el Jefe de Almacén (Sustituye WhatsApp) */}
      {pendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-lg border-2 border-amber-300 flex flex-wrap items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
              <BellRing className="w-6 h-6 text-amber-600 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-950 text-[#ffcc33] text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  ¡ATENCIÓN JEFE DE ALMACÉN!
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {pendingOrders.length} pedido(s) nuevo(s) recibido(s) por el sistema
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1">
                Último pedido: <strong>{pendingOrders[0].orderNumber}</strong> ({pendingOrders[0].customer.name}) en{' '}
                <strong>{pendingOrders[0].deliveryLocation.district}</strong> con entrega programada para{' '}
                <strong>{pendingOrders[0].scheduledDate}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDateFilter('todos');
                setActiveTab('pedidos');
              }}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Atender en Cola de Almacén
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards del Almacén */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Pendientes</span>
            <span className="text-xl font-black text-slate-900">{pendingOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0066cc] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">En Picking</span>
            <span className="text-xl font-black text-slate-900">{inPickingOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Listos Salida</span>
            <span className="text-xl font-black text-slate-900">{readyOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">En Ruta (GPS)</span>
            <span className="text-xl font-black text-slate-900">{inTransitOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Entregados</span>
            <span className="text-xl font-black text-slate-900">{deliveredOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Selector de Vistas y Filtro por Fecha (Anti-Cuellos de Botella) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pestañas de Vista */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'bg-[#0066cc] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Cola de Despachos ({filteredOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mapa'
                ? 'bg-[#0066cc] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Torre de Control Satelital</span>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inventario'
                ? 'bg-[#0066cc] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Stock de Almacén</span>
            {lowStockProducts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            )}
          </button>
        </div>

        {/* Filtros por Fecha de Entrega */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Organizar por Fecha:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'hoy', label: 'Hoy' },
              { id: 'manana', label: 'Mañana' },
              { id: 'semana', label: 'Esta Semana' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as typeof dateFilter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  dateFilter === f.id
                    ? 'bg-blue-100 text-[#0066cc] font-bold border border-blue-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VISTA 1: TORRE DE CONTROL SATELITAL */}
      {activeTab === 'mapa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0066cc]" />
                <span>Monitoreo Geográfico de Despachos y Flota en Lima</span>
              </h2>
              <p className="text-xs text-slate-500">
                Visualiza los puntos de entrega de los clientes y las camionetas en tránsito con su ruta recorrida.
              </p>
            </div>
          </div>

          <WarehouseFleetOverviewMap
            orders={orders}
            onSelectOrder={(ord) => setSelectedOrderForTracking(ord)}
          />

          {selectedOrderForTracking && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Inspección Detallada de Seguridad: {selectedOrderForTracking.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Cerrar Inspección
                </button>
              </div>
              <LiveTrackingMap order={selectedOrderForTracking} heightClass="h-[380px]" />
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: COLA DE PEDIDOS Y GESTIÓN DE DESPACHOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Despachos Programados ({filteredOrders.length} pedidos)
            </h2>
            <span className="text-xs text-slate-500">
              Asigna operarios de picking y repartidores para agilizar los despachos
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No hay pedidos para la fecha seleccionada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusDetails(order.status);
                const isPending = order.status === 'pendiente';
                const isInPicking = order.status === 'en_preparacion';
                const isReady = order.status === 'listo_despacho';
                const isInTransit = order.status === 'en_camino';
                const isDelivered = order.status === 'entregado';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-300 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    {/* Info Cliente & Fecha */}
                    <div className="space-y-1.5 flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-[#0066cc] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {order.orderNumber}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        {order.scheduledDate === todayStr && (
                          <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            ¡Para Hoy!
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {order.customer.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <strong>{order.deliveryLocation.district}</strong>: {order.deliveryLocation.address}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Entrega: <strong>{formatDate(order.scheduledDate)}</strong> ({order.scheduledTimeWindow})
                        </span>
                      </div>

                      {order.notes && (
                        <p className="text-[11px] bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200 max-w-xl">
                          <strong>Nota:</strong> {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Resumen de Productos */}
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 w-full lg:w-64 space-y-1">
                      <div className="font-bold text-slate-700 flex justify-between">
                        <span>{order.items.length} productos</span>
                        <span className="text-[#0066cc]">{formatPEN(order.total)}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-2">
                        {order.items.map((i) => `${i.productName} (${i.presentation} x${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    {/* Asignación y Acciones del Jefe */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                      {/* Asignar Operario de Picking */}
                      {(isPending || isInPicking) && (
                        <div className="flex flex-col text-xs">
                          <label className="text-[10px] text-slate-500 font-semibold mb-0.5">Operario Picking:</label>
                          <select
                            value={order.assignedWorkerId || ''}
                            onChange={(e) => assignWorker(order.id, e.target.value)}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar operario...</option>
                            {operarios.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.status})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Asignar Chofer Repartidor */}
                      {(isInPicking || isReady) && (
                        <div className="flex flex-col text-xs">
                          <label className="text-[10px] text-slate-500 font-semibold mb-0.5">Repartidor:</label>
                          <select
                            value={order.assignedDriverId || ''}
                            onChange={(e) => assignWorker(order.id, e.target.value)}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar chofer...</option>
                            {repartidores.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.vehiclePlate})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Botón de Despacho Inmediato */}
                      {isReady && order.assignedDriverId && (
                        <button
                          type="button"
                          onClick={() => startDriverRoute(order.id, order.assignedDriverId!)}
                          className="px-3.5 py-2 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#ffcc33]" />
                          <span>Despachar a Ruta GPS</span>
                        </button>
                      )}

                      {/* En tránsito - Ver mapa en vivo */}
                      {isInTransit && (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Ver GPS en Vivo</span>
                        </button>
                      )}

                      {/* Ver Ficha */}
                      {onOpenOrderDetails && (
                        <button
                          type="button"
                          onClick={() => onOpenOrderDetails(order)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition"
                          title="Ver Ficha Completa"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 3: INVENTARIO FÍSICO DE ALMACÉN */}
      {activeTab === 'inventario' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Existencias Físicas en Almacén Central
              </h2>
              <p className="text-xs text-slate-500">
                Monitorea el inventario de productos terminados para evitar desabastecimiento.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Presentaciones</th>
                  <th className="py-2.5 px-3">Stock Total</th>
                  <th className="py-2.5 px-3">Alerta Mínima</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((prod) => {
                  const isLow = prod.totalStock <= prod.minStockAlert;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{prod.sku}</span>
                      </td>
                      <td className="py-3 px-3">{prod.category}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {prod.presentations.map((pr) => (
                            <span
                              key={pr.size}
                              className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold"
                            >
                              {pr.size}: {pr.stock} un.
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-sm text-slate-900">{prod.totalStock}</span> unid.
                      </td>
                      <td className="py-3 px-3 text-slate-500">{prod.minStockAlert} unid.</td>
                      <td className="py-3 px-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Stock Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Óptimo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
