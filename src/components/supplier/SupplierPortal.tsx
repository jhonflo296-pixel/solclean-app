import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { formatPEN, formatDate } from '../../utils/formatters';
import { 
  Building2, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  FileText, 
  Package, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SupplierPortal: React.FC = () => {
  const { supplierOrders, createSupplierOrder, updateSupplierOrderStatus } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('Química Industrial del Pacífico S.A.C.');
  const [supplierRuc, setSupplierRuc] = useState('20109923812');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState('Litros');
  const [cost, setCost] = useState(1500);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    createSupplierOrder({
      supplierName,
      supplierRuc,
      items: [{ rawMaterial: materialName, quantity, unit, cost }],
      expectedDate,
      notes,
    });

    setIsModalOpen(false);
    setMaterialName('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Proveedor */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6 text-[#ffcc33]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#ffcc33] text-slate-950 px-2 py-0.5 rounded">
                PORTAL DE PROVEEDORES
              </span>
              <span className="text-xs text-indigo-300">
                Sol Clean Perú • Abastecimiento y Materia Prima
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Gestión de Insumos Químicos, Envases y Papelería
            </h2>
            <p className="text-xs text-slate-400">
              Conexión directa con la planta y el almacén central para evitar quiebres de inventario
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#ffcc33]" />
          <span>Generar Orden de Insumo</span>
        </button>
      </div>

      {/* Órdenes de Compra a Proveedores */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Órdenes de Abastecimiento hacia Almacén ({supplierOrders.length})</span>
        </h3>

        <div className="space-y-3">
          {supplierOrders.map((po) => {
            const isSolicitado = po.status === 'solicitado';
            const isEnTransito = po.status === 'en_transito';
            const isRecibido = po.status === 'recibido_almacen';

            return (
              <div
                key={po.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {po.code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isRecibido
                          ? 'bg-emerald-100 text-emerald-800'
                          : isEnTransito
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isRecibido
                        ? 'Recibido en Planta'
                        : isEnTransito
                        ? 'En Transporte hacia Almacén'
                        : 'Orden Solicitada'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{po.supplierName}</h4>
                  <p className="text-xs text-slate-500">RUC: {po.supplierRuc} • Fecha esperada: {formatDate(po.expectedDate)}</p>

                  <div className="pt-1 flex flex-wrap gap-2 text-xs text-slate-700">
                    {po.items.map((it, idx) => (
                      <span key={idx} className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                        {it.rawMaterial}: <strong>{it.quantity} {it.unit}</strong> ({formatPEN(it.cost)})
                      </span>
                    ))}
                  </div>

                  {po.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Nota de despacho: {po.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                  <div className="text-right pr-3 hidden sm:block">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Costo Total</span>
                    <span className="text-sm font-black text-slate-900">{formatPEN(po.totalCost)}</span>
                  </div>

                  {isSolicitado && (
                    <button
                      type="button"
                      onClick={() => updateSupplierOrderStatus(po.id, 'en_transito')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Despachar Cisterna/Camión</span>
                    </button>
                  )}

                  {isEnTransito && (
                    <button
                      type="button"
                      onClick={() => updateSupplierOrderStatus(po.id, 'recibido_almacen')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar Ingreso a Almacén</span>
                    </button>
                  )}

                  {isRecibido && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Insumo en Almacén
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para Crear Orden de Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 border-b pb-3">
              <Package className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">
                Nueva Solicitud de Insumos / Materia Prima
              </h3>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Empresa Proveedora
                </label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                >
                  <option value="Química Industrial del Pacífico S.A.C.">
                    Química Industrial del Pacífico S.A.C. (Cloro, Tensoactivos)
                  </option>
                  <option value="Envases Plásticos del Sur S.A.">
                    Envases Plásticos del Sur S.A. (Galoneras, Bidones 20L)
                  </option>
                  <option value="Esencias & Fragancias Andinas SAC">
                    Esencias & Fragancias Andinas SAC (Lavanda, Flores, Limón)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Descripción del Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="Ej: Hipoclorito de sodio al 13%, Galoneras 3.8L, Fragancia Bebé..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unidad</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    <option value="Litros">Litros</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Kilos">Kilos</option>
                    <option value="Tambores 200L">Tambores 200L</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Costo (S/)</label>
                  <input
                    type="number"
                    min={1}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fecha Esperada</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas de Entrega</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Entrega por puerta posterior de planta, requiere montacarga..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Registrar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
