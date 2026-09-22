import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Product, Order } from '../../types';
import { formatPEN, formatDate } from '../../utils/formatters';
import { LiveTrackingMap } from '../map/LiveTrackingMap';
import { 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Users, 
  Plus, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  Clock,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, orders, workers, updateProductStock, addProduct, resetToDefaultData } = useAppStore();
  const [selectedAuditOrder, setSelectedAuditOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'kpis' | 'seguridad' | 'catalogo'>('kpis');

  // Modal para agregar producto
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<any>('Hogar');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(15.0);
  const [newProdStock, setNewProdStock] = useState(100);
  const [newProdSku, setNewProdSku] = useState('');

  // Métricas globales
  const totalSales = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const completedOrders = orders.filter((o) => o.status === 'entregado').length;
  const inTransitOrders = orders.filter((o) => o.status === 'en_camino').length;
  const totalProductsCount = products.length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      sku: newProdSku || `SC-${Date.now().toString().slice(-4)}`,
      name: newProdName,
      category: newProdCategory,
      description: newProdDesc || 'Producto de limpieza profesional Sol Clean Perú.',
      image: 'https://www.solcleanperu.com/wp-content/uploads/2024/10/Banner-lejia-1.png',
      presentations: [
        { size: '1 Litro', price: newProdPrice, stock: Math.floor(newProdStock * 0.6) },
        { size: 'Galón (3.8L)', price: newProdPrice * 2.8, stock: Math.floor(newProdStock * 0.4) },
      ],
      basePrice: newProdPrice,
      totalStock: newProdStock,
      minStockAlert: 20,
    });

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdSku('');
  };

  // Descargar reporte CSV
  const handleExportCSV = () => {
    const headers = ['Numero_Pedido', 'Cliente', 'Telefono', 'Distrito', 'Fecha_Entrega', 'Total_PEN', 'Estado', 'Repartidor', 'Placa'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.customer.name}"`,
      o.customer.phone,
      `"${o.deliveryLocation.district}"`,
      o.scheduledDate,
      o.total,
      o.status,
      `"${o.assignedDriverName || 'N/A'}"`,
      `"${o.telemetry?.vehiclePlate || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_solclean_despachos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Administrador */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0066cc] to-sky-400 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#ffcc33]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#ffcc33] text-slate-950 px-2 py-0.5 rounded">
                PANEL ADMINISTRADOR
              </span>
              <span className="text-xs text-blue-300">
                Sol Clean Perú • Gestión Ejecutiva y Seguridad de Flota
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Control de Operaciones, Ventas y Auditoría GPS
            </h2>
            <p className="text-xs text-slate-400">
              Supervisión de cuellos de botella reducidos, rutas de conductores y catálogo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte CSV</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0066cc] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-semibold">Ventas Facturadas</span>
            <span className="text-xl font-black text-slate-900">{formatPEN(totalSales)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-semibold">Unidades con GPS en Ruta</span>
            <span className="text-xl font-black text-slate-900">{inTransitOrders} camionetas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-semibold">Entregas Cumplidas</span>
            <span className="text-xl font-black text-slate-900">{completedOrders} órdenes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-semibold">Eficiencia sin WhatsApp</span>
            <span className="text-xl font-black text-emerald-600">98.5% a tiempo</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas del Administrador */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex gap-2">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'kpis'
              ? 'bg-[#0066cc] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Resumen de Despachos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('seguridad')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'seguridad'
              ? 'bg-[#0066cc] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Auditoría de Seguridad y Rutas Antirrobo</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'catalogo'
              ? 'bg-[#0066cc] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Gestión de Catálogo e Inventario ({totalProductsCount})
        </button>
      </div>

      {/* VISTA 1: RESUMEN DE DESPACHOS */}
      {activeTab === 'kpis' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Historial General de Pedidos</h3>
            <span className="text-xs text-slate-500">Actualizado automáticamente en tiempo real</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="py-2.5 px-3">Pedido</th>
                  <th className="py-2.5 px-3">Cliente / RUC</th>
                  <th className="py-2.5 px-3">Destino (GPS)</th>
                  <th className="py-2.5 px-3">Fecha Programada</th>
                  <th className="py-2.5 px-3">Total (PEN)</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Repartidor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{o.orderNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{o.customer.name}</div>
                      <span className="text-[10px] text-slate-400">{o.customer.phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <strong>{o.deliveryLocation.district}</strong>
                      <span className="block text-[10px] text-slate-500 truncate max-w-xs">{o.deliveryLocation.address}</span>
                    </td>
                    <td className="py-3 px-3">{formatDate(o.scheduledDate)}</td>
                    <td className="py-3 px-3 font-black text-slate-900">{formatPEN(o.total)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {o.assignedDriverName || 'Por asignar'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: AUDITORÍA DE SEGURIDAD Y TELEMETRÍA ANTIRROBO */}
      {activeTab === 'seguridad' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-base font-black">Centro de Seguridad y Auditoría de Trayectos</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Cada camioneta de reparto registra su polilínea de coordenadas minuto a minuto. El sistema valida que la unidad no se desvíe del corredor logístico programado.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lista de vehículos auditados */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Unidades en Ruta o Completadas
              </h4>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {orders
                  .filter((o) => o.telemetry || o.status === 'en_camino' || o.status === 'entregado')
                  .map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedAuditOrder(ord)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        selectedAuditOrder?.id === ord.id
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-blue-700">{ord.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          ord.status === 'en_camino' ? 'bg-purple-100 text-purple-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 truncate">{ord.customer.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Chofer: {ord.assignedDriverName || 'Asignado'} • Placa: {ord.telemetry?.vehiclePlate || 'B6X-412'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Ruta trazada: {ord.telemetry?.pathTraveled?.length || 1} puntos GPS</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Visualización del mapa de auditoría */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              {selectedAuditOrder ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Ruta Recorrida Auditada: {selectedAuditOrder.orderNumber}</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Destino: {selectedAuditOrder.deliveryLocation.district}
                    </span>
                  </div>
                  <LiveTrackingMap order={selectedAuditOrder} heightClass="h-[380px]" />
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MapPin className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Selecciona una orden a la izquierda</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Podrás inspeccionar el camino exacto que recorrió la camioneta sobre el mapa satelital.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: GESTIÓN DE CATÁLOGO */}
      {activeTab === 'catalogo' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Catálogo y Stock de Sol Clean Perú</h3>
              <span className="text-xs text-slate-500">Modifica el stock físico para pruebas en vivo o agrega nuevos productos</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="px-3.5 py-2 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {products.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-white rounded border p-1" />
                  <div>
                    <h5 className="font-bold text-slate-800 line-clamp-1">{p.name}</h5>
                    <span className="text-[10px] text-slate-500 block">{p.category} • SKU: {p.sku}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-slate-600">Stock Total:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={p.totalStock}
                      onChange={(e) => updateProductStock(p.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center border rounded font-black text-slate-900 bg-white"
                    />
                    <span className="text-slate-500">unid.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear Producto */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">
              Agregar Nuevo Producto al Catálogo
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Alcohol Isopropílico 99% Industrial"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    <option value="Hogar">Hogar</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Cocina">Cocina</option>
                    <option value="Baño">Baño</option>
                    <option value="Hoteles">Hoteles</option>
                    <option value="Auto">Auto</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Papelería">Papelería</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="SC-ALC-013"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Precio Base (S/)</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min={1}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Fórmula desinfectante de rápida evaporación..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold rounded-lg shadow"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
