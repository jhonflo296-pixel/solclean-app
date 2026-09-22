import React from 'react';
import { useAppStore } from '../../store/appStore';
import { formatPEN } from '../../utils/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, clearCart } = useAppStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.presentation.price * item.quantity,
    0
  );
  const igv = subtotal * 0.18;
  const estimatedDelivery = subtotal > 150 ? 0 : 15.0; // Delivery gratis por compras mayores a S/ 150
  const total = subtotal + igv + estimatedDelivery;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-[#0066cc] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ffcc33]" />
              <h2 className="font-bold text-base">Mi Carrito de Compras</h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {cart.length} productos
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingBag className="w-16 h-16 text-slate-300 mb-3" />
                <p className="font-bold text-slate-700">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explora nuestro catálogo de productos de limpieza institucional y agrega los insumos que necesitas.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#0066cc] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-[#004d99]"
                >
                  Ver Catálogo Sol Clean
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = item.presentation.price * item.quantity;
                return (
                  <div
                    key={`${item.product.id}-${item.presentation.size}`}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.product.name}
                      </h4>
                      <span className="inline-block text-[11px] text-[#0066cc] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-0.5">
                        {item.presentation.size}
                      </span>
                      <div className="text-xs font-black text-slate-900 mt-1">
                        {formatPEN(item.presentation.price)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.presentation.size,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.presentation.size,
                              item.quantity + 1
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-[#0066cc]">
                        {formatPEN(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatPEN(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>I.G.V. (18%):</span>
                  <span className="font-semibold text-slate-800">{formatPEN(igv)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Costo Estimado de Envío:</span>
                  <span className="font-semibold text-slate-800">
                    {estimatedDelivery === 0 ? (
                      <strong className="text-emerald-600">¡GRATIS!</strong>
                    ) : (
                      formatPEN(estimatedDelivery)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Total Estimado:</span>
                  <span className="text-[#0066cc] text-lg">{formatPEN(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rastreo satelital GPS incluido sin costo adicional</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  title="Vaciar carrito"
                  className="p-2.5 rounded-lg border border-slate-300 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="flex-1 py-3 px-4 bg-[#ffcc33] hover:bg-[#e6b800] text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition shadow-md active:scale-95"
                >
                  <span>Continuar con Mapa GPS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
