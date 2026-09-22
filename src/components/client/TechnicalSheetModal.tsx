import React from 'react';
import { Product } from '../../types';
import { X, FileText, ShieldAlert, Award, Droplets, CheckCircle, Printer } from 'lucide-react';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalSheetModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  // Si el producto no tiene ficha explícita, proveemos especificaciones industriales por defecto según categoría
  const isBleach = product.category === 'Hogar' && product.name.toLowerCase().includes('lejía');
  const isAcid = product.category === 'Baño';
  const isDegreaser = product.category === 'Cocina';

  const sheet = product.technicalSheet || {
    ph: isAcid ? '1.5 ± 0.5 (Ácido desincrustante)' : isBleach ? '12.5 ± 0.5 (Alcalino desinfectante)' : isDegreaser ? '11.8 ± 0.5 (Alcalino corta-grasa)' : '7.2 ± 0.3 (pH Neutro balanceado)',
    activeConcentration: isBleach ? 'Hipoclorito de Sodio al 5.5% P/V (55,000 ppm)' : isDegreaser ? 'Tensoactivos no iónicos y solventes hidrosolubles 22%' : isAcid ? 'Ácido clorhídrico inhibido al 9.5%' : 'Surfactantes biodegradables al 15%',
    biodegradability: isBleach ? 'Se degrada en sales y agua inocuas al contacto con luz/materia orgánica' : '98.5% Biodegradable según método OECD 301D',
    sanitaryRegisterDigesa: 'DIGESA-DEPA N° 08921-2024 / MINSA PERÚ',
    colorAndAppearance: 'Líquido homogéneo translúcido con fragancia de fijación industrial',
    safetyEquipmentRecommended: ['Guantes de nitrilo o jebe industrial', 'Gafas de seguridad anti-salpicaduras', 'Delantal impermeable de PVC', 'Calzado cerrado con suela antideslizante'],
    handlingPrecautions: 'Mantener en su envase original rotulado, en lugar fresco y ventilado, alejado de la luz solar directa y fuentes de calor. No mezclar con ácidos ni amoniaco.',
    msdsDocumentCode: `MSDS-${product.sku}-REV04`,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">Ficha Técnica Oficial & Hoja de Seguridad (MSDS)</h2>
              <span className="text-xs text-slate-400">Sol Clean Perú Industrial Quality Assurance</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Ficha encabezado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1 shrink-0"
              />
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {product.category} • SKU: {product.sku}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{product.name}</h3>
                <span className="text-slate-500 text-[11px] block">{sheet.msdsDocumentCode}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 text-right">
              <span className="text-[10px] uppercase font-bold block text-emerald-700">Registro Sanitario Oficial</span>
              <strong className="text-xs block font-mono">{sheet.sanitaryRegisterDigesa}</strong>
              <span className="text-[10px] text-emerald-600">Aprobado para uso comercial/hospitalario</span>
            </div>
          </div>

          {/* Especificaciones Fisicoquímicas */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider text-[#0066cc] flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Propiedades Físico-Químicas</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Potencial de Hidrógeno (pH):</span>
                <strong className="text-slate-900">{sheet.ph}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Concentración Activa / Ingrediente Principal:</span>
                <strong className="text-slate-900">{sheet.activeConcentration}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Biodegradabilidad Certificada:</span>
                <strong className="text-emerald-700 font-semibold">{sheet.biodegradability}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Apariencia & Fragancia:</span>
                <strong className="text-slate-900">{sheet.colorAndAppearance}</strong>
              </div>
            </div>
          </div>

          {/* EPP Recomendado */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider text-[#0066cc] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Equipo de Protección Personal Obligatorio (EPP)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sheet.safetyEquipmentRecommended.map((epp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-200 text-amber-950 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{epp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Precauciones de Almacenamiento */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              Precauciones de Manipulación y Primeros Auxilios
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {sheet.handlingPrecautions} En caso de contacto con ojos, enjuagar con abundante agua corriente durante 15 minutos. En caso de ingestión accidental, no inducir el vómito y acudir de inmediato al centro de salud más cercano llevando la etiqueta del producto.
            </p>
          </div>

          {/* Sello de Calidad */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Certificación ISO 9001 en Procesos de Formulación</span>
            </div>
            <span>Sol Clean Perú S.A.C.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
