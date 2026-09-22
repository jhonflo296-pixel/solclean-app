import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { DeliveryLocation, Order } from '../../types';
import { OrderLocationPickerMap } from '../map/OrderLocationPickerMap';
import { formatPEN } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  Calendar, 
  CreditCard, 
  User, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, createOrder } = useAppStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDniRuc, setCustomerDniRuc] = useState('');

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>({
    lat: -12.1215,
    lng: -77.0298,
    address: 'Av. José Larco 1120',
    reference: 'Frente a Larcomar, cerca al parque Salazar',
    district: 'Miraflores',
    city: 'Lima',
  });

  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTimeWindow, setScheduledTimeWindow] = useState('09:00 - 13:00');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'plin' | 'transferencia' | 'contraentrega'>('yape');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.presentation.price * item.quantity,
    0
  );
  const igv = subtotal * 0.18;
  const deliveryFee = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + igv + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo o razón social.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('Por favor ingresa un número de teléfono o celular válido (9 dígitos).');
      return;
    }
    if (!deliveryLocation.address.trim()) {
      setErrorMessage('Por favor especifica la dirección de entrega.');
      return;
    }

    try {
      const newOrder = createOrder({
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || 'cliente@solclean.pe',
          dniRuc: customerDniRuc,
        },
        deliveryLocation,
        paymentMethod,
        scheduledDate,
        scheduledTimeWindow,
        notes,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }

      onClose();
      onOrderSuccess(newOrder);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al procesar el pedido';
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0066cc] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ffcc33]" />
            <div>
              <h2 className="font-bold text-base leading-tight">
                Finalizar Pedido con Geolocalización GPS
              </h2>
              <p className="text-xs text-blue-100">
                Tu pedido se notificará en tiempo real al Almacén Central de Sol Clean Perú
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sección 1: Datos del Comprador */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-1.5">
              <User className="w-4 h-4 text-[#0066cc]" />
              <span>1. Datos de Contacto y Facturación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nombre Completo / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Distribuidora Lima Norte SAC o Juan Pérez"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Teléfono Móvil / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  DNI o RUC (Opcional para Factura)
                </label>
                <input
                  type="text"
                  value={customerDniRuc}
                  onChange={(e) => setCustomerDniRuc(e.target.value)}
                  placeholder="Ej: 20601894211"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Geolocalización en el Mapa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-1.5">
              <MapPin className="w-4 h-4 text-[#0066cc]" />
              <span>2. Ubicación Exacta de Entrega (Mapa GPS)</span>
            </div>

            <OrderLocationPickerMap
              selectedLocation={deliveryLocation}
              onChangeLocation={(updated) =>
                setDeliveryLocation((prev) => ({ ...prev, ...updated }))
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Dirección Escrita / Número / Urbanización *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation.address}
                  onChange={(e) =>
                    setDeliveryLocation({ ...deliveryLocation, address: e.target.value })
                  }
                  placeholder="Ej: Av. Las Begonias 450, Piso 8"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Referencia de Entrega
                </label>
                <input
                  type="text"
                  value={deliveryLocation.reference}
                  onChange={(e) =>
                    setDeliveryLocation({ ...deliveryLocation, reference: e.target.value })
                  }
                  placeholder="Ej: Frente al parque, rejas negras, timbre 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Fecha Programada de Despacho (Evita Cuellos de Botella) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-1.5">
              <Calendar className="w-4 h-4 text-[#0066cc]" />
              <span>3. Fecha y Franja Horaria Programada</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Fecha de Despacho Deseada
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Franja Horaria de Entrega
                </label>
                <select
                  value={scheduledTimeWindow}
                  onChange={(e) => setScheduledTimeWindow(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="09:00 - 13:00">Turno Mañana (09:00 AM - 01:00 PM)</option>
                  <option value="14:00 - 18:00">Turno Tarde (02:00 PM - 06:00 PM)</option>
                  <option value="Urgente Express">Despacho Urgente Express (Hoy Mismo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 4: Método de Pago */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-1.5">
              <CreditCard className="w-4 h-4 text-[#0066cc]" />
              <span>4. Método de Pago</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'yape', label: 'Yape', desc: 'Billetera BCP' },
                { id: 'plin', label: 'Plin', desc: 'BBVA / Scotiabank / Interbank' },
                { id: 'transferencia', label: 'Transferencia BCP', desc: 'Depósito a Cta Cte' },
                { id: 'contraentrega', label: 'Contraentrega', desc: 'Efectivo al recibir' },
              ].map((p) => {
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id as typeof paymentMethod)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col ${
                      isSelected
                        ? 'border-[#0066cc] bg-blue-50 ring-2 ring-[#0066cc]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-900">{p.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Instrucciones Adicionales o Notas para Almacén
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Dejar con vigilante en garita, traer factura impresa..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Resumen Final de Compra */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cart.length} ítems):</span>
              <span className="font-semibold text-slate-800">{formatPEN(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>I.G.V. (18%):</span>
              <span className="font-semibold text-slate-800">{formatPEN(igv)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Envío Logístico por Zona:</span>
              <span className="font-semibold text-slate-800">
                {deliveryFee === 0 ? <strong className="text-emerald-600">¡GRATIS!</strong> : formatPEN(deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total a Pagar:</span>
              <span className="text-[#0066cc] text-xl">{formatPEN(total)}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#0066cc] hover:bg-[#004d99] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-[#ffcc33]" />
              <span>Confirmar y Enviar Pedido a Almacén</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
