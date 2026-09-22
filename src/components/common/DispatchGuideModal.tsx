import React from 'react';
import { Order } from '../../types';
import { formatDate } from '../../utils/formatters';
import { X, Printer, ShieldCheck, QrCode, Truck, Building2, Calendar } from 'lucide-react';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchGuideModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const guideSeriesNumber = `EG01-${order.orderNumber.replace('SC-2026-', '').padStart(6, '0')}`;
  const totalItemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const estimatedWeightKg = order.items.reduce((sum, it) => {
    const isBidon = it.presentation.toLowerCase().includes('20l') || it.presentation.toLowerCase().includes('bidón');
    const isGalon = it.presentation.toLowerCase().includes('galón') || it.presentation.toLowerCase().includes('3.8');
    const unitKg = isBidon ? 21 : isGalon ? 4.2 : 1.1;
    return sum + unitKg * it.quantity;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Cabecera de la modal (oculta al imprimir) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">Guía de Remisión Electrónica - Remitente (SUNAT)</h2>
              <p className="text-xs text-slate-400">Documento Oficial para Traslado de Bienes Químicos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del Documento SUNAT */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-4 space-y-6 text-slate-800 text-xs">
          {/* Cabecera Principal SUNAT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start border-b border-slate-300 pb-5">
            {/* Datos de Sol Clean */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-[#0066cc]">SOL CLEAN PERÚ S.A.C.</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">RUC 20601894211</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Fabricación y comercialización de productos químicos y soluciones de limpieza e higiene industrial.
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Planta & Almacén Central:</strong> Av. Separadora Industrial / Nicolás de Ayllón, Lima - Perú
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Contacto:</strong> ventas@solcleanperu.com • Tel: (01) 719-4500
              </p>
            </div>

            {/* Recuadro Oficial SUNAT */}
            <div className="border-2 border-slate-800 p-3.5 text-center rounded-lg space-y-1 bg-slate-50">
              <span className="text-xs font-black block tracking-wider">R.U.C. 20601894211</span>
              <span className="text-[11px] font-black uppercase bg-slate-900 text-white px-2 py-1 rounded block">
                GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA
              </span>
              <span className="text-sm font-black font-mono block text-[#0066cc]">Nº {guideSeriesNumber}</span>
            </div>
          </div>

          {/* Datos del Traslado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block mb-1 uppercase text-[10px] tracking-wider text-[#0066cc]">
                1. Información del Traslado
              </span>
              <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-PE')}</p>
              <p><strong>Fecha Inicio Traslado:</strong> {formatDate(order.scheduledDate)} ({order.scheduledTimeWindow})</p>
              <p><strong>Motivo de Traslado:</strong> Venta de mercadería</p>
              <p><strong>Modalidad de Transporte:</strong> Transporte Privado</p>
              <p><strong>Peso Bruto Total Estimado:</strong> {estimatedWeightKg.toFixed(1)} Kg</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1 uppercase text-[10px] tracking-wider text-[#0066cc]">
                2. Datos del Destinatario (Cliente)
              </span>
              <p><strong>Razón Social / Nombre:</strong> {order.customer.name}</p>
              <p><strong>RUC / DNI:</strong> {order.customer.dniRuc || '20601894211'}</p>
              <p><strong>Teléfono:</strong> {order.customer.phone}</p>
              <p><strong>Pedido Sol Clean Ref:</strong> <span className="font-mono font-bold text-blue-700">{order.orderNumber}</span></p>
            </div>
          </div>

          {/* Puntos de Partida y Llegada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-700 block text-[10px] uppercase">Punto de Partida (Origen)</span>
              <p className="font-semibold text-slate-900 mt-1">Planta Central Sol Clean Perú</p>
              <p className="text-slate-600 text-[11px]">Av. Nicolás de Ayllón / Separadora Industrial, Lima</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-700 block text-[10px] uppercase">Punto de Llegada (Destino)</span>
              <p className="font-semibold text-slate-900 mt-1">{order.deliveryLocation.address}</p>
              <p className="text-slate-600 text-[11px]">{order.deliveryLocation.district}, {order.deliveryLocation.city} ({order.deliveryLocation.reference})</p>
            </div>
          </div>

          {/* Datos del Vehículo y Conductor */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
            <span className="font-bold text-blue-900 block text-[10px] uppercase tracking-wider">
              3. Datos del Vehículo y Conductor Autorizado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Vehículo:</span>
                <strong className="text-slate-900">{order.telemetry?.vehicleModel || 'Camioneta Sol Clean Carga'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Número de Placa:</span>
                <strong className="text-blue-700 font-mono text-xs">{order.telemetry?.vehiclePlate || 'B6X-412'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Chofer / Brevete:</span>
                <strong className="text-slate-900">{order.telemetry?.driverName || order.assignedDriverName || 'Carlos Mendoza Rojas'} (Q-42891023)</strong>
              </div>
            </div>
          </div>

          {/* Tabla de Productos / Bienes Trasladados */}
          <div>
            <span className="font-bold text-slate-900 block mb-2 uppercase text-[10px] tracking-wider text-[#0066cc]">
              4. Detalle de Bienes Insumos Químicos y Limpieza Trasladados
            </span>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Descripción del Producto</th>
                    <th className="py-2 px-3">Presentación</th>
                    <th className="py-2 px-3 text-center">Unidad</th>
                    <th className="py-2 px-3 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-500">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.productName}</td>
                      <td className="py-2 px-3 text-slate-600">{item.presentation}</td>
                      <td className="py-2 px-3 text-center text-slate-500">NIU</td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right text-slate-600">Total Bultos / Envases:</td>
                    <td className="py-2 px-3 text-right font-black text-[#0066cc] text-xs">{totalItemsCount} unid.</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pie de Guía con Código QR y Sello Digital */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Simulación visual de Código QR SUNAT */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-slate-900 p-2 rounded-lg flex flex-col items-center justify-center shrink-0 shadow-inner">
                {/* Patrón SVG de Código QR representativo */}
                <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-3-5h2v2h-2v-2zm0 4h2v4h-2v-4zm5-2h2v4h-2v-4z" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-500 leading-snug">
                <span className="font-bold text-slate-800 block">Validación SUNAT en Línea</span>
                <span>RUC: 20601894211</span><br />
                <span className="font-mono text-[9px]">HASH: 9a7f8b2c4e11</span>
              </div>
            </div>

            <div className="sm:col-span-2 text-right text-[10px] text-slate-400 space-y-1">
              <p>Representación impresa de la <strong>Guía de Remisión Electrónica Remitente</strong>.</p>
              <p>Autorizado mediante Resolución de Superintendencia SUNAT N° 000123-2022/SUNAT.</p>
              <p className="text-slate-600 font-semibold">Sol Clean Perú S.A.C. - Sistema Integrado de Control de Flotas y Despacho</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
